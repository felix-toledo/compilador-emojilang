// Optimizador para EmojiLang - Realiza optimizaciones en el código intermedio
class Optimizer {
  constructor() {
    this.optimizations = [];
    this.constantTable = new Map();
    this.optimized = { instructions: [] };
  }

  optimize(intermediateCode) {
    this.optimizations = [];
    this.constantTable.clear();
    
    // Validar que intermediateCode es válido
    if (!intermediateCode || !intermediateCode.instructions) {
      this.optimized = { instructions: [] };
      return {
        original: intermediateCode || {},
        optimized: this.optimized,
        optimizations: [],
        constantTable: []
      };
    }
    
    let optimizedCode = { ...intermediateCode };
    
    // Aplicar optimizaciones en orden
    optimizedCode = this.constantFolding(optimizedCode);
    optimizedCode = this.deadCodeElimination(optimizedCode);
    optimizedCode = this.commonSubexpressionElimination(optimizedCode);
    optimizedCode = this.constantPropagation(optimizedCode);
    optimizedCode = this.unreachableCodeElimination(optimizedCode);
    
    // Actualizar la propiedad optimized
    this.optimized = optimizedCode;
    
    return {
      original: intermediateCode,
      optimized: optimizedCode,
      optimizations: this.optimizations,
      constantTable: this.buildConstantTable()
    };
  }

  // Evaluación constante - Simplifica expresiones que se pueden calcular en tiempo de compilación
  constantFolding(code) {
    const optimized = { ...code };
    optimized.instructions = [];
    const tempValues = new Map(); // Mapa para rastrear valores de variables temporales
    
    for (let i = 0; i < code.instructions.length; i++) {
      const instruction = code.instructions[i];
      
      if (instruction.type === 'LOAD') {
        // Cargar valor constante
        optimized.instructions.push(instruction);
        tempValues.set(instruction.target, instruction.value);
      } else if (instruction.type === 'BINARY_OP') {
        // Obtener valores reales de los operandos
        let left = instruction.left;
        let right = instruction.right;
        
        // Buscar valores en el mapa de variables temporales
        if (tempValues.has(left)) {
          left = tempValues.get(left);
        }
        if (tempValues.has(right)) {
          right = tempValues.get(right);
        }
        
        // Verificar si ambos operandos son constantes
        if (this.isConstantValue(left) && this.isConstantValue(right)) {
          const result = this.evaluateConstantValues(left, instruction.operator, right);
          if (result !== null) {
            optimized.instructions.push({
              type: 'LOAD',
              target: instruction.target,
              value: result,
              comment: `Optimizado: ${left} ${instruction.operator} ${right} = ${result}`
            });
            
            this.optimizations.push({
              type: 'constant_folding',
              original: instruction,
              optimized: result,
              description: `Evaluación constante: ${left} ${instruction.operator} ${right} = ${result}`
            });
            
            // Guardar el resultado en el mapa
            tempValues.set(instruction.target, result);
            this.constantTable.set(instruction.target, result);
            continue;
          }
        }
        
        // Si no se pudo optimizar, mantener la instrucción original
        optimized.instructions.push(instruction);
      } else {
        // Otras instrucciones se mantienen igual
        optimized.instructions.push(instruction);
      }
    }
    
    return optimized;
  }

  // Eliminación de código muerto - Elimina código que nunca se ejecuta
  deadCodeElimination(code) {
    const optimized = { ...code };
    optimized.instructions = [];
    const reachable = new Set();
    
    // Marcar todas las etiquetas como alcanzables
    for (let i = 0; i < code.instructions.length; i++) {
      const instruction = code.instructions[i];
      if (instruction.type === 'LABEL') {
        reachable.add(instruction.label);
      }
    }
    
    // Marcar código alcanzable desde etiquetas
    for (let i = 0; i < code.instructions.length; i++) {
      const instruction = code.instructions[i];
      
      if (instruction.type === 'GOTO' || instruction.type === 'IF_FALSE') {
        reachable.add(instruction.label);
      }
      
      if (reachable.has(i) || this.isReachable(instruction)) {
        reachable.add(i);
        optimized.instructions.push(instruction);
      } else {
        this.optimizations.push({
          type: 'dead_code_elimination',
          original: instruction,
          description: `Eliminado código muerto: ${instruction.type}`
        });
      }
    }
    
    return optimized;
  }

  // Eliminación de subexpresiones comunes - Reutiliza resultados de expresiones repetidas
  commonSubexpressionElimination(code) {
    const optimized = { ...code };
    optimized.instructions = [];
    const expressionCache = new Map();
    
    for (const instruction of code.instructions) {
      if (instruction.type === 'BINARY_OP') {
        const exprKey = `${instruction.left}${instruction.operator}${instruction.right}`;
        
        if (expressionCache.has(exprKey)) {
          // Reemplazar con variable temporal existente
          const existingTemp = expressionCache.get(exprKey);
          optimized.instructions.push({
            type: 'ASSIGN',
            target: instruction.target,
            source: existingTemp,
            comment: `Reutilizando resultado de ${instruction.left} ${instruction.operator} ${instruction.right}`
          });
          
          this.optimizations.push({
            type: 'common_subexpression_elimination',
            original: instruction,
            optimized: existingTemp,
            description: `Reutilizada subexpresión común: ${instruction.left} ${instruction.operator} ${instruction.right}`
          });
        } else {
          // Agregar nueva expresión al cache
          expressionCache.set(exprKey, instruction.target);
          optimized.instructions.push(instruction);
        }
      } else {
        optimized.instructions.push(instruction);
      }
    }
    
    return optimized;
  }

  // Propagación de constantes - Reemplaza variables con valores constantes conocidos
  constantPropagation(code) {
    const optimized = { ...code };
    optimized.instructions = [];
    const constantValues = new Map();
    
    for (const instruction of code.instructions) {
      if (instruction.type === 'LOAD') {
        // Nueva constante definida
        constantValues.set(instruction.target, instruction.value);
        optimized.instructions.push(instruction);
      } else if (instruction.type === 'ASSIGN') {
        // Verificar si el valor fuente es una constante
        if (constantValues.has(instruction.source)) {
          const constantValue = constantValues.get(instruction.source);
          optimized.instructions.push({
            type: 'LOAD',
            target: instruction.target,
            value: constantValue,
            comment: `Propagación de constante: ${instruction.source} = ${constantValue}`
          });
          
          this.optimizations.push({
            type: 'constant_propagation',
            original: instruction,
            optimized: constantValue,
            description: `Propagada constante ${instruction.source} = ${constantValue}`
          });
          
          constantValues.set(instruction.target, constantValue);
        } else {
          optimized.instructions.push(instruction);
          // La variable ya no es constante
          constantValues.delete(instruction.target);
        }
      } else if (instruction.type === 'BINARY_OP') {
        // Solo propagar constantes si ambos operandos son realmente constantes
        const left = constantValues.has(instruction.left) ? constantValues.get(instruction.left) : instruction.left;
        const right = constantValues.has(instruction.right) ? constantValues.get(instruction.right) : instruction.right;
        
        // Solo optimizar si ambos operandos son literales (no variables)
        if (this.isConstant(left, code.instructions) && this.isConstant(right, code.instructions)) {
          const result = this.evaluateConstantExpression({
            ...instruction,
            left: left,
            right: right
          }, code.instructions);
          
          if (result !== null) {
            optimized.instructions.push({
              type: 'LOAD',
              target: instruction.target,
              value: result,
              comment: `Optimizado: ${left} ${instruction.operator} ${right} = ${result}`
            });
            
            this.optimizations.push({
              type: 'constant_propagation',
              original: instruction,
              optimized: result,
              description: `Optimizado: ${left} ${instruction.operator} ${right} = ${result}`
            });
            
            constantValues.set(instruction.target, result);
          } else {
            optimized.instructions.push(instruction);
          }
        } else {
          optimized.instructions.push(instruction);
        }
      } else {
        optimized.instructions.push(instruction);
      }
    }
    
    return optimized;
  }

  // Eliminación de código inalcanzable - Elimina código después de return o goto
  unreachableCodeElimination(code) {
    const optimized = { ...code };
    optimized.instructions = [];
    let unreachable = false;
    
    for (const instruction of code.instructions) {
      if (unreachable && instruction.type !== 'LABEL') {
        this.optimizations.push({
          type: 'unreachable_code_elimination',
          original: instruction,
          description: `Eliminado código inalcanzable: ${instruction.type}`
        });
        continue;
      }
      
      if (instruction.type === 'RETURN' || instruction.type === 'GOTO') {
        unreachable = true;
      } else if (instruction.type === 'LABEL') {
        unreachable = false;
      }
      
      optimized.instructions.push(instruction);
    }
    
    return optimized;
  }

  // Métodos auxiliares
  isConstantValue(value) {
    return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';
  }

  evaluateConstantValues(left, operator, right) {
    try {
      switch (operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          if (right === 0) return null; // División por cero
          return left / right;
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '<':
          return left < right;
        case '>':
          return left > right;
        case '<=':
          return left <= right;
        case '>=':
          return left >= right;
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  isConstant(value, instructions) {
    // Verificar si es un valor literal directo
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      return true;
    }
    
    // Verificar si es una variable temporal que contiene una constante
    if (typeof value === 'string' && value.startsWith('t')) {
      // Primero buscar en las instrucciones optimizadas ya procesadas
      for (const instruction of this.optimized.instructions) {
        if (instruction.type === 'LOAD' && instruction.target === value) {
          return typeof instruction.value === 'number' || typeof instruction.value === 'string' || typeof instruction.value === 'boolean';
        }
      }
      // Si no se encontró, buscar en las instrucciones originales
      for (const instruction of instructions) {
        if (instruction.type === 'LOAD' && instruction.target === value) {
          return typeof instruction.value === 'number' || typeof instruction.value === 'string' || typeof instruction.value === 'boolean';
        }
      }
    }
    
    return false;
  }

  evaluateConstantExpression(instruction, instructions) {
    let left = instruction.left;
    let right = instruction.right;
    const operator = instruction.operator;
    
    // Si los operandos son variables temporales, buscar sus valores constantes
    if (typeof left === 'string' && left.startsWith('t')) {
      // Primero buscar en las instrucciones optimizadas ya procesadas
      for (const instr of this.optimized.instructions) {
        if (instr.type === 'LOAD' && instr.target === left) {
          left = instr.value;
          break;
        }
      }
      // Si no se encontró, buscar en las instrucciones originales
      if (typeof left === 'string' && left.startsWith('t')) {
        for (const instr of instructions) {
          if (instr.type === 'LOAD' && instr.target === left) {
            left = instr.value;
            break;
          }
        }
      }
    }
    
    if (typeof right === 'string' && right.startsWith('t')) {
      // Primero buscar en las instrucciones optimizadas ya procesadas
      for (const instr of this.optimized.instructions) {
        if (instr.type === 'LOAD' && instr.target === right) {
          right = instr.value;
          break;
        }
      }
      // Si no se encontró, buscar en las instrucciones originales
      if (typeof right === 'string' && right.startsWith('t')) {
        for (const instr of instructions) {
          if (instr.type === 'LOAD' && instr.target === right) {
            right = instr.value;
            break;
          }
        }
      }
    }
    
    // Verificar que ambos operandos son realmente valores constantes
    if (typeof left !== 'number' && typeof left !== 'string' && typeof left !== 'boolean') {
      return null;
    }
    if (typeof right !== 'number' && typeof right !== 'string' && typeof right !== 'boolean') {
      return null;
    }
    
    try {
      switch (operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          if (right === 0) return null; // División por cero
          return left / right;
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '<':
          return left < right;
        case '>':
          return left > right;
        case '<=':
          return left <= right;
        case '>=':
          return left >= right;
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  isReachable(instruction) {
    // Las primeras instrucciones siempre son alcanzables
    return true;
  }

  buildConstantTable() {
    const table = [];
    for (const [name, value] of this.constantTable) {
      table.push({
        name: name,
        value: value,
        type: typeof value
      });
    }
    return table;
  }

  // Método para obtener estadísticas de optimización
  getOptimizationStats() {
    const stats = {
      totalOptimizations: this.optimizations.length,
      byType: {}
    };
    
    for (const opt of this.optimizations) {
      if (!stats.byType[opt.type]) {
        stats.byType[opt.type] = 0;
      }
      stats.byType[opt.type]++;
    }
    
    return stats;
  }

  // Método para obtener el código optimizado como texto
  getOptimizedCode() {
    let code = "// Código Optimizado EmojiLang\n\n";
    
    // Verificar que tenemos instrucciones optimizadas
    if (!this.optimized || !this.optimized.instructions) {
      return code + "// No hay código optimizado disponible\n";
    }
    
    for (const instruction of this.optimized.instructions) {
      switch (instruction.type) {
        case 'LABEL':
          code += `${instruction.label}:\n`;
          break;
        case 'LOAD':
          code += `  ${instruction.target} = ${instruction.value}  // ${instruction.comment || ''}\n`;
          break;
        case 'ASSIGN':
          code += `  ${instruction.target} = ${instruction.source}  // ${instruction.comment || ''}\n`;
          break;
        case 'BINARY_OP':
          code += `  ${instruction.target} = ${instruction.left} ${instruction.operator} ${instruction.right}  // ${instruction.comment || ''}\n`;
          break;
        case 'PRINT':
          code += `  print ${instruction.value}  // ${instruction.comment || ''}\n`;
          break;
        case 'INPUT':
          code += `  ${instruction.target} = input(${instruction.prompt})  // ${instruction.comment || ''}\n`;
          break;
        case 'IF_FALSE':
          code += `  if not ${instruction.condition} goto ${instruction.label}  // ${instruction.comment || ''}\n`;
          break;
        case 'GOTO':
          code += `  goto ${instruction.label}  // ${instruction.comment || ''}\n`;
          break;
        case 'RETURN':
          if (instruction.value) {
            code += `  return ${instruction.value}  // ${instruction.comment || ''}\n`;
          } else {
            code += `  return  // ${instruction.comment || ''}\n`;
          }
          break;
        case 'PARAM':
          code += `  param ${instruction.param}  // ${instruction.comment || ''}\n`;
          break;
        case 'END':
          code += `  // ${instruction.comment || ''}\n`;
          break;
        case 'ERROR':
          code += `  // ERROR: ${instruction.message}\n`;
          break;
      }
    }
    
    return code;
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Optimizer;
} 