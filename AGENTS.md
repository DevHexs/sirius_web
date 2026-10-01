# Instrucciones para agentes — Sirius SAAC

Este repositorio contiene información y herramientas didácticas de astronomía para Sirius SAAC en Panamá. Se consulta principalmente desde teléfonos. Es un sitio estático generado con Astro y JavaScript nativo. La interfaz debe ser clara, profesional y divertida, sin sacrificar rigor científico ni accesibilidad.

## Al trabajar

- Lee solo los archivos relacionados con la tarea. Para crear o rediseñar páginas, consulta [docs/BASE_DEL_PROYECTO.md](docs/BASE_DEL_PROYECTO.md); para un módulo nuevo, usa también [docs/PLANTILLA_MODULO.md](docs/PLANTILLA_MODULO.md).
- Consulta [docs/EVALUACION_FRAMEWORK.md](docs/EVALUACION_FRAMEWORK.md) antes de cambiar la arquitectura. Astro genera el sitio estático actual.
- Reutiliza los tokens de `src/styles/global.css` y los patrones compartidos. La apariencia se elige con Sistema / Claro / Oscuro; «Científico/Cadete» es independiente. Evita colores y controles nuevos por página sin una razón documentada. Una visualización puede conservar una paleta propia si ayuda a comprenderla.
- Mantén la lógica del módulo en `src/scripts/` y sus estilos particulares en `src/styles/`. Evita ampliar los bloques `<style>` dentro de páginas y los estilos en línea.
- Escribe la interfaz en español claro. Muestra unidades, supuestos, límites del modelo y el objetivo de aprendizaje. No presentes reglas fijas o simulaciones como una IA generativa ni afirmes precisión científica no verificada.
- Diseña primero para teléfono: contenido y acción principal visibles, lectura cómoda, controles táctiles amplios y sin desplazamiento horizontal de la página. Usa HTML semántico, navegación por teclado, foco visible y movimiento reducido.
- Respeta los archivos sin seguimiento de Git y el trabajo local del equipo; revísalos antes de modificarlos como parte de una tarea.
- Al terminar, comprueba la interacción que cambiaste y resume qué verificaste y qué quedó pendiente.

## Mapa rápido

- `src/pages/`: portal y páginas Astro; las rutas públicas conservan la extensión `.html`.
- `src/layouts/SiteLayout.astro`: estructura común de página y metadatos.
- `src/styles/`: base compartida y estilos de cada módulo.
- `src/scripts/`: interacciones del portal y los módulos.
- `src/assets/`: recursos procesados por Astro.
- `astro.config.mjs`: salida estática y ruta base de GitHub Pages.
- `docs/BASE_DEL_PROYECTO.md`: decisiones, límites y secuencia para consolidar el sistema visual.
