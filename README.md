# 🌟 LingoQuest English Pro

> **Aprende Inglés Jugando** • De Español a Inglés • Métodos Científicos & Gamificación Interactiva

LingoQuest English Pro es una aplicación web interactiva de alto rendimiento diseñada para hispanohablantes que desean dominar el idioma inglés desde nivel inicial (A1) hasta intermedio/avanzado (B2). Integra repetición espaciada (SRS), síntesis y reconocimiento de voz nativos, **6 minijuegos arcade**, liga semanal competitiva y simulación de conversaciones de la vida real.

---

## 🚀 Características Principales

### 1. 🗺️ Ruta de Aprendizaje Estructurada (7 Unidades Pedagógicas)
- **Unidad 1:** Primeros Pasos, Saludos y Presentaciones (Saludos, Datos personales, Verbo To Be y Edad).
- **Unidad 2:** Restaurante, Comidas & Bebidas (Cafetería, Pedir la cuenta, Alergias y Preferencias).
- **Unidad 3:** Viajes, Aeropuerto & Direcciones (Control de aduana, Cómo llegar a un lugar, Transporte público y Hotel).
- **Unidad 4:** Trabajo, Rutina & Tecnología (Rutina diaria, Correos electrónicos, Reuniones de trabajo).
- **Unidad 5:** Compras, Tiendas & Ropa (Tallas, Devoluciones, Precios, Preguntar descuentos).
- **Unidad 6:** Salud, Síntomas & En la Farmacia (Dolores comunes, Pedir medicamentos, Cita médica).
- **Unidad 7:** Vida Social, Ocio & Amigos (Pasatiempos, Invitaciones a salir, Planes de fin de semana).
- **Más de 45 ejercicios interactivos:** Constructor de oraciones palabra por palabra, desafíos auditivos, emparejamiento de vocabulario y opción múltiple con explicaciones gramaticales.

### 2. ⚡ Centro Arcade (6 Minijuegos Educativos)
1. **Speed Match Contrarreloj:** Empareja parejas de palabras en inglés y español contra el reloj con combos continuos (+60 parejas).
2. **Word Fall (Lluvia de Palabras):** Atrapa las burbujas flotantes con la traducción correcta antes de que toquen la línea de peligro.
3. **Sentence Scramble:** Ordena las piezas de oraciones en inglés contra el reloj con reproducción de entonación nativa.
4. **Audio Detective:** Afina el oído distinguiendo palabras fonéticamente similares (*minimal pairs* como *sheep/ship*, *three/tree*) en oraciones misteriosas.
5. **Simulador de Conversación (Roleplay):** Diálogos interactivos ramificados en situaciones reales (Londres, JFK, Manhattan, Miami).
6. **Tarjetas Inteligentes 3D (Flashcards SRS):** Repetición espaciada con tarjetas 3D flip, transcripción fonética (IPA) y filtro por categorías.

### 3. 🏆 Liga Semanal Competitiva (Liga Zafiro)
- Clasificación en tiempo real con podio 🥇🥈🥉.
- Compite contra otros estudiantes y asciende puestos a medida que ganas XP en tus lecciones y partidas arcade.

### 4. 🎙️ Entrenador de Pronunciación Oral (Speech Recognition)
- Practica hablando en inglés directamente a tu micrófono.
- Evaluación algorítmica de precisión fonética con retroalimentación instantánea.

### 5. 🎭 Personalización de Avatar y Tienda
- Elige tu personaje favorito para la liga y el perfil: León 🦁, Búho 🦉, Zorro 🦊, Astronauta 🧑‍🚀, Gato 🐱 o Dragón 👑.
- **Escudo de Racha (Streak Freeze):** Adquiere protectores con tus gemas para salvar tu racha si un día no puedes practicar.
- Vidas (❤️), Gemas (💎), Rachas diarias (🔥) y Medallas desbloqueables.

### 6. 🔊 Web Audio API Procedural & Síntesis de Voz
- Efectos de sonido sintetizados en tiempo real mediante Web Audio API (cero archivos pesados de audio).
- Modo oscuro y modo claro accesibles con un solo toque.
- Alternador de marco móvil o pantalla completa para escritorio y dispositivos táctiles.

---

## 🛠️ Estructura del Proyecto

```
proyecto de idioma de ingles/
├── css/
│   ├── style.css          # Sistema de diseño, layout, HUD, modales, liga y tema
│   └── games.css          # Estilos de ejercicios, 6 minijuegos arcade y modales
├── js/
│   ├── app.js             # Controlador principal, liga, avatares y enrutador
│   ├── data/
│   │   └── lessons.js     # Base de datos curricular (7 unidades, 60+ pares, scrambles y detective)
│   ├── games/
│   │   ├── wordBuilder.js      # Runner de ejercicios interactivos y reconocimiento de voz
│   │   ├── speedMatch.js       # Minijuego contrarreloj con racha de combos
│   │   ├── wordFall.js         # Minijuego de lluvia de palabras y reflejos léxicos
│   │   ├── sentenceScramble.js # Minijuego de orden sintáctico con temporizador
│   │   ├── audioDetective.js   # Minijuego de discriminación auditiva y pares mínimos
│   │   ├── flashcards.js       # Sistema de tarjetas 3D y repaso espaciado (SRS)
│   │   └── roleplay.js         # Simulador conversacional ramificado
│   └── services/
│       ├── audio.js       # Síntesis procedural de sonido (Web Audio API)
│       ├── speech.js      # Text-to-Speech y Speech-to-Text nativo
│       └── storage.js     # Persistencia local (LocalStorage), liga, avatares y medallas
├── index.html             # Estructura semántica de la aplicación
├── server.js              # Servidor HTTP ligero en Node.js puro (cero dependencias)
├── .gitignore
└── README.md
```

---

## 💻 Instalación y Ejecución

### Opción 1: Con Node.js (Recomendado)
No requiere instalar paquetes con `npm install` (utiliza módulos nativos de Node.js):

```bash
node server.js
```
Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

### Opción 2: Con cualquier servidor web estático
Puedes servir el directorio con cualquier herramienta como Live Server en VS Code o npx:

```bash
npx serve .
```

---

## 📜 Licencia

Desarrollado con dedicación para el aprendizaje accesible y divertido del idioma inglés.
Repositorio oficial: [traderxael/proyecto-de-idioma-de-ingles](https://github.com/traderxael/proyecto-de-idioma-de-ingles)
