# 🧑‍💻 EmojiLang Visualizer

Un compilador educativo completo que convierte código escrito en emojis a Python, mostrando todas las fases del proceso de compilación de forma visual e interactiva.

## 🎯 Características

- **Lenguaje de programación visual** usando emojis
- **6 fases completas de compilación**:
  1. 🔤 Análisis Léxico (Tokens)
  2. 🌳 Análisis Sintáctico (AST)
  3. 🔍 Análisis Semántico
  4. ⚙️ Generación de Código Intermedio
  5. 🚀 Optimización
  6. 🐍 Generación de Código Python

- **Interfaz web moderna** y responsive
- **Ejemplos predefinidos** para aprender rápidamente
- **Estadísticas detalladas** del proceso de compilación
- **Manejo de errores** y advertencias
- **Arquitectura modular** y extensible

## 🚀 Cómo usar

1. Abre `aca.html` en tu navegador
2. Escribe código usando los emojis disponibles
3. Presiona "Compilar y Visualizar"
4. Observa cada fase del proceso de compilación

## 📝 Sintaxis del Lenguaje

### Emojis Disponibles

| Emoji | Función | Ejemplo |
|-------|---------|---------|
| 🔧 | Declarar función | `🔧 suma(a, b) { ... }` |
| 🔙 | Retornar valor | `🔙 a ➕ b` |
| ❓ | Condicional if | `❓ (x > 0) { ... }` |
| 🔄 | Bucle while | `🔄 (i < 10) { ... }` |
| 🧱 | Constante | `🧱 PI = 3.14159` |
| 📦 | Variable | `📦 nombre = "Juan"` |
| ➕ | Suma | `a ➕ b` |
| ➖ | Resta | `a ➖ b` |
| ✖️ | Multiplicación | `a ✖️ b` |
| ➗ | División | `a ➗ b` |
| 🖨️ | Imprimir | `🖨️("Hola")` |
| 🎤 | Entrada de usuario | `🎤("Ingresa tu nombre:")` |
| ✅ | Verdadero | `✅` |
| ❌ | Falso | `❌` |

### Ejemplos de Código

#### Hola Mundo
```
🖨️("¡Hola Mundo desde EmojiLang!")
```

#### Variables y Operaciones
```
🧱 nombre = "Juan"
🧱 edad = 25
🖨️("Hola " ➕ nombre)
🖨️("Tienes " ➕ edad ➕ " años")
```

#### Función
```
🔧 suma(a, b) {
  🔙 a ➕ b
}
🧱 resultado = suma(10, 20)
🖨️("La suma es: " ➕ resultado)
```

#### Condicional
```
🧱 numero = 15
❓ (numero > 10) {
  🖨️("El número es mayor que 10")
}
```

#### Bucle
```
🧱 contador = 1
🔄 (contador <= 5) {
  🖨️("Contador: " ➕ contador)
  contador = contador ➕ 1
}
```

## 🏗️ Arquitectura del Compilador

### Módulos Principales

1. **`lexer.js`** - Análisis léxico
   - Convierte código fuente en tokens
   - Maneja emojis, números, identificadores
   - Incluye información de línea y columna

2. **`parser.js`** - Análisis sintáctico
   - Construye AST jerárquico
   - Maneja expresiones, declaraciones, bloques
   - Implementa parser recursivo descendente

3. **`semantic.js`** - Análisis semántico
   - Valida tipos y scopes
   - Construye tabla de símbolos
   - Detecta errores semánticos

4. **`intermediate.js`** - Código intermedio
   - Genera pseudocódigo
   - Maneja variables temporales
   - Optimiza estructura de control

5. **`optimizer.js`** - Optimizaciones
   - Evaluación constante
   - Eliminación de código muerto
   - Propagación de constantes

6. **`generator.js`** - Generación de código
   - Convierte a Python ejecutable
   - Maneja tipos y conversiones
   - Genera código optimizado

7. **`compiler.js`** - Orquestador principal
   - Coordina todas las fases
   - Maneja errores y estadísticas
   - Proporciona API unificada

## 📊 Fases de Compilación

### 1. Análisis Léxico
- Divide el código fuente en tokens
- Identifica emojis, números, strings, identificadores
- Proporciona información de ubicación

### 2. Análisis Sintáctico
- Construye árbol de sintaxis abstracta (AST)
- Valida estructura del programa
- Maneja precedencia de operadores

### 3. Análisis Semántico
- Verifica tipos de datos
- Valida scopes y declaraciones
- Construye tabla de símbolos

### 4. Código Intermedio
- Genera representación intermedia
- Optimiza estructura de control
- Prepara para optimizaciones

### 5. Optimización
- Aplica optimizaciones estáticas
- Reduce código redundante
- Mejora rendimiento

### 6. Generación de Código
- Produce código Python ejecutable
- Maneja conversiones de tipos
- Genera código limpio y legible

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura de la interfaz
- **CSS3** - Estilos modernos y responsive
- **JavaScript ES6+** - Lógica del compilador
- **Arquitectura modular** - Código organizado y mantenible

## 📁 Estructura del Proyecto

```
compiladorhtml/
├── aca.html              # Interfaz principal
├── lexer.js              # Analizador léxico
├── parser.js             # Analizador sintáctico
├── semantic.js           # Analizador semántico
├── intermediate.js       # Generador de código intermedio
├── optimizer.js          # Optimizador
├── generator.js          # Generador de código Python
├── compiler.js           # Compilador principal
└── README.md             # Documentación
```

## 🎓 Propósito Educativo

Este proyecto está diseñado para:

- **Enseñar conceptos de compiladores** de forma visual
- **Demostrar cada fase** del proceso de compilación
- **Proporcionar ejemplos prácticos** de análisis léxico y sintáctico
- **Facilitar el aprendizaje** de lenguajes de programación
- **Mostrar optimizaciones** en tiempo de compilación

## 🚀 Futuras Mejoras

- [ ] Soporte para más tipos de datos
- [ ] Optimizaciones avanzadas
- [ ] Generación de código para otros lenguajes
- [ ] Debugger visual
- [ ] Más ejemplos y tutoriales
- [ ] Exportación de código generado

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Disfruta aprendiendo sobre compiladores con EmojiLang! 🎉** 