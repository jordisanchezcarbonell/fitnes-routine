"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Play, Pause, RotateCcw, Plus, Minus, X } from "lucide-react";

interface RestTimerProps {
  isVisible: boolean;
  onClose: () => void;
  defaultDuration?: number;
}

export function RestTimer({
  isVisible,
  onClose,
  defaultDuration = 90,
}: RestTimerProps) {
  const [duration, setDuration] = useState(defaultDuration); // duración total en segundos
  const [timeLeft, setTimeLeft] = useState(defaultDuration); // tiempo restante
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Efecto para el countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            // Vibración si está disponible
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            // Notificación de audio (opcional)
            try {
              const audio = new Audio(
                "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
              );
              audio.play().catch(() => {}); // Ignorar errores de audio
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
      setIsFinished(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsFinished(false);
  };

  const handleClose = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsFinished(false);
    onClose();
  };

  const adjustDuration = (change: number) => {
    const newDuration = Math.max(15, Math.min(600, duration + change)); // Entre 15 segundos y 10 minutos
    setDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration);
    }
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card
        className={`w-full max-w-sm ${
          isFinished ? "bg-green-50 border-green-200" : ""
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Timer
                className={`w-5 h-5 ${
                  isFinished ? "text-green-600" : "text-blue-600"
                }`}
              />
              <span className="font-semibold">
                {isFinished ? "¡Descanso terminado!" : "Descanso"}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div
              className={`text-6xl font-bold tabular-nums mb-2 ${
                isFinished
                  ? "text-green-600"
                  : timeLeft <= 10
                  ? "text-red-500"
                  : timeLeft <= 30
                  ? "text-orange-500"
                  : "text-blue-600"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
            <Progress
              value={progress}
              className={`h-2 ${isFinished ? "[&>div]:bg-green-500" : ""}`}
            />
          </div>

          {/* Duration Controls */}
          {!isRunning && !isFinished && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(-15)}
                disabled={duration <= 15}
              >
                <Minus className="w-4 h-4" />
                15s
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Duración: {formatTime(duration)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(15)}
                disabled={duration >= 600}
              >
                <Plus className="w-4 h-4" />
                15s
              </Button>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-2">
            {!isFinished ? (
              <>
                <Button
                  onClick={isRunning ? handlePause : handleStart}
                  className="flex-1"
                  variant={isRunning ? "secondary" : "default"}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {timeLeft === duration ? "Iniciar" : "Continuar"}
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleClose}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ¡Continuar entrenamiento!
              </Button>
            )}
          </div>

          {/* Quick Time Presets */}
          {!isRunning && !isFinished && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDuration(60);
                  setTimeLeft(60);
                }}
                className="text-xs"
              >
                1min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDuration(90);
                  setTimeLeft(90);
                }}
                className="text-xs"
              >
                1:30
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDuration(120);
                  setTimeLeft(120);
                }}
                className="text-xs"
              >
                2min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDuration(180);
                  setTimeLeft(180);
                }}
                className="text-xs"
              >
                3min
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
