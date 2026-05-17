# HorarioDCIApp

App Expo para ayudar a estudiantes de DCI a generar horarios sin choques, guardar combinaciones favoritas y exportarlas.

## Inicio rápido

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Iniciar la app:

   ```bash
   pnpm start
   ```

3. Abrir con Expo Go, Android, iOS o web desde la terminal de Expo.

## Funcionalidad principal

- Catálogo de materias desde `data/schedules.ugto.2026-1.json`.
- Generador de combinaciones sin conflictos de horario.
- Vista semanal tipo calendario.
- Favoritos locales con edición, ordenamiento y exportación PDF.
- Preferencia de tema claro, oscuro o sistema.

## Datos académicos

El JSON de materias se genera localmente desde páginas públicas de UGTO. El script Python usado para regenerarlo se mantiene fuera del repositorio público porque las rutas cambian cada semestre.
