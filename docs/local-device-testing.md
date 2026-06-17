# Pruebas locales en dispositivo físico

Esta guía explica cómo probar HorarioDCIApp en un teléfono real con Expo Go y cuándo debes pasar a una development build o a una build distribuida por Google Play Console.

## Resumen rápido

| Necesitas validar | Ruta correcta |
|---|---|
| UI, navegación, datos incluidos, favoritos y exportación local | Expo Go con QR local |
| Google OAuth real, redirects nativos, package/bundle ID o SHA-1 | Development build o build distribuida por Play Console |
| Disponibilidad para testers internos, cerrados o públicos en Android | Track de Play Console anunciado por `15luisbeto` o su delegado |

Checklist inicial:

- [ ] Instalar dependencias con `pnpm install`.
- [ ] Levantar Metro/Expo con `pnpm start`.
- [ ] Instalar Expo Go en el teléfono Android o iOS.
- [ ] Conectar teléfono y computadora a la misma red, o usar túnel si la LAN está bloqueada.
- [ ] Escanear el QR de Expo y revisar solo comportamiento local permitido.

## Prerrequisitos

| Requisito | Detalle |
|---|---|
| Node/pnpm | Usa pnpm, no npm ni yarn, para mantener el lockfile consistente. |
| Teléfono físico | Android o iPhone con Expo Go instalado desde la tienda oficial. |
| Red | Computadora y teléfono deben poder verse en la misma Wi-Fi/LAN para modo LAN. |
| Android Studio | No es necesario para pruebas con Expo Go por QR. Solo hace falta para flujos nativos/locales avanzados. |

Comandos base:

```bash
pnpm install
pnpm start
```

Cuando Expo muestre el QR en la terminal o en Expo DevTools, usa ese QR para abrir la app en Expo Go.

## Qué sí y qué no se prueba en Expo Go

| Área | ¿Expo Go sirve? | Nota |
|---|---:|---|
| Navegación entre pantallas | Sí | Smoke check de tabs, vistas y modales. |
| Datos académicos incluidos | Sí | Revisa materias desde `data/schedules.ugto.2026-1.json`. |
| Generación de horarios | Sí | Valida combinaciones sin choques usando datos locales. |
| Favoritos locales | Sí | Revisa guardar, editar, ordenar y borrar favoritos. |
| Exportación local/PDF/sharing | Sí, como smoke check | Puede variar por permisos y apps instaladas en el teléfono. |
| Google OAuth real | No | Requiere identidad nativa, package/bundle ID y credenciales reales. |
| Redirects nativos | No | Expo Go no valida el redirect con `com.luisbeto.horariodciapp`. |
| Play Console / tracks de testing | No | Se valida con builds distribuidas por Play Console. |

## Android con Expo Go

1. Instala **Expo Go** desde Google Play o desde la ruta oficial de Expo.
2. Ejecuta `pnpm start` en la computadora.
3. Verifica que el teléfono esté en la misma Wi-Fi/LAN que la computadora.
4. Abre Expo Go y usa **Scan QR code** para escanear el QR que muestra Metro/Expo.
5. Acepta permisos si Android o Expo Go los solicita, especialmente acceso a red local/cámara según el flujo del dispositivo.
6. Espera que HorarioDCIApp cargue y realiza un smoke check local:
   - abrir navegación principal;
   - generar horarios;
   - guardar o revisar favoritos;
   - revisar exportación local si aplica.

Resultado esperado: la app abre dentro de Expo Go y permite revisar UI/datos locales. Si necesitas probar Google OAuth real, detente: usa una development build o una build de Play Console.

## iOS con Expo Go

1. Instala **Expo Go** desde App Store.
2. Ejecuta `pnpm start` en la computadora.
3. Conecta iPhone y computadora a la misma Wi-Fi/LAN.
4. Escanea el QR con la app **Camera** de iOS o desde Expo Go si el flujo disponible lo permite.
5. Acepta permisos de cámara y red local cuando iOS o Expo Go los soliciten.
6. Confirma que HorarioDCIApp abre en Expo Go y realiza el mismo smoke check local de navegación, datos incluidos, favoritos y exportación.

Resultado esperado: la app abre para pruebas locales. Validaciones de bundle ID, redirects nativos, firma o distribución iOS requieren una build nativa adecuada, no Expo Go.

## Red local, permisos y túnel

Expo Go en modo LAN necesita que el teléfono alcance la computadora que corre Metro.

Revisa esto primero:

- Ambos dispositivos están en la misma Wi-Fi o LAN.
- La red no es una red de invitados que aísla dispositivos.
- VPN, proxy corporativo o firewall no bloquean puertos locales de Expo/Metro.
- El sistema operativo permitió acceso de red local a Expo Go.
- El teléfono tiene permiso de cámara si escaneas desde una cámara integrada.

Si la red local está bloqueada, cambia a túnel desde la interfaz de Expo o reinicia Metro con la opción de túnel disponible en tu entorno. El túnel suele ser más lento, pero evita restricciones de LAN.

## Development build y validación nativa

Usa `pnpm start:dev-client` solamente cuando ya tienes instalada una development build de HorarioDCIApp en el teléfono:

```bash
pnpm start:dev-client
```

Esta ruta es para validar comportamiento nativo, Google OAuth real y redirects asociados a la identidad de la app:

| Plataforma | Identidad nativa |
|---|---|
| Android package | `com.luisbeto.horariodciapp` |
| iOS bundle ID | `com.luisbeto.horariodciapp` |
| Scheme | `com.luisbeto.horariodciapp` |

Google OAuth y Google Calendar NO deben aprobarse usando Expo Go como evidencia final. Para eso necesitas una development build o una build distribuida por Play Console que use las credenciales correctas.

## Play Console: internal, closed y public testing

`15luisbeto` controla la publicación en Google Play Console. Si hay una versión disponible para testers, `15luisbeto` o una persona delegada anunciará el track, la versión y las instrucciones.

| Track | Propósito | Gobernanza |
|---|---|---|
| Internal testing | Validación rápida con un grupo pequeño y controlado. | Espera invitación/instrucciones de `15luisbeto` o delegado. |
| Closed testing | Validación con testers cerrados antes de ampliar exposición. | No asumas disponibilidad; usa solo la versión anunciada. |
| Public/production | Distribución pública o candidata final. | Solo `15luisbeto` decide publicación o delega el proceso. |

No subas builds, cambies tracks ni anuncies disponibilidad sin coordinación explícita con `15luisbeto`.

## Notas mínimas de Android/iOS

- El repositorio no define overrides manuales de versión mínima Android/iOS en `app.config.ts`; se usan los valores compatibles con Expo SDK/EAS para la configuración actual.
- Para Expo Go, el mínimo práctico lo determina la versión actual de Expo Go disponible en Google Play/App Store para el dispositivo.
- Para Play Console o builds nativas, confirma compatibilidad del dispositivo, package/bundle ID y credenciales antes de usar la build como evidencia de release.

## Troubleshooting

| Problema | Qué revisar |
|---|---|
| El QR no carga en el teléfono | Confirma misma Wi-Fi/LAN, permisos de red local y que Metro sigue activo. |
| Expo Go queda cargando | Reinicia Metro, cierra/reabre Expo Go y vuelve a escanear el QR actual. |
| El teléfono no alcanza la computadora | Desactiva VPN/proxy temporalmente, revisa firewall y evita redes de invitados. |
| El QR viejo abre una sesión incorrecta | Detén Metro y ejecuta otra vez `pnpm start`; escanea el QR nuevo. |
| Permisos bloqueados | Revisa permisos de Expo Go en Android/iOS: cámara, red local y archivos/sharing si aplica. |
| La LAN está bloqueada | Usa modo túnel desde Expo como fallback. |
| Google OAuth falla en Expo Go | Es esperado para validación nativa real; usa development build o Play Console. |

## Cierre de prueba local

Una prueba local con Expo Go queda completa cuando puedes decir:

- [ ] La app abrió en el teléfono desde el QR actual.
- [ ] Navegación, datos incluidos, favoritos y exportación local fueron revisados como smoke check.
- [ ] No se usó Expo Go como evidencia final de Google OAuth o redirects nativos.
- [ ] Cualquier bloqueo de red/permisos quedó documentado para el equipo.
