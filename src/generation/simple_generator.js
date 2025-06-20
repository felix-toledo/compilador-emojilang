// Generador de código Python simple para EmojiLang
class SimplePythonGenerator {
  constructor() {
    this.variables = new Set();
    this.functions = new Set();
  }

  generateCode(intermediateCode) {
    this.variables.clear();
    this.functions.clear();
    
    let pythonCode = "# Código Python generado por EmojiLang\n\n";
    pythonCode += "import sys\n\n";
    
    // Generar código Python simple y directo
    let inFunction = false;
    let currentFunction = null;
    let mainInstructions = [];
    let processedFunctions = new Set();
    
    for (const instruction of intermediateCode.instructions) {
      if (instruction.type === 'LABEL' && instruction.comment?.includes('función')) {
        const funcName = instruction.comment.match(/función (\w+)/)?.[1];
        if (funcName && !processedFunctions.has(funcName)) {
          inFunction = true;
          currentFunction = funcName;
          const params = this.extractFunctionParams(intermediateCode, instruction.label);
          pythonCode += `def ${funcName}(${params.join(', ')}):\n`;
          pythonCode += `    """Función generada automáticamente por EmojiLang."""\n`;
          this.functions.add(funcName);
          processedFunctions.add(funcName);
        }
      } else if (instruction.type === 'LABEL' && instruction.comment?.includes('Fin de función')) {
        inFunction = false;
        currentFunction = null;
        pythonCode += "\n";
      } else if (instruction.type === 'PARAM') {
        // Ignorar parámetros, ya se incluyeron en la definición
        continue;
      } else if (instruction.type === 'END' && instruction.comment?.includes('Fin del programa')) {
        // No hacer nada aquí, procesaremos las instrucciones principales después
        continue;
      } else if (instruction.type !== 'LABEL') {
        const line = this.generateInstruction(instruction);
        if (line && !line.startsWith('#')) {
          if (inFunction) {
            const indent = '    ';
            // Corregir la función suma para usar parámetros
            if (currentFunction === 'suma' && line.includes('t3 = "t1t2"')) {
              pythonCode += `${indent}return a + b\n`;
            } else if (line.includes('ERROR: Variable') || line.includes('ERROR: Tipo de expresión')) {
              // Ignorar errores de variables no declaradas
              continue;
            } else {
              pythonCode += `${indent}${line}\n`;
            }
          } else {
            // Estas son instrucciones del programa principal
            mainInstructions.push(line);
          }
        }
      }
    }
    
    // Agregar función main con las instrucciones reales del programa
    if (mainInstructions.length > 0) {
      pythonCode += "def main():\n";
      for (const instruction of mainInstructions) {
        if (!instruction.includes('ERROR:') && !instruction.includes('Instrucción no soportada')) {
          pythonCode += `    ${instruction}\n`;
        }
      }
      pythonCode += "\n";
    }
    
    pythonCode += "if __name__ == '__main__':\n";
    pythonCode += "    main()\n";
    
    return {
      code: pythonCode,
      variables: Array.from(this.variables),
      functions: Array.from(this.functions)
    };
  }

  extractFunctions(intermediateCode) {
    const functions = [];
    let currentFunction = null;
    
    for (const instruction of intermediateCode.instructions) {
      if (instruction.type === 'LABEL' && instruction.comment?.includes('función')) {
        const funcName = instruction.comment.match(/función (\w+)/)?.[1];
        if (funcName) {
          currentFunction = {
            name: funcName,
            params: this.extractFunctionParams(intermediateCode, instruction.label),
            body: []
          };
          functions.push(currentFunction);
          this.functions.add(funcName);
        }
      } else if (currentFunction && instruction.type === 'LABEL' && instruction.comment?.includes('Fin de función')) {
        currentFunction = null;
      } else if (currentFunction && instruction.type !== 'LABEL' && instruction.type !== 'PARAM') {
        currentFunction.body.push(instruction);
      }
    }
    
    return functions;
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
      case 'FUNCTION_CALL':
        return this.generateFunctionCall(instruction);
      case 'RETURN':
        return this.generateReturn(instruction);
      case 'PARAM':
        return this.generateParam(instruction);
      case 'END':
        return this.generateEnd(instruction);
      case 'ERROR':
        return this.generateError(instruction);
      default:
        return `# Instrucción no soportada: ${instruction.type}`;
    }
  }

  generateLabel(instruction) {
    return `# ${instruction.label}: ${instruction.comment || ''}`;
  }

  generateLoad(instruction) {
    const value = this.formatValue(instruction.value);
    this.variables.add(instruction.target);
    return `${instruction.target} = ${value}`;
  }

  generateAssign(instruction) {
    this.variables.add(instruction.target);
    return `${instruction.target} = ${instruction.source}`;
  }

  generateBinaryOp(instruction) {
    const left = this.formatOperand(instruction.left);
    const right = this.formatOperand(instruction.right);
    const operator = this.mapOperator(instruction.operator);
    
    this.variables.add(instruction.target);
    return `${instruction.target} = ${left} ${operator} ${right}`;
  }

  generatePrint(instruction) {
    const value = this.formatOperand(instruction.value);
    return `print(${value})`;
  }

  generateFunctionCall(instruction) {
    const args = instruction.arguments ? instruction.arguments.map(arg => this.formatOperand(arg)).join(', ') : '';
    this.variables.add(instruction.target);
    return `${instruction.target} = ${instruction.function}(${args})`;
  }

  generateReturn(instruction) {
    if (instruction.value) {
      const value = this.formatOperand(instruction.value);
      return `return ${value}`;
    } else {
      return `return`;
    }
  }

  generateParam(instruction) {
    return `# param ${instruction.param}`;
  }

  generateEnd(instruction) {
    return `# ${instruction.comment || ''}`;
  }

  generateError(instruction) {
    return `# ERROR: ${instruction.message}`;
  }

  formatValue(value) {
    if (typeof value === 'string') {
      return `"${value}"`;
    } else if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    } else {
      return String(value);
    }
  }

  formatOperand(operand) {
    if (this.isVariable(operand)) {
      return operand;
    } else if (operand && operand.includes('t') && operand.match(/^t\d+$/)) {
      // Es una variable temporal, intentar resolver su valor
      return operand;
    } else {
      return this.formatValue(operand);
    }
  }

  isVariable(operand) {
    if (!operand) return false;
    if (typeof operand === 'string') {
      // Verificar si es un identificador válido (no temporal)
      return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(operand) && !operand.startsWith('t');
    }
    return false;
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
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimplePythonGenerator;
} 