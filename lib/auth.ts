import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// Obtener usuario actual
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuario",
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Iniciar sesión con email y contraseña
export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          name:
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "Usuario",
        },
        error: null,
      };
    }

    return { user: null, error: "No se pudo iniciar sesión" };
  } catch (error) {
    return { user: null, error: "Error de conexión" };
  }
}

// Registrarse con email y contraseña
export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split("@")[0],
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          name: name || data.user.email?.split("@")[0] || "Usuario",
        },
        error: null,
      };
    }

    return { user: null, error: "No se pudo crear la cuenta" };
  } catch (error) {
    return { user: null, error: "Error de conexión" };
  }
}

// Cerrar sesión
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: "Error al cerrar sesión" };
  }
}

// Escuchar cambios de autenticación
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || "",
        name:
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "Usuario",
      });
    } else {
      callback(null);
    }
  });
}
