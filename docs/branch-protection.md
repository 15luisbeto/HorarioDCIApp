# Branch protection para `main`

Esta guía define cómo configurar GitHub para que `main` sea una rama protegida. El objetivo es convertir la regla del equipo en una protección real: nadie debe integrar cambios a `main` sin revisión, CI verde y autorización del maintainer.

## Resumen recomendado

| Regla | Valor recomendado |
|---|---|
| Branch protegida | `main` |
| Pull request obligatorio | Sí |
| Checks obligatorios | `Test, lint, and typecheck` |
| Push directo a `main` | No |
| Force push | No |
| Deletion | No |
| Admin bypass | Solo `15luisbeto` si necesita una emergencia documentada |

## Prerrequisitos

- CI existe en `.github/workflows/ci.yml`.
- El workflow corre:
  - `pnpm test`
  - `pnpm lint`
  - `pnpm typecheck`
- `15luisbeto` controla el repositorio y debe aplicar estas reglas desde GitHub.

## Configuración en GitHub

1. Abre el repositorio en GitHub.
2. Ve a **Settings** → **Branches**.
3. En **Branch protection rules**, crea una regla para:

   ```txt
   main
   ```

4. Activa **Require a pull request before merging**.
5. Activa **Require status checks to pass before merging**.
6. Selecciona el check del workflow CI:

   ```txt
   Test, lint, and typecheck
   ```

7. Activa **Require branches to be up to date before merging** si el equipo quiere reducir conflictos antes del merge.
8. Activa **Do not allow bypassing the above settings** si quieres que incluso admins sigan el flujo normal.
9. Desactiva cualquier opción que permita force-push o eliminación de `main`.

## Flujo esperado después de proteger `main`

```txt
feature/fix/docs branch
        ↓
Pull Request
        ↓
CI: test + lint + typecheck
        ↓
review / autorización de maintainer
        ↓
merge a main
```

## Excepciones

Una excepción solo debe ocurrir si `15luisbeto` decide que hay una emergencia. La excepción debe quedar documentada en el PR, issue o release note correspondiente.

Ejemplos de excepción válida:

- hotfix urgente para release;
- rollback de publicación;
- corrección de configuración que bloquea el repositorio.

Ejemplos que NO justifican excepción:

- “es un cambio pequeño”;
- “solo es documentación”;
- “no quiero esperar CI”.

## Qué NO cubre esta protección

Branch protection no valida por sí sola:

- Google OAuth real;
- redirects nativos;
- Play Console testing;
- EAS builds;
- permisos de dispositivos Android/iOS.

Para esos casos, usa `docs/local-device-testing.md` y la plantilla `Release or Play Console testing`.

## Checklist de mantenimiento

- [ ] Confirmar que el check requerido se llama `Test, lint, and typecheck`.
- [ ] Confirmar que PRs nuevos muestran la plantilla de PR.
- [ ] Confirmar que issues nuevos muestran las plantillas del repositorio.
- [ ] Confirmar que `main` no acepta push directo para colaboradores sin autorización.
- [ ] Revisar esta guía cuando cambie el workflow CI.
