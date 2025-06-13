"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, Dumbbell, Activity, Trash2 } from "lucide-react";
import { deleteWorkoutFromDatabase } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface HistoryViewProps {
  workouts: any[];
  workoutDays: any[];
  onWorkoutDeleted: () => void;
}

export function HistoryView({
  workouts,
  workoutDays,
  onWorkoutDeleted,
}: HistoryViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDeleteWorkout = async (
    workoutId: string,
    workoutName: string
  ) => {
    setDeletingId(workoutId);

    try {
      // Intentar eliminar de la base de datos
      const success = await deleteWorkoutFromDatabase(workoutId);

      if (success) {
        toast({
          title: "Entrenamiento eliminado",
          description: `${workoutName} ha sido eliminado correctamente.`,
        });
      } else {
        // Si falla la DB, eliminar del localStorage
        const localWorkouts = localStorage.getItem("fitness-workouts");
        if (localWorkouts) {
          const parsed = JSON.parse(localWorkouts);
          const filtered = parsed.filter((w: any) => w.id !== workoutId);
          localStorage.setItem("fitness-workouts", JSON.stringify(filtered));
        }

        toast({
          title: "Eliminado localmente",
          description: "El entrenamiento se eliminó de tu dispositivo.",
          variant: "destructive",
        });
      }

      // Recargar la lista
      onWorkoutDeleted();
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sin entrenamientos aún</h3>
        <p className="text-muted-foreground">
          Completa tu primer entrenamiento para ver el historial
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Historial de Entrenamientos</h2>
        <Badge variant="secondary">
          {workouts.length} entrenamientos completados
        </Badge>
      </div>

      <div className="space-y-4">
        {sortedWorkouts.map((workout) => {
          const day = workoutDays.find((d) => d.id === workout.dayId);
          const completedSets = workout.exercises.reduce(
            (total: number, exercise: any) =>
              total + exercise.sets.filter((set: any) => set.completed).length,
            0
          );
          const totalSets = workout.exercises.reduce(
            (total: number, exercise: any) => total + exercise.sets.length,
            0
          );

          return (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        day?.color || "bg-gray-400"
                      }`}
                    />
                    <div>
                      <CardTitle className="text-lg">
                        {workout.dayName}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(workout.date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(workout.date).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      <Dumbbell className="w-3 h-3 mr-1" />
                      {completedSets}/{totalSets} series
                    </Badge>
                    {workout.cardio?.duration && (
                      <Badge variant="outline">
                        <Activity className="w-3 h-3 mr-1" />
                        {workout.cardio.duration}min cardio
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingId === workout.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar entrenamiento?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente el entrenamiento de{" "}
                            <strong>{workout.dayName}</strong> del{" "}
                            <strong>
                              {new Date(workout.date).toLocaleDateString()}
                            </strong>
                            .
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteWorkout(workout.id, workout.dayName)
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Exercise Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {workout.exercises
                      .slice(0, 6)
                      .map((exercise: any, index: number) => {
                        const completedSets = exercise.sets.filter(
                          (set: any) => set.completed
                        ).length;
                        const bestSet = exercise.sets
                          .filter((set: any) => set.weight && set.reps)
                          .sort(
                            (a: any, b: any) =>
                              Number.parseFloat(b.weight) -
                              Number.parseFloat(a.weight)
                          )[0];

                        return (
                          <div key={index} className="text-sm">
                            <div className="font-medium truncate">
                              {exercise.name}
                            </div>
                            <div className="text-muted-foreground">
                              {completedSets}/{exercise.sets.length} series
                              {bestSet && (
                                <span className="ml-2">
                                  • {bestSet.weight}kg × {bestSet.reps}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Cardio & Notes */}
                  {(workout.cardio?.type || workout.notes) && (
                    <div className="pt-3 border-t space-y-2">
                      {workout.cardio?.type && (
                        <div className="text-sm">
                          <span className="font-medium">Cardio:</span>{" "}
                          {workout.cardio.type}
                          {workout.cardio.duration &&
                            ` (${workout.cardio.duration}min)`}
                          {workout.cardio.distance &&
                            ` - ${workout.cardio.distance}km`}
                        </div>
                      )}
                      {workout.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Notas:</span>{" "}
                          {workout.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
