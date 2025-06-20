// Compilador principal de EmojiLang - Integra todos los módulos
class EmojiLangCompiler {
  constructor() {
    // Importar clases solo en Node.js
    if (typeof module !== 'undefined' && module.exports) {
      const Lexer = require('./lexer.js');
      const Parser = require('./parser.js');
      const SemanticAnalyzer = require('./semantic.js');
      const IntermediateCodeGenerator = require('./intermediate.js');
      const Optimizer = require('./optimizer.js');
      const SimplePythonGenerator = require('./simple_generator.js');
      
      this.lexer = new Lexer();
      this.parser = new Parser();
      this.semanticAnalyzer = new SemanticAnalyzer();
      this.intermediateGenerator = new IntermediateCodeGenerator();
      this.optimizer = new Optimizer();
      this.codeGenerator = new SimplePythonGenerator();
    } else {
      // En navegador, usar las clases globales
      this.lexer = new Lexer();
      this.parser = new Parser();
      this.semanticAnalyzer = new SemanticAnalyzer();
      this.intermediateGenerator = new IntermediateCodeGenerator();
      this.optimizer = new Optimizer();
      this.codeGenerator = new SimplePythonGenerator();
    }
    
    this.compilationSteps = [];
    this.errors = [];
    this.warnings = [];
  }

  compile(sourceCode) {
    this.compilationSteps = [];
    this.errors = [];
    this.warnings = [];
    
    try {
      // Paso 1: Análisis Léxico
      const tokens = this.lexer.tokenize(sourceCode);
      this.compilationSteps.push({
        name: 'Tokens',
        data: tokens,
        description: 'Análisis léxico completado'
      });
      
      // Paso 2: Análisis Sintáctico
      const ast = this.parser.parse(tokens);
      this.compilationSteps.push({
        name: 'AST',
        data: ast,
        description: 'Árbol de sintaxis abstracta generado'
      });
      
      // Paso 3: Análisis Semántico
      const semanticResult = this.semanticAnalyzer.analyze(ast);
      this.compilationSteps.push({
        name: 'Semantic',
        data: semanticResult,
        description: 'Análisis semántico completado'
      });
      
      this.errors.push(...semanticResult.errors);
      this.warnings.push(...semanticResult.warnings);
      
      // Paso 4: Generación de Código Intermedio
      const intermediateCode = this.intermediateGenerator.generateIntermediate(ast);
      this.compilationSteps.push({
        name: 'Intermediate',
        data: intermediateCode,
        description: 'Código intermedio generado'
      });
      
      // Paso 5: Optimización
      const optimizationResult = this.optimizer.optimize(intermediateCode);
      this.compilationSteps.push({
        name: 'Optimized',
        data: optimizationResult,
        description: 'Código optimizado'
      });
      
      // Paso 6: Generación de Código Final
      const finalCode = this.codeGenerator.generateCode(optimizationResult.optimized);
      this.compilationSteps.push({
        name: 'Python',
        data: finalCode,
        description: 'Código Python generado'
      });
      
      return {
        success: true,
        steps: this.compilationSteps,
        errors: this.errors,
        warnings: this.warnings,
        finalCode: finalCode.code,
        statistics: this.getCompilationStatistics()
      };
      
    } catch (error) {
      this.errors.push({
        message: error.message,
        type: 'compilation_error',
        line: 0
      });
      
      return {
        success: false,
        steps: this.compilationSteps,
        errors: this.errors,
        warnings: this.warnings,
        finalCode: null,
        statistics: this.getCompilationStatistics()
      };
    }
  }

  getCompilationStatistics() {
    const stats = {
      totalSteps: this.compilationSteps.length,
      errors: this.errors.length,
      warnings: this.warnings.length,
      optimizations: 0,
      tokens: 0,
      astNodes: 0,
      intermediateInstructions: 0,
      pythonLines: 0
    };
    
    // Contar tokens
    if (this.compilationSteps[0] && this.compilationSteps[0].data) {
      stats.tokens = this.compilationSteps[0].data.length;
    }
    
    // Contar nodos AST
    if (this.compilationSteps[1] && this.compilationSteps[1].data) {
      stats.astNodes = this.countASTNodes(this.compilationSteps[1].data);
    }
    
    // Contar instrucciones intermedias
    if (this.compilationSteps[3] && this.compilationSteps[3].data && this.compilationSteps[3].data.instructions) {
      stats.intermediateInstructions = this.compilationSteps[3].data.instructions.length;
    }
    
    // Contar optimizaciones
    if (this.compilationSteps[4] && this.compilationSteps[4].data && this.compilationSteps[4].data.optimizations) {
      stats.optimizations = this.compilationSteps[4].data.optimizations.length;
    }
    
    // Contar líneas de Python
    if (this.compilationSteps[5] && this.compilationSteps[5].data && this.compilationSteps[5].data.code) {
      stats.pythonLines = this.compilationSteps[5].data.code.split('\n').length;
    }
    
    return stats;
  }

  countASTNodes(node) {
    if (!node || typeof node !== 'object') return 0;
    
    let count = 1; // Contar el nodo actual
    
    // Contar nodos hijos
    for (const key in node) {
      if (Array.isArray(node[key])) {
        for (const child of node[key]) {
          count += this.countASTNodes(child);
        }
      } else if (typeof node[key] === 'object') {
        count += this.countASTNodes(node[key]);
      }
    }
    
    return count;
  }

  // Método para obtener información detallada de cada paso
  getStepDetails(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.compilationSteps.length) {
      return null;
    }
    
    const step = this.compilationSteps[stepIndex];
    
    switch (step.name) {
      case 'Tokens':
        return this.formatTokens(step.data);
      case 'AST':
        return this.formatAST(step.data);
      case 'Semantic':
        return this.formatSemantic(step.data);
      case 'Intermediate':
        return this.formatIntermediate(step.data);
      case 'Optimized':
        return this.formatOptimized(step.data);
      case 'Python':
        return this.formatPython(step.data);
      default:
        return JSON.stringify(step.data, null, 2);
    }
  }

  formatTokens(tokens) {
    let formatted = 'Tokens encontrados:\n\n';
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      formatted += `${i + 1}. ${token.type}: "${token.value}" (línea ${token.line}, columna ${token.column})\n`;
    }
    
    return formatted;
  }

  formatAST(ast) {
    return this.formatASTNode(ast, 0);
  }

  formatASTNode(node, depth) {
    const indent = '  '.repeat(depth);
    let formatted = `${indent}${node.type}`;
    
    if (node.name) formatted += ` (${node.name})`;
    if (node.value !== undefined) formatted += ` = ${node.value}`;
    if (node.operator) formatted += ` ${node.operator}`;
    
    formatted += '\n';
    
    // Procesar hijos
    if (node.body) {
      // Si node.body es un array (como en Program), iterar sobre él
      if (Array.isArray(node.body)) {
        for (const child of node.body) {
          formatted += this.formatASTNode(child, depth + 1);
        }
      } else {
        // Si node.body es un objeto (como Block en FunctionDeclaration), procesarlo directamente
        formatted += this.formatASTNode(node.body, depth + 1);
      }
    }
    
    if (node.statements) {
      for (const child of node.statements) {
        formatted += this.formatASTNode(child, depth + 1);
      }
    }
    
    if (node.left) formatted += this.formatASTNode(node.left, depth + 1);
    if (node.right) formatted += this.formatASTNode(node.right, depth + 1);
    if (node.expression) formatted += this.formatASTNode(node.expression, depth + 1);
    if (node.condition) formatted += this.formatASTNode(node.condition, depth + 1);
    if (node.thenBranch) formatted += this.formatASTNode(node.thenBranch, depth + 1);
    if (node.elseBranch) formatted += this.formatASTNode(node.elseBranch, depth + 1);
    
    return formatted;
  }

  formatSemantic(semanticResult) {
    let formatted = 'Análisis Semántico:\n\n';
    
    formatted += 'Tabla de Símbolos:\n';
    for (const symbol of semanticResult.symbolTable) {
      formatted += `  - ${symbol.name}: ${symbol.type} (${symbol.dataType}) [scope: ${symbol.scope}]\n`;
    }
    
    if (semanticResult.errors.length > 0) {
      formatted += '\nErrores:\n';
      for (const error of semanticResult.errors) {
        formatted += `  - ${error.message} (línea ${error.line})\n`;
      }
    }
    
    if (semanticResult.warnings.length > 0) {
      formatted += '\nAdvertencias:\n';
      for (const warning of semanticResult.warnings) {
        formatted += `  - ${warning.message} (línea ${warning.line})\n`;
      }
    }
    
    return formatted;
  }

  formatIntermediate(intermediateCode) {
    if (!intermediateCode || !intermediateCode.instructions) {
      return "Error: No se pudo generar código intermedio";
    }
    return this.intermediateGenerator.getIntermediateCode();
  }

  formatOptimized(optimizationResult) {
    if (!optimizationResult || !optimizationResult.optimizations) {
      return "Error: No se pudo optimizar el código";
    }
    
    let formatted = 'Optimizaciones aplicadas:\n\n';
    
    for (const opt of optimizationResult.optimizations) {
      formatted += `- ${opt.description}\n`;
    }
    
    formatted += '\nCódigo optimizado:\n';
    if (optimizationResult.optimized && optimizationResult.optimized.instructions) {
      formatted += this.optimizer.getOptimizedCode();
    } else {
      formatted += "Error: No se pudo generar código optimizado";
    }
    
    return formatted;
  }

  formatPython(pythonResult) {
    if (!pythonResult || !pythonResult.code) {
      return "Error: No se pudo generar código Python";
    }
    return pythonResult.code;
  }

  // Método para validar código fuente
  validateSource(sourceCode) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    if (!sourceCode || sourceCode.trim() === '') {
      validation.isValid = false;
      validation.errors.push('El código fuente está vacío');
    }
    
    // Verificar emojis válidos
    const validEmojis = ['🔧', '🔙', '❓', '🔄', '🧱', '📦', '➕', '➖', '🟢', '➗', '🖨️', '🎤', '✅', '❌'];
    const lines = sourceCode.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const emojis = line.match(/[🔧🔙❓🔄🧱📦➕➖🟢➗🖨️🎤✅❌]/g);
      
      if (emojis) {
        for (const emoji of emojis) {
          if (!validEmojis.includes(emoji)) {
            validation.warnings.push(`Emoji no reconocido '${emoji}' en línea ${i + 1}`);
          }
        }
      }
    }
    
    return validation;
  }

  // Método para obtener ejemplos de código
  getExamples() {
    return {
      'Hola Mundo': '🖨️("¡Hola Mundo!")',
      'Variables': '🧱 x = 10\n🖨️(x)',
      'Operaciones': '🧱 a = 5\n🧱 b = 3\n🧱 resultado = a ➕ b\n🖨️(resultado)',
      'Función': '🔧 suma(a, b) {\n  🔙 a ➕ b\n}\n🧱 resultado = suma(10, 20)\n🖨️(resultado)',
      'Condicional': '❓ (5 > 3) {\n  🖨️("5 es mayor que 3")\n}',
      'Bucle': '🔄 (i < 5) {\n  🖨️(i)\n  i = i ➕ 1\n}'
    };
  }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
  window.EmojiLangCompiler = EmojiLangCompiler;
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmojiLangCompiler;
} 