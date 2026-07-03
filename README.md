# Sirius SAAC — Plataforma de Simulación e IA

¡Bienvenido a la plataforma web de **Sirius SAAC**! Este proyecto es un portal interactivo diseñado con una estética espacial y de ciencia ficción, que conecta dos módulos didácticos y de simulación astronómica asistidos por inteligencia artificial:

1. **Duelo de Clasificación Galáctica (Módulo A-1)**: Un juego interactivo donde observas galaxias y debes clasificarlas antes de que el algoritmo de IA lo haga.
2. **Simulador Crítico de Cohetes (Módulo R-9)**: Un simulador físico donde configuras masa, empuje, combustión y arrastre para comparar tus predicciones contra el modelo de vuelo simplificado de una IA.

---

## 🚀 Cómo descargar y ejecutar el proyecto

Este es un proyecto web estático desarrollado utilizando tecnologías nativas (HTML5, CSS3, JavaScript), por lo que no requiere configuraciones complejas de compilación ni dependencias pesadas.

### Requisitos previos
- Tener instalado [Git](https://git-scm.com/) en tu sistema.

### Instalación

1. **Clona este repositorio** en tu máquina local:
   ```bash
   git clone https://github.com/tu-usuario/sirius_web.git
   ```
2. **Entra en el directorio** del proyecto:
   ```bash
   cd sirius_web
   ```

### Ejecución
- **Opción rápida**: Simplemente haz doble clic en el archivo [index.html](file:///Users/hex/Documents/sirius_web/index.html) para abrir el portal directamente en tu navegador web.
- **Con un servidor local** (Recomendado para evitar problemas de políticas de origen CORS si se añaden APIs externas en el futuro):
  Si tienes instalado Node.js o Python, puedes iniciar un servidor de desarrollo rápido:
  - **Node.js (npx)**:
    ```bash
    npx serve .
    ```
  - **Python 3**:
    ```bash
    python -m http.server 8000
    ```
    Luego abre [http://localhost:8000](http://localhost:8000) en tu navegador.

---

## 🤝 Cómo colaborar

¡Nos encanta recibir contribuciones! Si deseas colaborar con el desarrollo de la Plataforma Sirius SAAC, sigue estos pasos:

1. **Haz un Fork** de este repositorio.
2. **Crea una rama** para tu nueva funcionalidad o corrección:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Realiza tus cambios** y asegúrate de mantener la coherencia con el diseño estético de ciencia ficción (fuentes *Space Grotesk*, *JetBrains Mono*, y paleta de colores oscuros/neón).
4. **Haz commit** de tus cambios:
   ```bash
   git commit -m "Añade nueva funcionalidad espacial"
   ```
5. **Sube tu rama** (Push):
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. Abre un **Pull Request** detallando tus cambios para que el equipo de Sirius SAAC pueda revisarlo.
