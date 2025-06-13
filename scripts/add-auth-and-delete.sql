-- Actualizar políticas RLS para usuarios autenticados
DROP POLICY IF EXISTS "Allow public access to workouts" ON workouts;
DROP POLICY IF EXISTS "Allow public access to workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Allow public access to workout_sets" ON workout_sets;

-- Políticas para workouts - solo el usuario puede ver/modificar sus datos
CREATE POLICY "Users can view own workouts" ON workouts
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own workouts" ON workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own workouts" ON workouts
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own workouts" ON workouts
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Políticas para workout_exercises
CREATE POLICY "Users can view own workout_exercises" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );

CREATE POLICY "Users can insert own workout_exercises" ON workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );

CREATE POLICY "Users can update own workout_exercises" ON workout_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );

CREATE POLICY "Users can delete own workout_exercises" ON workout_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );

-- Políticas para workout_sets
CREATE POLICY "Users can view own workout_sets" ON workout_sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );

CREATE POLICY "Users can insert own workout_sets" ON workout_sets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );

CREATE POLICY "Users can update own workout_sets" ON workout_sets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );

CREATE POLICY "Users can delete own workout_sets" ON workout_sets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id IS NULL)
        )
    );
