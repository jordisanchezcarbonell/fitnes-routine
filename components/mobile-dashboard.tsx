"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Dumbbell, Clock, Zap } from "lucide-react"

interface MobileDashboardProps {
  workouts: any[]
  workoutDays: any[]
  onSelectDay: (dayId: number) => void
  getWeeklyProgress: () => number
}

export function MobileDashboard({ workouts, workoutDays, onSelectDay, getWeeklyProgress }: MobileDashboardProps) {
  const getLastWorkout = (dayId: number) => {
    return workouts
      .filter((w) => w.dayId === dayId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  const thisWeekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return workoutDate >= weekAgo
  }).length

  return (
    <div className="space-y-4">
      {/* Stats compactas para móvil */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-lg font-bold">{workouts.length}</div>
              <div className="text-xs text-muted-foreground">Entrenamientos</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-lg font-bold">{thisWeekWorkouts}</div>
              <div className="text-xs text-muted-foreground">Esta semana</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progreso semanal */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progreso Semanal</span>
          <Badge variant="outline">{Math.round(getWeeklyProgress())}%</Badge>
        </div>
        <Progress value={getWeeklyProgress()} className="h-2" />
        <div className="text-xs text-muted-foreground mt-1">{thisWeekWorkouts}/6 entrenamientos completados</div>
      </Card>

      {/* Último entrenamiento */}
      {workouts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Último Entrenamiento</div>
              <div className="text-xs text-muted-foreground">
                {workoutDays.find((d) => d.id === workouts[0].dayId)?.name} •{" "}
                {new Date(workouts[0].date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Entrenamientos rápidos */}
      <div>
        <h3 className="text-lg font-semibold mb-3 px-1">Entrenamientos</h3>
        <div className="space-y-3">
          {workoutDays.map((day) => {
            const lastWorkout = getLastWorkout(day.id)
            const daysSinceLastWorkout = lastWorkout
              ? Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <Card key={day.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className={`w-1 h-20 ${day.color}`} />
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-base">{day.name}</h4>
                          <p className="text-sm text-muted-foreground">{day.description}</p>
                        </div>
                        {lastWorkout && (
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs">
                              {daysSinceLastWorkout === 0
                                ? "Hoy"
                                : daysSinceLastWorkout === 1
                                  ? "Ayer"
                                  : `${daysSinceLastWorkout}d`}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">{day.exercises.length} ejercicios</div>
                        <Button size="sm" onClick={() => onSelectDay(day.id)} className="h-8">
                          <Zap className="w-3 h-3 mr-1" />
                          Entrenar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
