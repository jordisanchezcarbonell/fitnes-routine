import { supabase } from "./supabase";

export interface WorkoutData {
  dayId: number;
  dayName: string;
  exercises: {
    name: string;
    targetReps: string;
    sets: {
      weight: string;
      reps: string;
      completed: boolean;
    }[];
  }[];
  cardio: {
    type: string;
    duration: string;
    distance: string;
    notes: string;
  };
  notes: string;
}

export interface WorkoutWithId extends WorkoutData {
  id: string;
  date: string;
}

// Guardar entrenamiento en la base de datos
export async function saveWorkoutToDatabase(
  workoutData: WorkoutData
): Promise<string | null> {
  try {
    // 1. Insertar el entrenamiento principal
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        day_id: workoutData.dayId,
        day_name: workoutData.dayName,
        notes: workoutData.notes,
        cardio_type: workoutData.cardio.type,
        cardio_duration: workoutData.cardio.duration
          ? Number.parseInt(workoutData.cardio.duration)
          : null,
        cardio_distance: workoutData.cardio.distance
          ? Number.parseFloat(workoutData.cardio.distance)
          : null,
        cardio_notes: workoutData.cardio.notes,
      })
      .select()
      .single();

    if (workoutError) {
      console.error("Error saving workout:", workoutError);
      return null;
    }

    // 2. Insertar los ejercicios
    for (let i = 0; i < workoutData.exercises.length; i++) {
      const exercise = workoutData.exercises[i];

      const { data: exerciseData, error: exerciseError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_name: exercise.name,
          target_reps: exercise.targetReps,
          exercise_order: i + 1,
        })
        .select()
        .single();

      if (exerciseError) {
        console.error("Error saving exercise:", exerciseError);
        continue;
      }

      // 3. Insertar las series
      const setsToInsert = exercise.sets.map((set, setIndex) => ({
        exercise_id: exerciseData.id,
        set_number: setIndex + 1,
        weight: set.weight ? Number.parseFloat(set.weight) : null,
        reps: set.reps ? Number.parseInt(set.reps) : null,
        completed: set.completed,
      }));

      if (setsToInsert.length > 0) {
        const { error: setsError } = await supabase
          .from("workout_sets")
          .insert(setsToInsert);

        if (setsError) {
          console.error("Error saving sets:", setsError);
        }
      }
    }

    return workout.id;
  } catch (error) {
    console.error("Error in saveWorkoutToDatabase:", error);
    return null;
  }
}

// Obtener todos los entrenamientos usando consultas separadas
export async function getWorkoutsFromDatabase(): Promise<WorkoutWithId[]> {
  try {
    // 1. Obtener todos los entrenamientos
    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select("*")
      .order("date", { ascending: false });

    if (workoutsError) {
      console.error("Error fetching workouts:", workoutsError);
      return [];
    }

    if (!workouts || workouts.length === 0) {
      return [];
    }

    // 2. Obtener ejercicios para todos los entrenamientos
    const workoutIds = workouts.map((w) => w.id);
    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*")
      .in("workout_id", workoutIds)
      .order("exercise_order", { ascending: true });

    if (exercisesError) {
      console.error("Error fetching exercises:", exercisesError);
      return [];
    }

    // 3. Obtener series para todos los ejercicios
    const exerciseIds = exercises?.map((e) => e.id) || [];
    let sets: any[] = [];

    if (exerciseIds.length > 0) {
      const { data: setsData, error: setsError } = await supabase
        .from("workout_sets")
        .select("*")
        .in("exercise_id", exerciseIds)
        .order("set_number", { ascending: true });

      if (setsError) {
        console.error("Error fetching sets:", setsError);
      } else {
        sets = setsData || [];
      }
    }

    // 4. Transformar los datos al formato esperado
    return workouts.map((workout: any) => {
      const workoutExercises =
        exercises?.filter((e) => e.workout_id === workout.id) || [];

      return {
        id: workout.id,
        date: workout.date,
        dayId: workout.day_id,
        dayName: workout.day_name,
        notes: workout.notes || "",
        cardio: {
          type: workout.cardio_type || "",
          duration: workout.cardio_duration?.toString() || "",
          distance: workout.cardio_distance?.toString() || "",
          notes: workout.cardio_notes || "",
        },
        exercises: workoutExercises.map((exercise: any) => {
          const exerciseSets = sets.filter(
            (s) => s.exercise_id === exercise.id
          );

          return {
            name: exercise.exercise_name,
            targetReps: exercise.target_reps || "",
            sets: exerciseSets.map((set: any) => ({
              weight: set.weight?.toString() || "",
              reps: set.reps?.toString() || "",
              completed: set.completed || false,
            })),
          };
        }),
      };
    });
  } catch (error) {
    console.error("Error in getWorkoutsFromDatabase:", error);
    return [];
  }
}

// Obtener el último entrenamiento de un día específico
export async function getLastWorkoutForDay(
  dayId: number
): Promise<WorkoutWithId | null> {
  try {
    // 1. Obtener el último entrenamiento del día
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("day_id", dayId)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (workoutError || !workout) {
      return null;
    }

    // 2. Obtener ejercicios del entrenamiento
    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", workout.id)
      .order("exercise_order", { ascending: true });

    if (exercisesError) {
      console.error("Error fetching exercises:", exercisesError);
      return null;
    }

    // 3. Obtener series de los ejercicios
    const exerciseIds = exercises?.map((e) => e.id) || [];
    let sets: any[] = [];

    if (exerciseIds.length > 0) {
      const { data: setsData, error: setsError } = await supabase
        .from("workout_sets")
        .select("*")
        .in("exercise_id", exerciseIds)
        .order("set_number", { ascending: true });

      if (setsError) {
        console.error("Error fetching sets:", setsError);
      } else {
        sets = setsData || [];
      }
    }

    // 4. Transformar al formato esperado
    return {
      id: workout.id,
      date: workout.date,
      dayId: workout.day_id,
      dayName: workout.day_name,
      notes: workout.notes || "",
      cardio: {
        type: workout.cardio_type || "",
        duration: workout.cardio_duration?.toString() || "",
        distance: workout.cardio_distance?.toString() || "",
        notes: workout.cardio_notes || "",
      },
      exercises:
        exercises?.map((exercise: any) => {
          const exerciseSets = sets.filter(
            (s) => s.exercise_id === exercise.id
          );

          return {
            name: exercise.exercise_name,
            targetReps: exercise.target_reps || "",
            sets: exerciseSets.map((set: any) => ({
              weight: set.weight?.toString() || "",
              reps: set.reps?.toString() || "",
              completed: set.completed || false,
            })),
          };
        }) || [],
    };
  } catch (error) {
    console.error("Error in getLastWorkoutForDay:", error);
    return null;
  }
}

// Función para verificar la conexión a la base de datos
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Database connection test failed:", error);
      return false;
    }

    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection test error:", error);
    return false;
  }
}
