"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Dumbbell, TrendingUp, Target, Clock, Activity, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { WorkoutDay } from "@/components/workout-day"
import { StatsView } from "@/components/stats-view"
import { HistoryView } from "@/components/history-view"
import {
  getWorkoutsFromDatabase,
  saveWorkoutToDatabase,
  getLastWorkoutForDay,
  testDatabaseConnection,
  type WorkoutData,
  type WorkoutWithId,
} from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { MobileDashboard } from "@/components/mobile-dashboard"
import { useMobile } from "@/hooks/use-mobile"

const WORKOUT_DAYS = [
  {
    id: 1,
    name: "PUSH 1",
    description: "Pecho, Hombro Frontal, Tríceps",
    color: "bg-red-500",
    exercises: [
      { name: "Press banca con barra inclinada", targetReps: "8-10", sets: 4 },
      { name: "Press plano con mancuernas", targetReps: "10-12", sets: 3 },
      { name: "Cruce de poleas (alto a bajo)", targetReps: "12-15", sets: 3 },
      { name: "Press militar con mancuernas", targetReps: "8-10", sets: 3 },
      { name: "Elevaciones laterales", targetReps: "15-20", sets: 3 },
      { name: "Extensión de tríceps en cuerda", targetReps: "12-15", sets: 4 },
      { name: "Tríceps unilateral", targetReps: "12-15", sets: 3 },
      { name: "Finisher: Cruce de poleas lento", targetReps: "20", sets: 3 },
    ],
  },
  {
    id: 2,
    name: "PULL 1",
    description: "Espalda, Bíceps, Trapecio",
    color: "bg-blue-500",
    exercises: [
      { name: "Dominadas o jalones agarre ancho", targetReps: "10", sets: 4 },
      { name: "Remo con barra", targetReps: "10-12", sets: 4 },
      { name: "Pullover en cuerda", targetReps: "15", sets: 3 },
      { name: "Face pulls / Reverse Pec Deck", targetReps: "15-20", sets: 3 },
      { name: "Curl alterno con mancuernas", targetReps: "10-12", sets: 3 },
      { name: "Curl tipo martillo", targetReps: "10-12", sets: 3 },
      { name: "Curl inclinado en banco", targetReps: "12", sets: 3 },
      { name: "Encogimientos (shrugs) mancuernas", targetReps: "15", sets: 2 },
      { name: "Finisher: Curl polea baja", targetReps: "20", sets: 1 },
    ],
  },
  {
    id: 3,
    name: "LEGS 1",
    description: "Cuádriceps Dominante",
    color: "bg-green-500",
    exercises: [
      { name: "Sentadilla con barra", targetReps: "8-10", sets: 4 },
      { name: "Prensa de piernas", targetReps: "12", sets: 3 },
      { name: "Extensión de cuádriceps", targetReps: "15-20", sets: 3 },
      { name: "Curl femoral tumbado", targetReps: "12-15", sets: 3 },
      { name: "Elevaciones de talón de pie", targetReps: "15-20", sets: 3 },
      { name: "Zancadas con mancuernas", targetReps: "20 pasos", sets: 3 },
      { name: "Finisher: Extensión cuádriceps drop set", targetReps: "25", sets: 2 },
    ],
  },
  {
    id: 4,
    name: "PUSH 2",
    description: "Hombros y Pecho Accesorio",
    color: "bg-red-400",
    exercises: [
      { name: "Press hombros con mancuernas sentado", targetReps: "10-12", sets: 4 },
      { name: "Elevaciones laterales sentado", targetReps: "15-20", sets: 4 },
      { name: "Aperturas pec deck o mancuernas", targetReps: "15", sets: 3 },
      { name: "Fondos asistidos", targetReps: "10-12", sets: 3 },
      { name: "Extensión tríceps con barra EZ", targetReps: "12", sets: 3 },
      { name: "Press en máquina pecho", targetReps: "15", sets: 3 },
      { name: "Finisher: Lateral raise (cables)", targetReps: "25", sets: 2 },
    ],
  },
  {
    id: 5,
    name: "PULL 2",
    description: "Espalda y Bíceps Estético",
    color: "bg-blue-400",
    exercises: [
      { name: "Remo en máquina agarre neutro", targetReps: "10-12", sets: 3 },
      { name: "Remo inclinado con barra", targetReps: "10", sets: 3 },
      { name: "Jalones al pecho con cuerda/estrecho", targetReps: "12", sets: 3 },
      { name: "Curl de bíceps con barra EZ", targetReps: "10", sets: 3 },
      { name: "Curl concentrado", targetReps: "12", sets: 3 },
      { name: "Curl tipo 21 / bomba final en cable", targetReps: "21", sets: 3 },
      { name: "Face pulls / Reverse Pec Deck", targetReps: "15", sets: 3 },
      { name: "Encogimientos con barra", targetReps: "15", sets: 3 },
    ],
  },
  {
    id: 6,
    name: "LEGS 2",
    description: "Posterior + Glúteo Dominante",
    color: "bg-green-400",
    exercises: [
      { name: "Peso muerto rumano", targetReps: "10", sets: 3 },
      { name: "Curl femoral sentado", targetReps: "12-15", sets: 4 },
      { name: "Hip Thrust con barra", targetReps: "10-12", sets: 3 },
      { name: "Zancadas reversas", targetReps: "20 pasos", sets: 3 },
      { name: "Curl nórdico asistido", targetReps: "—", sets: 3 },
      { name: "Elevación de talón sentado", targetReps: "20", sets: 3 },
      { name: "Finisher: Puente glúteo con banda", targetReps: "25", sets: 2 },
    ],
  },
  {
    id: 7,
    name: "CORE",
    description: "Abdominales y Core",
    color: "bg-purple-500",
    exercises: [
      { name: "Ab wheel", targetReps: "10", sets: 3 },
      { name: "Crunch en polea", targetReps: "15", sets: 3 },
      { name: "Elevación de piernas colgado", targetReps: "15", sets: 3 },
      { name: "Planchas laterales", targetReps: "30 seg/lado", sets: 3 },
    ],
  },
]

export default function FitnessTracker() {
  const isMobile = useMobile()
  const [workouts, setWorkouts] = useState<WorkoutWithId[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [dbConnected, setDbConnected] = useState(false)
  const { toast } = useToast()

  const handleSelectDay = (dayId: number) => {
    setSelectedDay(dayId)
    setActiveTab("workout")
  }

  // Cargar entrenamientos al iniciar
  useEffect(() => {
    initializeApp()

    // Detectar estado de conexión
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const initializeApp = async () => {
    setIsLoading(true)

    // Primero verificar conexión a la base de datos
    const dbConnection = await testDatabaseConnection()
    setDbConnected(dbConnection)

    if (dbConnection) {
      await loadWorkouts()
    } else {
      // Si no hay conexión a DB, cargar desde localStorage
      loadLocalWorkouts()
    }

    setIsLoading(false)
  }

  const loadWorkouts = async () => {
    try {
      const dbWorkouts = await getWorkoutsFromDatabase()
      setWorkouts(dbWorkouts)

      // También cargar desde localStorage como respaldo
      const localWorkouts = localStorage.getItem("fitness-workouts")
      if (localWorkouts && dbWorkouts.length === 0) {
        const parsedLocal = JSON.parse(localWorkouts)
        setWorkouts(parsedLocal)
      }
    } catch (error) {
      console.error("Error loading workouts:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los entrenamientos. Usando datos locales.",
        variant: "destructive",
      })

      // Fallback a localStorage
      loadLocalWorkouts()
    }
  }

  const loadLocalWorkouts = () => {
    const localWorkouts = localStorage.getItem("fitness-workouts")
    if (localWorkouts) {
      try {
        setWorkouts(JSON.parse(localWorkouts))
      } catch (error) {
        console.error("Error parsing local workouts:", error)
        setWorkouts([])
      }
    }
  }

  const saveWorkout = async (workoutData: WorkoutData) => {
    try {
      if (dbConnected) {
        // Guardar en la base de datos
        const workoutId = await saveWorkoutToDatabase(workoutData)

        if (workoutId) {
          // Recargar entrenamientos desde la base de datos
          await loadWorkouts()
          toast({
            title: "¡Entrenamiento guardado!",
            description: "Tu progreso se ha sincronizado correctamente.",
          })
          return
        }
      }

      // Fallback: guardar localmente
      const workoutWithId = {
        ...workoutData,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      }

      const newWorkouts = [workoutWithId, ...workouts]
      setWorkouts(newWorkouts)
      localStorage.setItem("fitness-workouts", JSON.stringify(newWorkouts))

      toast({
        title: dbConnected ? "Error al sincronizar" : "Guardado localmente",
        description: dbConnected
          ? "Se guardó localmente. Reintentará sincronizar automáticamente."
          : "El entrenamiento se guardó en tu dispositivo.",
        variant: dbConnected ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Error saving workout:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const getLastWorkout = async (dayId: number) => {
    try {
      if (dbConnected) {
        const lastWorkout = await getLastWorkoutForDay(dayId)
        return lastWorkout
      }
    } catch (error) {
      console.error("Error getting last workout from DB:", error)
    }

    // Fallback a búsqueda local
    return workouts
      .filter((w) => w.dayId === dayId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const getWeeklyProgress = () => {
    const thisWeek = workouts.filter((w) => {
      const workoutDate = new Date(w.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return workoutDate >= weekAgo
    })
    return (thisWeek.length / 6) * 100 // 6 días de rutina
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 mx-auto text-slate-400 animate-pulse mb-4" />
          <p className="text-slate-600">Cargando entrenamientos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-1">Rutina Gym Jordi</h1>
              <p className="text-sm md:text-base text-slate-600">Push / Pull / Legs + Core</p>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Badge variant="default" className="bg-green-500 text-xs">
                  <Wifi className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Conectado</span>
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <WifiOff className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Sin conexión</span>
                </Badge>
              )}
              {!dbConnected && (
                <Badge variant="outline" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Modo local</span>
                </Badge>
              )}
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 mb-4">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm">
              <div className="flex flex-col items-center">
                <Dumbbell className="w-4 h-4 mb-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="workout" className="text-xs md:text-sm">
              <div className="flex flex-col items-center">
                <Activity className="w-4 h-4 mb-1" />
                <span className="hidden sm:inline">Entrenar</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs md:text-sm">
              <div className="flex flex-col items-center">
                <Calendar className="w-4 h-4 mb-1" />
                <span className="hidden sm:inline">Historial</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs md:text-sm">
              <div className="flex flex-col items-center">
                <TrendingUp className="w-4 h-4 mb-1" />
                <span className="hidden sm:inline">Stats</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {isMobile ? (
              <MobileDashboard
                workouts={workouts}
                workoutDays={WORKOUT_DAYS}
                onSelectDay={handleSelectDay}
                getWeeklyProgress={getWeeklyProgress}
              />
            ) : (
              <>
                {/* Stats Cards - versión desktop existente */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Entrenamientos</CardTitle>
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{workouts.length}</div>
                      <p className="text-xs text-muted-foreground">Total completados</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          workouts.filter((w) => {
                            const workoutDate = new Date(w.date)
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return workoutDate >= weekAgo
                          }).length
                        }
                      </div>
                      <Progress value={getWeeklyProgress()} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Último Entreno</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {workouts.length > 0 ? new Date(workouts[0].date).toLocaleDateString() : "—"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {workouts.length > 0
                          ? WORKOUT_DAYS.find((d) => d.id === workouts[0].dayId)?.name
                          : "Ninguno aún"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Progreso</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(getWeeklyProgress())}%</div>
                      <p className="text-xs text-muted-foreground">Objetivo semanal</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Workout Days Grid - versión desktop existente */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {WORKOUT_DAYS.map((day) => {
                    const lastWorkout = workouts
                      .filter((w) => w.dayId === day.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

                    return (
                      <Card key={day.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${day.color}`} />
                              <CardTitle className="text-lg">{day.name}</CardTitle>
                            </div>
                            {lastWorkout && (
                              <Badge variant="secondary">{new Date(lastWorkout.date).toLocaleDateString()}</Badge>
                            )}
                          </div>
                          <CardDescription>{day.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Ejercicios:</span>
                              <span>{day.exercises.length}</span>
                            </div>
                            <Button className="w-full" onClick={() => handleSelectDay(day.id)}>
                              <Activity className="w-4 h-4 mr-2" />
                              Entrenar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="workout">
            {selectedDay ? (
              <WorkoutDay
                day={WORKOUT_DAYS.find((d) => d.id === selectedDay)!}
                lastWorkout={
                  workouts
                    .filter((w) => w.dayId === selectedDay)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                }
                onSave={saveWorkout}
                onBack={() => {
                  setSelectedDay(null)
                  setActiveTab("dashboard")
                }}
              />
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Selecciona un día de entrenamiento</h3>
                <p className="text-muted-foreground mb-6">Elige qué rutina quieres realizar hoy</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {WORKOUT_DAYS.map((day) => (
                    <Button
                      key={day.id}
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleSelectDay(day.id)}
                    >
                      <div className={`w-3 h-3 rounded-full ${day.color} mb-2`} />
                      <span className="font-semibold">{day.name}</span>
                      <span className="text-xs text-muted-foreground">{day.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <HistoryView workouts={workouts} workoutDays={WORKOUT_DAYS} />
          </TabsContent>

          <TabsContent value="stats">
            <StatsView workouts={workouts} workoutDays={WORKOUT_DAYS} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
