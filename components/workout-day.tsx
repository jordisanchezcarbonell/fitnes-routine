"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { MobileWorkoutDay } from "./mobile-workout-day"
import { useMobile } from "@/hooks/use-mobile"

interface Exercise {
  name: string
  targetReps: string
  sets: number
}

interface WorkoutDayProps {
  day: {
    id: number
    name: string
    description: string
    color: string
    exercises: Exercise[]
  }
  lastWorkout?: any
  onSave: (workout: any) => void
  onBack: () => void
}

export function WorkoutDay({ day, lastWorkout, onSave, onBack }: WorkoutDayProps) {
  const isMobile = useMobile()

  const [exerciseData, setExerciseData] = useState(() => {
    const initialData: any = {}
    day.exercises.forEach((exercise, exerciseIndex) => {
      initialData[exerciseIndex] = {
        sets: Array(exercise.sets)
          .fill(null)
          .map((_, setIndex) => ({
            weight: lastWorkout?.exercises?.[exerciseIndex]?.sets?.[setIndex]?.weight || "",
            reps: lastWorkout?.exercises?.[exerciseIndex]?.sets?.[setIndex]?.reps || "",
            completed: false,
          })),
      }
    })
    return initialData
  })

  const [cardioData, setCardioData] = useState({
    type: lastWorkout?.cardio?.type || "",
    duration: lastWorkout?.cardio?.duration || "",
    distance: lastWorkout?.cardio?.distance || "",
    notes: lastWorkout?.cardio?.notes || "",
  })

  const [workoutNotes, setWorkoutNotes] = useState(lastWorkout?.notes || "")

  const updateSet = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: string) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        sets: prev[exerciseIndex].sets.map((set: any, idx: number) =>
          idx === setIndex ? { ...set, [field]: value } : set,
        ),
      },
    }))
  }

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        sets: prev[exerciseIndex].sets.map((set: any, idx: number) =>
          idx === setIndex ? { ...set, completed: !set.completed } : set,
        ),
      },
    }))
  }

  const handleSave = () => {
    const workout = {
      dayId: day.id,
      dayName: day.name,
      exercises: Object.entries(exerciseData).map(([exerciseIndex, data]: [string, any]) => ({
        name: day.exercises[Number.parseInt(exerciseIndex)].name,
        targetReps: day.exercises[Number.parseInt(exerciseIndex)].targetReps,
        sets: data.sets,
      })),
      cardio: cardioData,
      notes: workoutNotes,
      duration: 0, // Could be calculated
    }

    onSave(workout)
    onBack()
  }

  const getCompletedSets = () => {
    let completed = 0
    let total = 0
    Object.values(exerciseData).forEach((exercise: any) => {
      exercise.sets.forEach((set: any) => {
        total++
        if (set.completed) completed++
      })
    })
    return { completed, total }
  }

  const { completed, total } = getCompletedSets()

  // Si es móvil, usar la versión móvil
  if (isMobile) {
    return <MobileWorkoutDay day={day} lastWorkout={lastWorkout} onSave={onSave} onBack={onBack} />
  }

  // Versión desktop existente
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${day.color}`} />
            <h2 className="text-2xl font-bold">{day.name}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            {completed}/{total} series completadas
          </Badge>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Entreno
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground">{day.description}</p>

      {/* Exercises */}
      <div className="space-y-4">
        {day.exercises.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
              <CardDescription>
                Objetivo: {exercise.targetReps} reps × {exercise.sets} series
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(exercise.sets)
                  .fill(null)
                  .map((_, setIndex) => {
                    const setData = exerciseData[exerciseIndex]?.sets[setIndex]
                    return (
                      <div
                        key={setIndex}
                        className={`p-4 border rounded-lg ${
                          setData?.completed ? "bg-green-50 border-green-200" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Label className="font-semibold">Serie {setIndex + 1}</Label>
                          <Button
                            size="sm"
                            variant={setData?.completed ? "default" : "outline"}
                            onClick={() => toggleSetCompleted(exerciseIndex, setIndex)}
                          >
                            {setData?.completed ? "✓" : "○"}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Peso (kg)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={setData?.weight || ""}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Repeticiones</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={setData?.reps || ""}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cardio Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cardio</CardTitle>
          <CardDescription>Registra tu actividad cardiovascular</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo</Label>
              <Input
                placeholder="Caminata, bici, etc."
                value={cardioData.type}
                onChange={(e) => setCardioData((prev) => ({ ...prev, type: e.target.value }))}
              />
            </div>
            <div>
              <Label>Duración (min)</Label>
              <Input
                type="number"
                placeholder="0"
                value={cardioData.duration}
                onChange={(e) => setCardioData((prev) => ({ ...prev, duration: e.target.value }))}
              />
            </div>
            <div>
              <Label>Distancia (km)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={cardioData.distance}
                onChange={(e) => setCardioData((prev) => ({ ...prev, distance: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Notas del cardio</Label>
            <Textarea
              placeholder="Detalles adicionales..."
              value={cardioData.notes}
              onChange={(e) => setCardioData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Workout Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas del Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="¿Cómo te sentiste? ¿Alguna observación?"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  )
}
