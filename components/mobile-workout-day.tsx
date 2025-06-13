"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, Save, Plus, Minus, Check, X, Timer } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Exercise {
  name: string
  targetReps: string
  sets: number
}

interface MobileWorkoutDayProps {
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

export function MobileWorkoutDay({ day, lastWorkout, onSave, onBack }: MobileWorkoutDayProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
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

  // Timer para descanso
  useState(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  })

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

    // Iniciar timer de descanso automáticamente
    if (!exerciseData[exerciseIndex].sets[setIndex].completed) {
      setRestTimer(90) // 90 segundos de descanso
      setIsResting(true)
    }
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
      duration: 0,
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
  const currentExercise = day.exercises[currentExerciseIndex]
  const currentSets = exerciseData[currentExerciseIndex]?.sets || []

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${day.color}`} />
          <h1 className="text-lg font-bold">{day.name}</h1>
        </div>

        <Progress value={(completed / total) * 100} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {completed}/{total} series completadas
        </p>
      </div>

      {/* Timer de descanso */}
      {isResting && (
        <div className="sticky top-[120px] z-10 mx-4 mb-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Descanso</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600">{formatTime(restTimer)}</span>
                  <Button size="sm" variant="outline" onClick={() => setIsResting(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navegación de ejercicios */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {day.exercises.map((exercise, index) => {
            const exerciseSets = exerciseData[index]?.sets || []
            const completedCount = exerciseSets.filter((set: any) => set.completed).length
            const isActive = index === currentExerciseIndex

            return (
              <Button
                key={index}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0 min-w-[80px]"
                onClick={() => setCurrentExerciseIndex(index)}
              >
                <div className="text-center">
                  <div className="text-xs font-semibold">{exercise.name.split(" ")[0]}</div>
                  <div className="text-xs opacity-75">
                    {completedCount}/{exercise.sets}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Ejercicio actual */}
      <div className="px-4 pb-20">
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{currentExercise.name}</CardTitle>
            <CardDescription>
              Objetivo: {currentExercise.targetReps} reps × {currentExercise.sets} series
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSets.map((set: any, setIndex: number) => (
              <div
                key={setIndex}
                className={`p-4 border-2 rounded-lg transition-all ${
                  set.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-semibold text-base">Serie {setIndex + 1}</Label>
                  <Button
                    size="lg"
                    variant={set.completed ? "default" : "outline"}
                    className="h-12 w-12 rounded-full"
                    onClick={() => toggleSetCompleted(currentExerciseIndex, setIndex)}
                  >
                    {set.completed ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Peso (kg)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 w-10 p-0"
                        onClick={() => {
                          const currentWeight = Number.parseFloat(set.weight) || 0
                          updateSet(
                            currentExerciseIndex,
                            setIndex,
                            "weight",
                            Math.max(0, currentWeight - 2.5).toString(),
                          )
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        step="0.5"
                        className="text-center h-10"
                        value={set.weight}
                        onChange={(e) => updateSet(currentExerciseIndex, setIndex, "weight", e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 w-10 p-0"
                        onClick={() => {
                          const currentWeight = Number.parseFloat(set.weight) || 0
                          updateSet(currentExerciseIndex, setIndex, "weight", (currentWeight + 2.5).toString())
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Repeticiones</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 w-10 p-0"
                        onClick={() => {
                          const currentReps = Number.parseInt(set.reps) || 0
                          updateSet(currentExerciseIndex, setIndex, "reps", Math.max(0, currentReps - 1).toString())
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        className="text-center h-10"
                        value={set.reps}
                        onChange={(e) => updateSet(currentExerciseIndex, setIndex, "reps", e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 w-10 p-0"
                        onClick={() => {
                          const currentReps = Number.parseInt(set.reps) || 0
                          updateSet(currentExerciseIndex, setIndex, "reps", (currentReps + 1).toString())
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navegación entre ejercicios */}
        <div className="flex justify-between mb-4">
          <Button
            variant="outline"
            disabled={currentExerciseIndex === 0}
            onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
            className="flex-1 mr-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={currentExerciseIndex === day.exercises.length - 1}
            onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
            className="flex-1 ml-2"
          >
            Siguiente
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>

        {/* Sheet para cardio y notas */}
        <div className="grid grid-cols-2 gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12">
                <Timer className="w-4 h-4 mr-2" />
                Cardio
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Cardio</SheetTitle>
                <SheetDescription>Registra tu actividad cardiovascular</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <Label>Tipo</Label>
                  <Input
                    placeholder="Caminata, bici, etc."
                    value={cardioData.type}
                    onChange={(e) => setCardioData((prev) => ({ ...prev, type: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12">
                <Plus className="w-4 h-4 mr-2" />
                Notas
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>Notas del Entrenamiento</SheetTitle>
                <SheetDescription>¿Cómo te sentiste? ¿Alguna observación?</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <Textarea
                  placeholder="Escribe tus notas aquí..."
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
