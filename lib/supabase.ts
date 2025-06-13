import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Database {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          user_id: string | null
          day_id: number
          day_name: string
          date: string
          notes: string | null
          cardio_type: string | null
          cardio_duration: number | null
          cardio_distance: number | null
          cardio_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          day_id: number
          day_name: string
          date?: string
          notes?: string | null
          cardio_type?: string | null
          cardio_duration?: number | null
          cardio_distance?: number | null
          cardio_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          day_id?: number
          day_name?: string
          date?: string
          notes?: string | null
          cardio_type?: string | null
          cardio_duration?: number | null
          cardio_distance?: number | null
          cardio_notes?: string | null
          created_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_name: string
          target_reps: string | null
          exercise_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_name: string
          target_reps?: string | null
          exercise_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_name?: string
          target_reps?: string | null
          exercise_order?: number | null
          created_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          exercise_id: string
          set_number: number
          weight: number | null
          reps: number | null
          completed: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          exercise_id: string
          set_number: number
          weight?: number | null
          reps?: number | null
          completed?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          exercise_id?: string
          set_number?: number
          weight?: number | null
          reps?: number | null
          completed?: boolean | null
          created_at?: string
        }
      }
    }
  }
}
