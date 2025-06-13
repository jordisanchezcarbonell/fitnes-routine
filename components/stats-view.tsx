"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Calendar, Dumbbell, Target } from "lucide-react"

interface StatsViewProps {
  workouts: any[]
  workoutDays: any[]
}

export function StatsView({ workouts, workoutDays }: StatsViewProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sin estadísticas aún</h3>
        <p className="text-muted-foreground">Completa algunos entrenamientos para ver tus estadísticas</p>
      </div>
    )
  }

  // Workout frequency by day type
  const workoutsByDay = workoutDays.map((day) => ({
    name: day.name,
    count: workouts.filter((w) => w.dayId === day.id).length,
    color: day.color,
  }))

  // Weekly progress
  const getWeeklyData = () => {
    const weeks: any = {}
    workouts.forEach((workout) => {
      const date = new Date(workout.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, workouts: 0 }
      }
      weeks[weekKey].workouts++
    })

    return Object.values(weeks).sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime())
  }

  const weeklyData = getWeeklyData()

  // Exercise progress (for exercises with weight tracking)
  const getExerciseProgress = () => {
    const exerciseProgress: any = {}

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise: any) => {
        if (!exerciseProgress[exercise.name]) {
          exerciseProgress[exercise.name] = []
        }

        const bestSet = exercise.sets
          .filter((set: any) => set.weight && set.reps && set.completed)
          .sort((a: any, b: any) => Number.parseFloat(b.weight) - Number.parseFloat(a.weight))[0]

        if (bestSet) {
          exerciseProgress[exercise.name].push({
            date: workout.date,
            weight: Number.parseFloat(bestSet.weight),
            reps: Number.parseInt(bestSet.reps),
          })
        }
      })
    })

    return exerciseProgress
  }

  const exerciseProgress = getExerciseProgress()
  const topExercises = Object.entries(exerciseProgress)
    .filter(([_, data]: [string, any]) => data.length >= 2)
    .slice(0, 3)

  // Calculate stats
  const totalWorkouts = workouts.length
  const thisWeekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return workoutDate >= weekAgo
  }).length

  const avgWorkoutsPerWeek =
    weeklyData.length > 0
      ? weeklyData.reduce((sum: number, week: any) => sum + week.workouts, 0) / weeklyData.length
      : 0

  const totalSets = workouts.reduce(
    (total, workout) =>
      total +
      workout.exercises.reduce(
        (exerciseTotal: number, exercise: any) =>
          exerciseTotal + exercise.sets.filter((set: any) => set.completed).length,
        0,
      ),
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estadísticas de Progreso</h2>
        <Badge variant="secondary">Últimos {workouts.length} entrenamientos</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrenamientos</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekWorkouts}</div>
            <p className="text-xs text-muted-foreground">de 6 objetivo</p>
            <Progress value={(thisWeekWorkouts / 6) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWorkoutsPerWeek.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">entrenamientos/semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Series Totales</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSets}</div>
            <p className="text-xs text-muted-foreground">Series completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Día</CardTitle>
            <CardDescription>Frecuencia de cada tipo de entrenamiento</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Entrenamientos",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso Semanal</CardTitle>
            <CardDescription>Entrenamientos por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                workouts: {
                  label: "Entrenamientos",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("es-ES", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString("es-ES")}
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="var(--color-workouts)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-workouts)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Progress */}
      {topExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Ejercicios</CardTitle>
            <CardDescription>Evolución del peso en ejercicios principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topExercises.map(([exerciseName, data]: [string, any]) => {
                const sortedData = data.sort(
                  (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                )
                const firstWeight = sortedData[0].weight
                const lastWeight = sortedData[sortedData.length - 1].weight
                const improvement = lastWeight - firstWeight

                return (
                  <div key={exerciseName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{exerciseName}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={improvement > 0 ? "default" : "secondary"}>
                          {improvement > 0 ? "+" : ""}
                          {improvement.toFixed(1)}kg
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {firstWeight}kg → {lastWeight}kg
                        </span>
                      </div>
                    </div>
                    <ChartContainer
                      config={{
                        weight: {
                          label: "Peso (kg)",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="h-[100px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sortedData}>
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) =>
                              new Date(value).toLocaleDateString("es-ES", { month: "short", day: "numeric" })
                            }
                          />
                          <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            labelFormatter={(value) => new Date(value).toLocaleDateString("es-ES")}
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="var(--color-weight)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-weight)", r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
