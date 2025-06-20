# 🧑‍💻 EmojiLang Visualizer - Compilador HTML

Un compilador educativo completo que convierte código escrito en emojis a Python, mostrando todas las fases del proceso de compilación de forma visual e interactiva.

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
compiladorhtml/
├── 📁 src/                    # Código fuente principal
│   ├── 📁 core/               # Núcleo del compilador
│   │   └── compiler.js        # Orquestador principal
│   ├── 📁 analysis/           # Fases de análisis
│   │   ├── lexer.js           # Análisis léxico
│   │   ├── parser.js          # Análisis sintáctico
│   │   └── semantic.js        # Análisis semántico
│   ├── 📁 generation/         # Generación de código
│   │   ├── intermediate.js    # Código intermedio
│   │   ├── generator.js       # Generador principal
│   │   └── simple_generator.js # Generador simplificado
│   ├── 📁 optimization/       # Optimizaciones
│   │   └── optimizer.js       # Optimizador de código
│   ├── 📁 ui/                 # Interfaz de usuario
│   │   └── ast_visualizer.js  # Visualizador del AST
│   └── 📁 utils/              # Utilidades y debugging
│       ├── debug_operators.js # Debug de operadores
│       └── debug_parser.js    # Debug del parser
├── 📁 docs/                   # Documentación
│   └── README.md              # Documentación detallada
├── 📁 examples/               # Ejemplos de código
├── 📁 tests/                  # Pruebas unitarias
├── 📄 index.html              # Interfaz principal
├── 📄 package.json            # Dependencias del proyecto
└── 📄 package-lock.json       # Lock de dependencias
```

## 🎯 Características Principales

- **Lenguaje de programación visual** usando emojis
- **6 fases completas de compilación**:
  1. 🔤 Análisis Léxico (Tokens)
  2. 🌳 Análisis Sintáctico (AST)
  3. 🔍 Análisis Semántico
  4. ⚙️ Generación de Código Intermedio
  5. 🚀 Optimización
  6. 🐍 Generación de Código Python

- **Interfaz web moderna** y responsive
- **Arquitectura modular** y extensible
- **Manejo de errores** y advertencias
- **Estadísticas detalladas** del proceso

## 🚀 Cómo usar

1. Abre `index.html` en tu navegador
2. Escribe código usando los emojis disponibles
3. Presiona "Compilar y Visualizar"
4. Observa cada fase del proceso de compilación

## 📋 Módulos del Compilador

### 🔧 Core (`src/core/`)
- **`compiler.js`**: Orquestador principal que coordina todas las fases del compilador

### 🔍 Analysis (`src/analysis/`)
- **`lexer.js`**: Convierte código fuente en tokens
- **`parser.js`**: Construye el árbol de sintaxis abstracta (AST)
- **`semantic.js`**: Valida tipos, scopes y construye tabla de símbolos

### ⚙️ Generation (`src/generation/`)
- **`intermediate.js`**: Genera código intermedio optimizable
- **`generator.js`**: Generador principal de código Python
- **`simple_generator.js`**: Generador simplificado para casos básicos

### 🚀 Optimization (`src/optimization/`)
- **`optimizer.js`**: Aplica optimizaciones estáticas al código

### 🎨 UI (`src/ui/`)
- **`ast_visualizer.js`**: Visualiza el AST de forma interactiva

### 🛠️ Utils (`src/utils/`)
- **`debug_operators.js`**: Herramientas de debug para operadores
- **`debug_parser.js`**: Herramientas de debug para el parser

## 🎓 Propósito Educativo

Este proyecto está diseñado para:

- **Enseñar conceptos de compiladores** de forma visual
- **Demostrar cada fase** del proceso de compilación
- **Proporcionar ejemplos prácticos** de análisis léxico y sintáctico
- **Facilitar el aprendizaje** de lenguajes de programación
- **Mostrar optimizaciones** en tiempo de compilación

## 📚 Documentación Detallada

Para información completa sobre el lenguaje, sintaxis y ejemplos, consulta:
- [`docs/README.md`](docs/README.md) - Documentación completa del proyecto

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura de la interfaz
- **CSS3** - Estilos modernos y responsive
- **JavaScript ES6+** - Lógica del compilador
- **D3.js** - Visualización del AST
- **Arquitectura modular** - Código organizado y mantenible

## 🤖 Desarrollo con Cursor

Este proyecto fue desarrollado utilizando **Cursor**, un IDE inteligente que combina las capacidades de programación asistida por IA con un entorno de desarrollo moderno. Cursor facilitó significativamente el proceso de desarrollo al proporcionar:

- **Asistencia de código inteligente** para la implementación de algoritmos de compilación
- **Generación automática** de código para las fases de análisis léxico y sintáctico
- **Sugerencias contextuales** para optimizar la arquitectura modular
- **Debugging asistido** para resolver problemas complejos de parsing
- **Documentación automática** y comentarios explicativos

