// Generador de código intermedio para EmojiLang - Convierte AST en pseudocódigo
class IntermediateCodeGenerator {
  constructor() {
    this.tempCounter = 0;
    this.labelCounter = 0;
    this.instructions = [];
    this.symbolTable = new Map();
  }

  generateIntermediate(ast) {
    this.tempCounter = 0;
    this.labelCounter = 0;
    this.instructions = [];
    this.symbolTable.clear();
    
    // Validar que el AST es válido
    if (!ast || !ast.body) {
      this.instructions.push({
        type: 'ERROR',
        message: 'AST inválido o vacío',
        comment: 'Error en la generación de código intermedio'
      });
      return {
        instructions: this.instructions,
        symbolTable: this.buildSymbolTable(),
        tempCount: this.tempCounter,
        labelCount: this.labelCounter
      };
    }
    
    this.visitProgram(ast);
    
    return {
      instructions: this.instructions,
      symbolTable: this.buildSymbolTable(),
      tempCount: this.tempCounter,
      labelCount: this.labelCounter
    };
  }

  visitProgram(node) {
    // Validar que node.body sea un array
    if (!Array.isArray(node.body)) {
      this.instructions.push({
        type: 'ERROR',
        message: 'El AST no tiene un body iterable (array)',
        comment: 'Error estructural en el AST'
      });
      return;
    }
    // Generar código para cada declaración
    for (const statement of node.body) {
      if (statement) {
        this.visitStatement(statement);
      }
    }
    // Agregar instrucción de fin de programa
    this.instructions.push({
      type: 'END',
      comment: 'Fin del programa'
    });
  }

  visitStatement(node) {
    if (!node) return;
    
    switch (node.type) {
      case 'FunctionDeclaration':
        this.visitFunctionDeclaration(node);
        break;
      case 'VariableDeclaration':
        this.visitVariableDeclaration(node);
        break;
      case 'IfStatement':
        this.visitIfStatement(node);
        break;
      case 'WhileStatement':
        this.visitWhileStatement(node);
        break;
      case 'PrintStatement':
        this.visitPrintStatement(node);
        break;
      case 'InputStatement':
        this.visitInputStatement(node);
        break;
      case 'ReturnStatement':
        this.visitReturnStatement(node);
        break;
      case 'ExpressionStatement':
        this.visitExpressionStatement(node);
        break;
      case 'Block':
        this.visitBlock(node);
        break;
      case 'ErrorStatement':
        this.visitErrorStatement(node);
        break;
      default:
        this.instructions.push({
          type: 'ERROR',
          message: `Tipo de statement no soportado: ${node.type}`,
          comment: 'Error en el procesamiento del statement'
        });
    }
  }

  visitErrorStatement(node) {
    this.instructions.push({
      type: 'ERROR',
      message: node.error || 'Error desconocido en el parsing',
      comment: `Error en línea ${node.line || 0}`
    });
  }

  visitFunctionDeclaration(node) {
    // Etiqueta de inicio de función
    const funcLabel = this.generateLabel();
    this.instructions.push({
      type: 'LABEL',
      label: funcLabel,
      comment: `Inicio de función ${node.name}`
    });

    // Guardar información de la función
    this.symbolTable.set(node.name, {
      type: 'function',
      label: funcLabel,
      params: node.params || [],
      localVars: []
    });

    // Procesar parámetros y agregarlos a la tabla de símbolos
    if (node.params) {
      for (let i = 0; i < node.params.length; i++) {
        const param = node.params[i];
        
        // Agregar parámetro a la tabla de símbolos
        this.symbolTable.set(param, {
          type: 'parameter',
          function: node.name,
          position: i,
          dataType: 'any'
        });
        
        this.instructions.push({
          type: 'PARAM',
          param: param,
          position: i,
          comment: `Parámetro ${param}`
        });
      }
    }

    // Procesar cuerpo de la función
    if (node.body) {
      this.visitBlock(node.body);
    }

    // Etiqueta de fin de función
    const endLabel = this.generateLabel();
    this.instructions.push({
      type: 'LABEL',
      label: endLabel,
      comment: `Fin de función ${node.name}`
    });
  }

  visitVariableDeclaration(node) {
    const temp = this.generateTemp();
    
    // Generar código para el valor de la variable
    const valueResult = this.visitExpression(node.value);
    
    // Asignar valor a la variable
    this.instructions.push({
      type: 'ASSIGN',
      target: node.name,
      source: valueResult,
      kind: node.kind,
      comment: `Declarar ${node.kind} ${node.name}`
    });

    // Guardar en tabla de símbolos
    this.symbolTable.set(node.name, {
      type: 'variable',
      kind: node.kind,
      temp: temp,
      dataType: this.getExpressionType(node.value)
    });

    return temp;
  }

  visitIfStatement(node) {
    const conditionResult = this.visitExpression(node.condition);
    const falseLabel = this.generateLabel();
    const endLabel = this.generateLabel();

    // Saltar a rama falsa si condición es falsa
    this.instructions.push({
      type: 'IF_FALSE',
      condition: conditionResult,
      label: falseLabel,
      comment: 'Si condición es falsa, saltar a else'
    });

    // Código de la rama verdadera
    if (node.thenBranch) {
      this.visitBlock(node.thenBranch);
    }

    // Saltar al final del if
    this.instructions.push({
      type: 'GOTO',
      label: endLabel,
      comment: 'Saltar al final del if'
    });

    // Etiqueta para rama falsa
    this.instructions.push({
      type: 'LABEL',
      label: falseLabel,
      comment: 'Rama else'
    });

    // Código de la rama falsa si existe
    if (node.elseBranch) {
      this.visitBlock(node.elseBranch);
    }

    // Etiqueta de fin del if
    this.instructions.push({
      type: 'LABEL',
      label: endLabel,
      comment: 'Fin del if'
    });
  }

  visitWhileStatement(node) {
    const startLabel = this.generateLabel();
    const endLabel = this.generateLabel();

    // Etiqueta de inicio del bucle
    this.instructions.push({
      type: 'LABEL',
      label: startLabel,
      comment: 'Inicio del bucle while'
    });

    // Evaluar condición
    const conditionResult = this.visitExpression(node.condition);

    // Saltar al final si condición es falsa
    this.instructions.push({
      type: 'IF_FALSE',
      condition: conditionResult,
      label: endLabel,
      comment: 'Si condición es falsa, salir del bucle'
    });

    // Código del cuerpo del bucle
    if (node.body) {
      this.visitBlock(node.body);
    }

    // Volver al inicio del bucle
    this.instructions.push({
      type: 'GOTO',
      label: startLabel,
      comment: 'Volver al inicio del bucle'
    });

    // Etiqueta de fin del bucle
    this.instructions.push({
      type: 'LABEL',
      label: endLabel,
      comment: 'Fin del bucle while'
    });
  }

  visitPrintStatement(node) {
    const valueResult = this.visitExpression(node.value);
    
    this.instructions.push({
      type: 'PRINT',
      value: valueResult,
      comment: 'Imprimir valor'
    });
  }

  visitInputStatement(node) {
    const promptResult = this.visitExpression(node.prompt);
    const temp = this.generateTemp();
    
    this.instructions.push({
      type: 'INPUT',
      prompt: promptResult,
      target: temp,
      comment: 'Leer entrada del usuario'
    });

    return temp;
  }

  visitReturnStatement(node) {
    if (node.value) {
      const valueResult = this.visitExpression(node.value);
      this.instructions.push({
        type: 'RETURN',
        value: valueResult,
        comment: 'Retornar valor'
      });
    } else {
      this.instructions.push({
        type: 'RETURN',
        value: null,
        comment: 'Retornar sin valor'
      });
    }
  }

  visitExpressionStatement(node) {
    if (node.expression) {
      this.visitExpression(node.expression);
    }
  }

  visitBlock(node) {
    // Validar que node.statements sea un array
    if (!node || !Array.isArray(node.statements)) {
      this.instructions.push({
        type: 'ERROR',
        message: 'Bloque sin statements iterables',
        comment: 'Error estructural en el AST (block)'
      });
      return;
    }
    for (const statement of node.statements) {
      if (statement) {
        this.visitStatement(statement);
      }
    }
  }

  visitExpression(node) {
    if (!node) return 'null';
    
    switch (node.type) {
      case 'Literal':
        return this.visitLiteral(node);
      case 'VariableExpression':
        return this.visitVariableExpression(node);
      case 'BinaryExpression':
        return this.visitBinaryExpression(node);
      case 'AssignmentExpression':
        return this.visitAssignmentExpression(node);
      case 'GroupingExpression':
        return this.visitGroupingExpression(node);
      case 'FunctionCall':
        return this.visitFunctionCall(node);
      default:
        this.instructions.push({
          type: 'ERROR',
          message: `Tipo de expresión no soportado: ${node.type}`,
          comment: 'Error en el procesamiento de expresión'
        });
        return this.generateTemp();
    }
  }

  visitLiteral(node) {
    const temp = this.generateTemp();
    
    this.instructions.push({
      type: 'LOAD',
      target: temp,
      value: node.value,
      comment: `Cargar literal ${node.value}`
    });

    return temp;
  }

  visitVariableExpression(node) {
    // Verificar que la variable existe
    if (!this.symbolTable.has(node.name)) {
      this.instructions.push({
        type: 'ERROR',
        message: `Variable '${node.name}' no declarada`,
        comment: 'Error semántico'
      });
      return this.generateTemp();
    }

    return node.name; // Retornar nombre de la variable directamente
  }

  visitBinaryExpression(node) {
    const leftResult = this.visitExpression(node.left);
    const rightResult = this.visitExpression(node.right);
    const temp = this.generateTemp();

    // Mapear operadores emoji a operadores estándar
    const operatorMap = {
      '➕': '+',
      '➖': '-',
      '🟢': '*',
      '➗': '/',
      '==': '==',
      '!=': '!=',
      '<': '<',
      '>': '>',
      '<=': '<=',
      '>=': '>='
    };

    const operator = operatorMap[node.operator] || node.operator;

    this.instructions.push({
      type: 'BINARY_OP',
      target: temp,
      left: leftResult,
      operator: operator,
      right: rightResult,
      comment: `Operación: ${leftResult} ${operator} ${rightResult}`
    });

    return temp;
  }

  visitAssignmentExpression(node) {
    const valueResult = this.visitExpression(node.value);

    this.instructions.push({
      type: 'ASSIGN',
      target: node.name,
      source: valueResult,
      comment: `Asignar ${valueResult} a ${node.name}`
    });

    return node.name;
  }

  visitGroupingExpression(node) {
    return this.visitExpression(node.expression);
  }

  visitFunctionCall(node) {
    const temp = this.generateTemp();
    
    // Verificar que la función existe
    if (!this.symbolTable.has(node.name)) {
      this.instructions.push({
        type: 'ERROR',
        message: `Función '${node.name}' no declarada`,
        comment: 'Error semántico'
      });
      return temp;
    }

    // Procesar argumentos
    const args = [];
    if (node.arguments) {
      for (const arg of node.arguments) {
        const argResult = this.visitExpression(arg);
        args.push(argResult);
      }
    }

    // Generar instrucción de llamada a función
    this.instructions.push({
      type: 'FUNCTION_CALL',
      target: temp,
      function: node.name,
      arguments: args,
      comment: `Llamar función ${node.name}`
    });

    return temp;
  }

  // Métodos auxiliares
  generateTemp() {
    return `t${++this.tempCounter}`;
  }

  generateLabel() {
    return `L${++this.labelCounter}`;
  }

  getExpressionType(node) {
    if (!node) return 'any';
    if (node.type === 'Literal') {
      if (typeof node.value === 'number') return 'number';
      if (typeof node.value === 'string') return 'string';
      if (typeof node.value === 'boolean') return 'boolean';
    }
    return 'any';
  }

  buildSymbolTable() {
    const table = [];
    for (const [name, info] of this.symbolTable) {
      table.push({
        name: name,
        type: info.type,
        kind: info.kind,
        dataType: info.dataType,
        label: info.label,
        params: info.params,
        temp: info.temp
      });
    }
    return table;
  }

  // Método para obtener el código intermedio como texto
  getIntermediateCode() {
    let code = "// Código Intermedio EmojiLang\n\n";
    
    for (const instruction of this.instructions) {
      switch (instruction.type) {
        case 'LABEL':
          code += `${instruction.label}:\n`;
          break;
        case 'LOAD':
          code += `  ${instruction.target} = ${instruction.value}  // ${instruction.comment}\n`;
          break;
        case 'ASSIGN':
          code += `  ${instruction.target} = ${instruction.source}  // ${instruction.comment}\n`;
          break;
        case 'BINARY_OP':
          code += `  ${instruction.target} = ${instruction.left} ${instruction.operator} ${instruction.right}  // ${instruction.comment}\n`;
          break;
        case 'PRINT':
          code += `  print ${instruction.value}  // ${instruction.comment}\n`;
          break;
        case 'INPUT':
          code += `  ${instruction.target} = input(${instruction.prompt})  // ${instruction.comment}\n`;
          break;
        case 'IF_FALSE':
          code += `  if not ${instruction.condition} goto ${instruction.label}  // ${instruction.comment}\n`;
          break;
        case 'GOTO':
          code += `  goto ${instruction.label}  // ${instruction.comment}\n`;
          break;
        case 'RETURN':
          if (instruction.value) {
            code += `  return ${instruction.value}  // ${instruction.comment}\n`;
          } else {
            code += `  return  // ${instruction.comment}\n`;
          }
          break;
        case 'PARAM':
          code += `  param ${instruction.param}  // ${instruction.comment}\n`;
          break;
        case 'FUNCTION_CALL':
          const args = instruction.arguments ? instruction.arguments.join(', ') : '';
          code += `  ${instruction.target} = call ${instruction.function}(${args})  // ${instruction.comment}\n`;
          break;
        case 'END':
          code += `  // ${instruction.comment}\n`;
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
  module.exports = IntermediateCodeGenerator;
} 