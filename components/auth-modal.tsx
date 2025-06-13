"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { toast } = useToast();

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  // Añadir después de los estados existentes
  const [errors, setErrors] = useState({
    signin: { email: "", password: "" },
    signup: { email: "", password: "", confirmPassword: "", name: "" },
  });

  // Función de validación
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, error } = await signIn(
        signInData.email,
        signInData.password
      );

      if (error) {
        let errorMessage = error;

        // Traducir errores comunes
        if (error.includes("Invalid login credentials")) {
          errorMessage = "Email o contraseña incorrectos";
        } else if (error.includes("Email not confirmed")) {
          errorMessage = "Debes confirmar tu email antes de iniciar sesión";
        } else if (error.includes("Too many requests")) {
          errorMessage = "Demasiados intentos. Espera unos minutos";
        } else if (error.includes("Invalid email")) {
          errorMessage = "El formato del email no es válido";
        }

        toast({
          title: "Error al iniciar sesión",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (user) {
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${user.name}, sesión iniciada correctamente.`,
        });
        onSuccess();
        onOpenChange(false);
        // Limpiar formulario
        setSignInData({ email: "", password: "" });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description:
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description:
          "Asegúrate de escribir la misma contraseña en ambos campos",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!signUpData.email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { user, error } = await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.name
      );

      if (error) {
        let errorMessage = error;

        // Traducir errores comunes
        if (error.includes("User already registered")) {
          errorMessage = "Ya existe una cuenta con este email";
        } else if (error.includes("Password should be at least")) {
          errorMessage = "La contraseña debe tener al menos 6 caracteres";
        } else if (error.includes("Invalid email")) {
          errorMessage = "El formato del email no es válido";
        } else if (error.includes("Signup is disabled")) {
          errorMessage = "El registro está temporalmente deshabilitado";
        }

        toast({
          title: "Error al crear cuenta",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (user) {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description:
            "Revisa tu email para confirmar tu cuenta y luego inicia sesión.",
          duration: 6000,
        });
        setActiveTab("signin");
        setSignUpData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
        });
        // Pre-llenar el email en el login
        setSignInData({ email: signUpData.email, password: "" });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description:
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acceder a tu cuenta</DialogTitle>
          <DialogDescription>
            Inicia sesión o crea una cuenta para sincronizar tus entrenamientos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="tu@email.com"
                    className={`pl-10 ${
                      errors.signin.email ? "border-red-500" : ""
                    }`}
                    value={signInData.email}
                    onChange={(e) => {
                      setSignInData({ ...signInData, email: e.target.value });
                      if (errors.signin.email) {
                        setErrors((prev) => ({
                          ...prev,
                          signin: { ...prev.signin, email: "" },
                        }));
                      }
                    }}
                    required
                  />
                </div>
                {errors.signin.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.signin.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={signInData.password}
                    onChange={(e) =>
                      setSignInData({ ...signInData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Tu nombre"
                    className="pl-10"
                    value={signUpData.name}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={signUpData.email}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={signUpData.password}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={signUpData.confirmPassword}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
