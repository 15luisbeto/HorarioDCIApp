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

Expo Go sigue siendo válido para probar lógica local de UI, datos, favoritos, generación de horarios y exportación sin depender del redirect nativo de Google.

## Development build para Google OAuth

Para probar el flujo real de Google OAuth y Google Calendar en Android, usá una development build instalada. Esto es necesario porque el redirect OAuth debe validarse con el package nativo y el SHA-1 de la build, no solo con Expo Go.

### Crear e instalar la build Android

1. Iniciar sesión en Expo/EAS si hace falta:

   ```bash
   pnpm dlx eas-cli@latest login
   ```

2. Crear una development build APK:

   ```bash
   pnpm dlx eas-cli@latest build --profile development --platform android
   ```

3. Instalar el APK generado en el dispositivo o emulador desde el enlace que entrega EAS, o instalar la última build disponible:

   ```bash
   pnpm dlx eas-cli@latest build:run --platform android
   ```

4. Levantar Metro para la development build:

   ```bash
   pnpm start:dev-client
   ```

5. Abrir `HorarioDCIApp` desde la app instalada, no desde Expo Go.

Para compilar e instalar localmente en Android, con el entorno nativo configurado, también podés usar:

```bash
pnpm android:dev
```

### SHA-1 para Google Cloud

Después de crear la build, obtené el SHA-1 desde las credenciales de build de EAS:

```bash
pnpm dlx eas-cli@latest credentials -p android
```

En Google Cloud, el OAuth Client de Android debe usar:

| Campo | Valor |
| --- | --- |
| Package name | `com.luisbeto.horariodciapp` |
| SHA-1 | El fingerprint de las credenciales usadas por la development build |

No guardes client secrets ni credenciales privadas en el repositorio.

## Funcionalidad principal

- Catálogo de materias desde `data/schedules.ugto.2026-1.json`.
- Generador de combinaciones sin conflictos de horario.
- Vista semanal tipo calendario.
- Favoritos locales con edición, ordenamiento y exportación PDF.
- Preferencia de tema claro, oscuro o sistema.

## Datos académicos

El JSON de materias se genera localmente desde páginas públicas de UGTO. El script Python usado para regenerarlo se mantiene fuera del repositorio público porque las rutas cambian cada semestre.

## Configuración de Google Calendar

La app está preparada para leer los client IDs de OAuth desde variables públicas de Expo. Copiá `.env.example` a `.env` y completá los valores generados en Google Cloud Console:

```bash
cp .env.example .env
```

Variables esperadas:

| Variable | Uso |
| --- | --- |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth web client para pruebas web o flujos con navegador. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | OAuth iOS client para builds iOS. |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | OAuth Android client para builds Android. |
| `EXPO_PUBLIC_GOOGLE_CALENDAR_TIME_ZONE` | Zona horaria para los eventos, por ejemplo `America/Mexico_City`. |

El scope configurado para calendario es `https://www.googleapis.com/auth/calendar.events`, suficiente para crear eventos en el calendario del usuario sin pedir control completo del calendario.

La app usa estos identificadores nativos para OAuth:

| Plataforma | Identificador |
| --- | --- |
| Android package | `com.luisbeto.horariodciapp` |
| iOS bundle ID | `com.luisbeto.horariodciapp` |
| Scheme | `com.luisbeto.horariodciapp` |

### Checklist en Google Cloud

1. Crear o abrir un proyecto en Google Cloud Console.
2. Activar **Google Calendar API**.
3. Configurar la pantalla de consentimiento OAuth.
4. Crear credenciales OAuth por plataforma:
   - **Android**: usar package `com.luisbeto.horariodciapp` y el SHA-1 del keystore/debug build.
   - **iOS**: usar bundle ID `com.luisbeto.horariodciapp`.
   - **Web**: usar el redirect URI que muestra la app en `Configuración > Google Calendar`.
5. Copiar los client IDs a `.env`.

En Android con Development Build, Google vuelve a la app por el scheme nativo del package y la ruta de retorno:

```txt
com.luisbeto.horariodciapp:/oauthredirect
```

El OAuth client Android se valida principalmente con package + SHA-1. Si Google Cloud muestra la opción de **Custom URI scheme**, debe estar habilitada.

La app mantiene el access token solo en memoria durante la sesión; no persiste tokens.

Para enviar favoritos a Google Calendar, configurá el periodo académico dentro de la app en `Ajustes > Google Calendar`. Las materias solo traen día y hora; por eso la app no crea eventos si faltan fechas reales de inicio y fin del semestre.

> Importante: para probar OAuth en dispositivo real usá una **development build**. Expo Go no valida el flujo con el package y SHA-1 nativos de la build Android.
