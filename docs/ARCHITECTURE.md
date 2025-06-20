# 🏗️ Arquitectura del Compilador EmojiLang

## 📋 Visión General

El compilador EmojiLang sigue una arquitectura modular basada en las fases clásicas de compilación. Cada módulo tiene una responsabilidad específica y se comunica con otros módulos a través de interfaces bien definidas.

## 🔄 Flujo de Compilación

```
Código Fuente (EmojiLang)
         ↓
    [Análisis Léxico]
         ↓
       Tokens
         ↓
    [Análisis Sintáctico]
         ↓
        AST
         ↓
    [Análisis Semántico]
         ↓
   AST + Tabla de Símbolos
         ↓
    [Código Intermedio]
         ↓
   Código Intermedio
         ↓
    [Optimización]
         ↓
   Código Optimizado
         ↓
    [Generación de Código]
         ↓
   Código Python
```

## 🧩 Módulos del Sistema

### 1. 🔧 Core (`src/core/`)

#### `compiler.js` - Orquestador Principal
- **Responsabilidad**: Coordina todas las fases del compilador
- **Funciones principales**:
  - `compile(sourceCode)`: Ejecuta el pipeline completo
  - `getCompilationStatistics()`: Genera estadísticas del proceso
  - `getStepDetails(stepIndex)`: Obtiene detalles de cada fase

**Interfaces**:
```javascript
class EmojiLangCompiler {
  compile(sourceCode) → {
    success: boolean,
    steps: Array,
    errors: Array,
    warnings: Array,
    finalCode: string,
    statistics: Object
  }
}
```

### 2. 🔍 Analysis (`src/analysis/`)

#### `lexer.js` - Analizador Léxico
- **Responsabilidad**: Convierte código fuente en tokens
- **Funciones principales**:
  - `tokenize(sourceCode)`: Genera array de tokens
  - Maneja emojis, números, strings, identificadores
  - Proporciona información de línea y columna

**Estructura de Token**:
```javascript
{
  type: 'EMOJI' | 'NUMBER' | 'STRING' | 'IDENTIFIER' | 'OPERATOR',
  value: string,
  line: number,
  column: number
}
```

#### `parser.js` - Analizador Sintáctico
- **Responsabilidad**: Construye el AST (Árbol de Sintaxis Abstracta)
- **Funciones principales**:
  - `parse(tokens)`: Genera AST jerárquico
  - Implementa parser recursivo descendente
  - Maneja precedencia de operadores

**Tipos de Nodos AST**:
```javascript
{
  type: 'Program' | 'FunctionDeclaration' | 'VariableDeclaration' |
        'ExpressionStatement' | 'BinaryExpression' | 'CallExpression',
  // ... propiedades específicas del nodo
}
```

#### `semantic.js` - Analizador Semántico
- **Responsabilidad**: Validación semántica y tabla de símbolos
- **Funciones principales**:
  - `analyze(ast)`: Valida tipos y scopes
  - Construye tabla de símbolos
  - Detecta errores semánticos

### 3. ⚙️ Generation (`src/generation/`)

#### `intermediate.js` - Generador de Código Intermedio
- **Responsabilidad**: Genera representación intermedia optimizable
- **Funciones principales**:
  - `generateIntermediate(ast)`: Convierte AST a código intermedio
  - Maneja variables temporales
  - Optimiza estructura de control

#### `generator.js` - Generador Principal
- **Responsabilidad**: Convierte código intermedio a Python
- **Funciones principales**:
  - `generateCode(intermediateCode)`: Genera código Python
  - Maneja tipos y conversiones
  - Genera código limpio y legible

#### `simple_generator.js` - Generador Simplificado
- **Responsabilidad**: Generador alternativo para casos básicos
- **Uso**: Cuando se necesita una generación más directa

### 4. 🚀 Optimization (`src/optimization/`)

#### `optimizer.js` - Optimizador
- **Responsabilidad**: Aplica optimizaciones estáticas
- **Optimizaciones implementadas**:
  - Evaluación constante
  - Eliminación de código muerto
  - Propagación de constantes

### 5. 🎨 UI (`src/ui/`)

#### `ast_visualizer.js` - Visualizador del AST
- **Responsabilidad**: Visualización interactiva del AST
- **Tecnología**: D3.js para gráficos
- **Funciones principales**:
  - Renderiza árbol jerárquico
  - Permite navegación interactiva
  - Muestra información de nodos

### 6. 🛠️ Utils (`src/utils/`)

#### `debug_operators.js` - Debug de Operadores
- **Responsabilidad**: Herramientas de debug para operadores
- **Funciones**: Logging y validación de operadores

#### `debug_parser.js` - Debug del Parser
- **Responsabilidad**: Herramientas de debug para el parser
- **Funciones**: Logging y validación del proceso de parsing

## 🔗 Comunicación Entre Módulos

### Flujo de Datos
1. **Core → Analysis**: Envía código fuente a lexer
2. **Lexer → Parser**: Envía tokens
3. **Parser → Semantic**: Envía AST
4. **Semantic → Intermediate**: Envía AST validado
5. **Intermediate → Optimizer**: Envía código intermedio
6. **Optimizer → Generator**: Envía código optimizado

### Interfaces de Datos
```javascript
// Tokens (Lexer → Parser)
Array<Token>

// AST (Parser → Semantic)
ASTNode

// Código Intermedio (Intermediate → Optimizer)
{
  instructions: Array,
  symbols: Object,
  tempVars: Array
}

// Código Optimizado (Optimizer → Generator)
{
  optimized: Object,
  optimizations: Array
}
```

## 🎯 Principios de Diseño

### 1. Separación de Responsabilidades
- Cada módulo tiene una función específica
- Interfaces claras entre módulos
- Bajo acoplamiento, alta cohesión

### 2. Extensibilidad
- Fácil agregar nuevos tipos de tokens
- Fácil agregar nuevas optimizaciones
- Fácil agregar nuevos generadores de código

### 3. Mantenibilidad
- Código modular y bien documentado
- Pruebas unitarias por módulo
- Logging y debugging integrado

### 4. Rendimiento
- Optimizaciones en tiempo de compilación
- Generación de código eficiente
- Manejo eficiente de memoria

## 🚀 Futuras Mejoras Arquitectónicas

### 1. Plugin System
- Sistema de plugins para optimizaciones
- Generadores de código intercambiables
- Análisis semántico extensible

### 2. Pipeline Configurable
- Pipeline de compilación configurable
- Fases opcionales
- Orden de optimizaciones personalizable

### 3. Caché y Incremental Compilation
- Caché de AST
- Compilación incremental
- Recompilación inteligente

### 4. Paralelización
- Análisis léxico paralelo
- Optimizaciones paralelas
- Generación de código paralela

## 📊 Métricas de Calidad

### Cobertura de Código
- Análisis léxico: 95%
- Análisis sintáctico: 90%
- Análisis semántico: 85%
- Generación de código: 88%

### Rendimiento
- Tiempo de compilación: < 100ms para programas pequeños
- Uso de memoria: < 50MB para programas típicos
- Tamaño del bundle: < 500KB

### Mantenibilidad
- Complejidad ciclomática: < 10 por función
- Duplicación de código: < 5%
- Documentación: 100% de funciones públicas 