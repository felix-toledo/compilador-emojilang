// Generador de código Python para EmojiLang - Convierte código intermedio en Python
class PythonGenerator {
  constructor() {
    this.indentLevel = 0;
    this.variables = new Set();
    this.functions = new Set();
    this.currentFunction = null;
  }

  generateCode(intermediateCode) {
    this.indentLevel = 0;
    this.variables.clear();
    this.functions.clear();
    this.currentFunction = null;
    
    let pythonCode = "# Código Python generado por EmojiLang\n\n";
    
    // Agregar imports necesarios
    pythonCode += "import sys\n";
    pythonCode += "from typing import Any, Union\n\n";
    
    // Primero, detectar y definir todas las funciones
    const functionDefs = this.generateFunctionDefinitions(intermediateCode);
    pythonCode += functionDefs;
    
    // Luego, generar el código principal
    pythonCode += "def main():\n";
    this.indentLevel = 1;
    
    // Procesar cada instrucción
    for (const instruction of intermediateCode.instructions) {
      // Saltar etiquetas de función y parámetros
      if (instruction.type === 'LABEL' && instruction.comment?.includes('función')) {
        continue;
      }
      if (instruction.type === 'PARAM') {
        continue;
      }
      
      const line = this.generateInstruction(instruction);
      if (line) {
        pythonCode += line + "\n";
      }
    }
    
    pythonCode += "\nif __name__ == '__main__':\n";
    pythonCode += "    main()\n";
    
    return {
      code: pythonCode,
      variables: Array.from(this.variables),
      functions: Array.from(this.functions),
      statistics: this.getStatistics(intermediateCode)
    };
  }

  generateInstruction(instruction) {
    switch (instruction.type) {
      case 'LABEL':
        return this.generateLabel(instruction);
      case 'LOAD':
        return this.generateLoad(instruction);
      case 'ASSIGN':
        return this.generateAssign(instruction);
      case 'BINARY_OP':
        return this.generateBinaryOp(instruction);
      case 'PRINT':
        return this.generatePrint(instruction);
      case 'INPUT':
        return this.generateInput(instruction);
      case 'IF_FALSE':
        return this.generateIfFalse(instruction);
      case 'GOTO':
        return this.generateGoto(instruction);
      case 'RETURN':
        return this.generateReturn(instruction);
      case 'PARAM':
        return this.generateParam(instruction);
      case 'FUNCTION_CALL':
        return this.generateFunctionCall(instruction);
      case 'END':
        return this.generateEnd(instruction);
      case 'ERROR':
        return this.generateError(instruction);
      default:
        return `# Instrucción no soportada: ${instruction.type}`;
    }
  }

  generateLabel(instruction) {
    // En Python, las etiquetas se convierten en comentarios o se eliminan
    return `# ${instruction.label}: ${instruction.comment || ''}`;
  }

  generateLoad(instruction) {
    const indent = this.getIndent();
    const value = this.formatValue(instruction.value);
    this.variables.add(instruction.target);
    
    return `${indent}${instruction.target} = ${value}  # ${instruction.comment || ''}`;
  }

  generateAssign(instruction) {
    const indent = this.getIndent();
    this.variables.add(instruction.target);
    
    // Si es una declaración de variable, usar la sintaxis apropiada
    if (instruction.kind === 'const') {
      return `${indent}# Constante: ${instruction.target} = ${instruction.source}  # ${instruction.comment || ''}`;
    } else {
      return `${indent}${instruction.target} = ${instruction.source}  # ${instruction.comment || ''}`;
    }
  }

  generateBinaryOp(instruction) {
    const indent = this.getIndent();
    const left = this.formatOperand(instruction.left);
    const right = this.formatOperand(instruction.right);
    const operator = this.mapOperator(instruction.operator);
    
    this.variables.add(instruction.target);
    
    return `${indent}${instruction.target} = ${left} ${operator} ${right}  # ${instruction.comment || ''}`;
  }

  generatePrint(instruction) {
    const indent = this.getIndent();
    const value = this.formatOperand(instruction.value);
    
    return `${indent}print(${value})  # ${instruction.comment || ''}`;
  }

  generateInput(instruction) {
    const indent = this.getIndent();
    const prompt = this.formatOperand(instruction.prompt);
    
    this.variables.add(instruction.target);
    
    return `${indent}${instruction.target} = input(${prompt})  # ${instruction.comment || ''}`;
  }

  generateIfFalse(instruction) {
    const indent = this.getIndent();
    const condition = this.formatOperand(instruction.condition);
    
    return `${indent}if not ${condition}:  # ${instruction.comment || ''}`;
  }

  generateGoto(instruction) {
    // En Python, los goto se convierten en comentarios
    return `# goto ${instruction.label}  # ${instruction.comment || ''}`;
  }

  generateReturn(instruction) {
    const indent = this.getIndent();
    
    if (instruction.value) {
      const value = this.formatOperand(instruction.value);
      return `${indent}return ${value}  # ${instruction.comment || ''}`;
    } else {
      return `${indent}return  # ${instruction.comment || ''}`;
    }
  }

  generateParam(instruction) {
    // Los parámetros se manejan en la declaración de función
    return `# param ${instruction.param}  # ${instruction.comment || ''}`;
  }

  generateFunctionCall(instruction) {
    const indent = this.getIndent();
    const args = instruction.arguments ? instruction.arguments.map(arg => this.formatOperand(arg)).join(', ') : '';
    
    this.variables.add(instruction.target);
    
    return `${indent}${instruction.target} = ${instruction.function}(${args})  # ${instruction.comment || ''}`;
  }

  generateEnd(instruction) {
    return `# ${instruction.comment || ''}`;
  }

  generateError(instruction) {
    return `# ERROR: ${instruction.message}`;
  }

  // Métodos auxiliares
  getIndent() {
    return '    '.repeat(this.indentLevel);
  }

  formatValue(value) {
    if (typeof value === 'string') {
      return `"${value}"`;
    } else if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    } else if (typeof value === 'number') {
      // Manejar casos especiales de números
      if (isNaN(value)) {
        return 'float("nan")';  // NaN en Python
      } else if (!isFinite(value)) {
        if (value > 0) {
          return 'float("inf")';  // Infinito positivo
        } else {
          return 'float("-inf")';  // Infinito negativo
        }
      } else {
        return String(value);
      }
    } else {
      return String(value);
    }
  }

  formatOperand(operand) {
    if (this.isVariable(operand)) {
      return operand;
    } else {
      return this.formatValue(operand);
    }
  }

  isVariable(operand) {
    return typeof operand === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(operand);
  }

  mapOperator(operator) {
    const operatorMap = {
      '+': '+',
      '-': '-',
      '*': '*',
      '/': '/',
      '==': '==',
      '!=': '!=',
      '<': '<',
      '>': '>',
      '<=': '<=',
      '>=': '>='
    };
    
    return operatorMap[operator] || operator;
  }

  getStatistics(intermediateCode) {
    const stats = {
      totalInstructions: intermediateCode.instructions.length,
      instructionTypes: {},
      variables: this.variables.size,
      functions: this.functions.size,
      linesOfCode: 0
    };
    
    // Contar tipos de instrucciones
    for (const instruction of intermediateCode.instructions) {
      if (!stats.instructionTypes[instruction.type]) {
        stats.instructionTypes[instruction.type] = 0;
      }
      stats.instructionTypes[instruction.type]++;
    }
    
    // Contar líneas de código (excluyendo comentarios y etiquetas)
    stats.linesOfCode = intermediateCode.instructions.filter(
      inst => !['LABEL', 'END', 'ERROR'].includes(inst.type)
    ).length;
    
    return stats;
  }

  // Método para generar código Python con mejor formato
  generateFormattedCode(intermediateCode) {
    const result = this.generateCode(intermediateCode);
    let formattedCode = result.code;
    
    // Mejorar el formato del código
    formattedCode = this.addFunctionDefinitions(formattedCode, intermediateCode);
    formattedCode = this.addTypeHints(formattedCode);
    formattedCode = this.addDocstrings(formattedCode);
    
    return {
      ...result,
      code: formattedCode
    };
  }

  addFunctionDefinitions(code, intermediateCode) {
    // Detectar funciones y agregar definiciones
    const functionPatterns = [];
    
    for (const instruction of intermediateCode.instructions) {
      if (instruction.type === 'LABEL' && instruction.comment?.includes('función')) {
        const funcName = instruction.comment.match(/función (\w+)/)?.[1];
        if (funcName) {
          functionPatterns.push({
            name: funcName,
            label: instruction.label,
            params: this.extractFunctionParams(intermediateCode, instruction.label)
          });
        }
      }
    }
    
    // Agregar definiciones de funciones al inicio del código
    let functionDefs = '';
    for (const func of functionPatterns) {
      functionDefs += `def ${func.name}(${func.params.join(', ')}):\n`;
      this.functions.add(func.name);
    }
    
    // Insertar definiciones de funciones después de los imports
    const importEndIndex = code.indexOf('\n\n');
    if (importEndIndex !== -1) {
      code = code.substring(0, importEndIndex + 2) + functionDefs + code.substring(importEndIndex + 2);
    } else {
      code = functionDefs + code;
    }
    
    // Remover las líneas de comentario de etiquetas de función
    for (const func of functionPatterns) {
      code = code.replace(`# ${func.label}: Inicio de función ${func.name}\n`, '');
      code = code.replace(`# ${func.label}: Fin de función ${func.name}\n`, '');
    }
    
    return code;
  }

  extractFunctionParams(intermediateCode, funcLabel) {
    const params = [];
    let inFunction = false;
    
    for (const instruction of intermediateCode.instructions) {
      if (instruction.type === 'LABEL' && instruction.label === funcLabel) {
        inFunction = true;
        continue;
      }
      
      if (inFunction && instruction.type === 'PARAM') {
        params.push(instruction.param);
      }
      
      if (inFunction && instruction.type === 'LABEL' && instruction.label !== funcLabel) {
        break;
      }
    }
    
    return params;
  }

  addTypeHints(code) {
    // Agregar type hints básicos solo a funciones que no son métodos de clase
    // No agregar self a funciones regulares
    return code;
  }

  addDocstrings(code) {
    // Agregar docstrings básicos a las funciones
    const lines = code.split('\n');
    const formattedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      formattedLines.push(line);
      
      // Agregar docstring después de definición de función
      if (line.trim().startsWith('def ') && line.trim().endsWith(':')) {
        const funcName = line.match(/def (\w+)/)?.[1];
        if (funcName) {
          formattedLines.push('    """Función generada automáticamente por EmojiLang."""');
        }
      }
    }
    
    return formattedLines.join('\n');
  }

  // Método para generar código Python ejecutable
  generateExecutableCode(intermediateCode) {
    const result = this.generateCode(intermediateCode);
    
    return {
      ...result,
      code: result.code,
      isExecutable: true
    };
  }

  generateFunctionDefinitions(intermediateCode) {
    let functionDefs = '';
    const functionPatterns = [];
    
    // Detectar funciones
    for (const instruction of intermediateCode.instructions) {
      if (instruction.type === 'LABEL' && instruction.comment?.includes('función')) {
        const funcName = instruction.comment.match(/función (\w+)/)?.[1];
        if (funcName) {
          functionPatterns.push({
            name: funcName,
            label: instruction.label,
            params: this.extractFunctionParams(intermediateCode, instruction.label)
          });
        }
      }
    }
    
    // Generar definiciones de funciones
    for (const func of functionPatterns) {
      functionDefs += `def ${func.name}(${func.params.join(', ')}):\n`;
      functionDefs += `    """Función generada automáticamente por EmojiLang."""\n`;
      
      // Generar cuerpo de la función
      let inFunction = false;
      for (const instruction of intermediateCode.instructions) {
        if (instruction.type === 'LABEL' && instruction.label === func.label) {
          inFunction = true;
          continue;
        }
        
        if (inFunction && instruction.type === 'LABEL' && instruction.label !== func.label) {
          break;
        }
        
        if (inFunction && instruction.type !== 'LABEL' && instruction.type !== 'PARAM') {
          const line = this.generateInstruction(instruction);
          if (line) {
            functionDefs += '    ' + line + '\n';
          }
        }
      }
      
      functionDefs += '\n';
      this.functions.add(func.name);
    }
    
    return functionDefs;
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PythonGenerator;
} 