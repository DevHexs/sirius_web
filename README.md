# Sirius SAAC — herramientas didácticas de astronomía

Sitio informativo y didáctico de astronomía para Sirius SAAC en Panamá, pensado principalmente para teléfonos. El portal reúne módulos interactivos que ayudan a explorar conceptos científicos y discutir los límites de modelos simplificados.

## Desarrollo local

Requiere Node.js 22.12 o superior. Instala dependencias y arranca Astro:

```bash
npm install
npm run dev
```

El servidor muestra la dirección local para abrir. `npm run build` genera el sitio estático en `dist/`; `npm run preview` permite revisar el build localmente. Las fuentes web y algunas imágenes de galaxias requieren conexión a internet.

## Estructura actual

| Archivo | Función |
| --- | --- |
| `src/pages/` | Portal y páginas públicas Astro |
| `src/layouts/` | Estructura HTML compartida |
| `src/styles/` | Estilos comunes y específicos por módulo |
| `src/scripts/` | Lógica interactiva JavaScript por módulo |
| `src/assets/` | Recursos procesados por Astro |

## Crear o mejorar un módulo

Lee [la base de trabajo](docs/BASE_DEL_PROYECTO.md), completa [la ficha de módulo](docs/PLANTILLA_MODULO.md) y usa los patrones compartidos que ya estén aprobados. [AGENTS.md](AGENTS.md) resume las reglas para agentes de programación. El proyecto usa Astro en modo estático y se publica en GitHub Pages mediante GitHub Actions. La identidad visual definitiva y el sistema de componentes son el siguiente trabajo de diseño del grupo.

Para proponer cambios, trabaja en una rama, comprueba el módulo en un servidor local y describe en la revisión qué interacción y contenido científico verificaste.

## Qué guardar en Git

Versionar `package.json` y `package-lock.json` para instalar las mismas dependencias, además de `astro.config.mjs` y `.github/workflows/deploy.yml` para compilar y desplegar el sitio en GitHub Pages. También se versionan las páginas, imágenes y demás recursos del sitio, la documentación y `AGENTS.md`. Si el equipo usará la skill de diseño compartida, versionar juntos `skills-lock.json`, `.agents/skills/` y sus licencias.

Mantener fuera de Git las dependencias instaladas, salidas de compilación, archivos temporales del editor y archivos `.env` con datos privados; esas exclusiones están en [`.gitignore`](.gitignore). Los clasificadores de estrellas y telescopios presentes en algunas copias locales son prototipos: siguen visibles para decidir cuándo incorporarlos, no están ignorados.
