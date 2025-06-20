// Analizador semántico para EmojiLang - Valida y construye tabla de símbolos
class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new Map();
    this.scopes = [new Map()]; // Stack de scopes
    this.currentScope = 0;
    this.errors = [];
    this.warnings = [];
  }

  analyze(ast) {
    this.errors = [];
    this.warnings = [];
    this.symbolTable.clear();
    this.scopes = [new Map()];
    this.currentScope = 0;
    
    this.visitProgram(ast);
    
    return {
      symbolTable: this.buildSymbolTable(),
      errors: this.errors,
      warnings: this.warnings,
      isValid: this.errors.length === 0
    };
  }

  visitProgram(node) {
    if (!node || !Array.isArray(node.body)) {
      this.addError('El AST no tiene un body iterable (array)', node);
      return;
    }
    for (const statement of node.body) {
      this.visitStatement(statement);
    }
  }

  visitStatement(node) {
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
    }
  }

  visitFunctionDeclaration(node) {
    // Verificar si la función ya está declarada
    if (this.isDeclaredInCurrentScope(node.name)) {
      this.addError(`Función '${node.name}' ya está declarada`, node);
      return;
    }

    // Agregar función a la tabla de símbolos
    const functionSymbol = {
      type: 'function',
      name: node.name,
      params: node.params,
      returnType: 'any', // Por simplicidad
      scope: this.currentScope,
      line: node.line || 0
    };

    this.declareSymbol(node.name, functionSymbol);

    // Crear nuevo scope para la función
    this.enterScope();
    
    // Declarar parámetros en el nuevo scope
    for (const param of node.params) {
      const paramSymbol = {
        type: 'parameter',
        name: param,
        dataType: 'any',
        scope: this.currentScope,
        line: node.line || 0
      };
      this.declareSymbol(param, paramSymbol);
    }

    // Analizar el cuerpo de la función
    this.visitBlock(node.body);
    
    this.exitScope();
  }

  visitVariableDeclaration(node) {
    // Verificar si la variable ya está declarada en el scope actual
    if (this.isDeclaredInCurrentScope(node.name)) {
      this.addError(`Variable '${node.name}' ya está declarada`, node);
      return;
    }

    // Analizar el valor de la variable
    const valueType = this.visitExpression(node.value);

    // Agregar variable a la tabla de símbolos
    const variableSymbol = {
      type: 'variable',
      name: node.name,
      kind: node.kind, // 'const' o 'var'
      dataType: valueType,
      scope: this.currentScope,
      line: node.line || 0,
      isInitialized: true
    };

    this.declareSymbol(node.name, variableSymbol);
  }

  visitIfStatement(node) {
    // Verificar que la condición sea booleana
    const conditionType = this.visitExpression(node.condition);
    if (conditionType !== 'boolean' && conditionType !== 'any') {
      this.addWarning(`Condición del if debería ser booleana, pero es ${conditionType}`, node);
    }

    // Analizar rama then
    this.enterScope();
    this.visitBlock(node.thenBranch);
    this.exitScope();

    // Analizar rama else si existe
    if (node.elseBranch) {
      this.enterScope();
      this.visitBlock(node.elseBranch);
      this.exitScope();
    }
  }

  visitWhileStatement(node) {
    // Verificar que la condición sea booleana
    const conditionType = this.visitExpression(node.condition);
    if (conditionType !== 'boolean' && conditionType !== 'any') {
      this.addWarning(`Condición del while debería ser booleana, pero es ${conditionType}`, node);
    }

    // Analizar el cuerpo del while
    this.enterScope();
    this.visitBlock(node.body);
    this.exitScope();
  }

  visitPrintStatement(node) {
    // Analizar la expresión a imprimir
    this.visitExpression(node.value);
  }

  visitInputStatement(node) {
    // Analizar el prompt
    this.visitExpression(node.prompt);
  }

  visitReturnStatement(node) {
    if (node.value) {
      this.visitExpression(node.value);
    }
  }

  visitExpressionStatement(node) {
    this.visitExpression(node.expression);
  }

  visitBlock(node) {
    if (!node || !Array.isArray(node.statements)) {
      this.addError('Bloque sin statements iterables', node);
      return;
    }
    for (const statement of node.statements) {
      this.visitStatement(statement);
    }
  }

  visitExpression(node) {
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
        return 'any';
    }
  }

  visitLiteral(node) {
    if (typeof node.value === 'number') return 'number';
    if (typeof node.value === 'string') return 'string';
    if (typeof node.value === 'boolean') return 'boolean';
    return 'any';
  }

  visitVariableExpression(node) {
    // Verificar que la variable esté declarada
    const symbol = this.findSymbol(node.name);
    if (!symbol) {
      this.addError(`Variable '${node.name}' no está declarada`, node);
      return 'any';
    }
    return symbol.dataType || 'any';
  }

  visitBinaryExpression(node) {
    const leftType = this.visitExpression(node.left);
    const rightType = this.visitExpression(node.right);

    // Verificar compatibilidad de tipos
    if (leftType !== rightType && leftType !== 'any' && rightType !== 'any') {
      this.addWarning(`Operación entre tipos incompatibles: ${leftType} ${node.operator} ${rightType}`, node);
    }

    // Determinar tipo de resultado
    switch (node.operator) {
      case '➕':
      case '➖':
      case '✖️':
      case '➗':
        if (leftType === 'number' && rightType === 'number') return 'number';
        if (leftType === 'string' && rightType === 'string' && node.operator === '➕') return 'string';
        return 'any';
      case '==':
      case '!=':
      case '<':
      case '>':
      case '<=':
      case '>=':
        return 'boolean';
      default:
        return 'any';
    }
  }

  visitAssignmentExpression(node) {
    // Verificar que la variable esté declarada
    const symbol = this.findSymbol(node.name);
    if (!symbol) {
      this.addError(`Variable '${node.name}' no está declarada`, node);
      return 'any';
    }

    // Verificar que no sea una constante
    if (symbol.kind === 'const') {
      this.addError(`No se puede reasignar la constante '${node.name}'`, node);
    }

    const valueType = this.visitExpression(node.value);
    
    // Verificar compatibilidad de tipos
    if (symbol.dataType && valueType !== symbol.dataType && valueType !== 'any') {
      this.addWarning(`Asignación de tipo ${valueType} a variable de tipo ${symbol.dataType}`, node);
    }

    return valueType;
  }

  visitGroupingExpression(node) {
    return this.visitExpression(node.expression);
  }

  visitFunctionCall(node) {
    // Verificar que la función esté declarada
    const symbol = this.findSymbol(node.name);
    if (!symbol) {
      this.addError(`Función '${node.name}' no está declarada`, node);
      return 'any';
    }

    if (symbol.type !== 'function') {
      this.addError(`'${node.name}' no es una función`, node);
      return 'any';
    }

    // Verificar número de argumentos
    const expectedArgs = symbol.params ? symbol.params.length : 0;
    const actualArgs = node.arguments ? node.arguments.length : 0;
    
    if (expectedArgs !== actualArgs) {
      this.addError(`Función '${node.name}' espera ${expectedArgs} argumentos, pero se proporcionaron ${actualArgs}`, node);
    }

    // Analizar argumentos
    if (node.arguments) {
      for (const arg of node.arguments) {
        this.visitExpression(arg);
      }
    }

    // Retornar tipo de retorno de la función
    return symbol.returnType || 'any';
  }

  // Métodos auxiliares para manejo de scopes
  enterScope() {
    this.scopes.push(new Map());
    this.currentScope++;
  }

  exitScope() {
    this.scopes.pop();
    this.currentScope--;
  }

  declareSymbol(name, symbol) {
    this.scopes[this.currentScope].set(name, symbol);
  }

  findSymbol(name) {
    // Buscar desde el scope más interno hacia afuera
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const symbol = this.scopes[i].get(name);
      if (symbol) return symbol;
    }
    return null;
  }

  isDeclaredInCurrentScope(name) {
    return this.scopes[this.currentScope].has(name);
  }

  buildSymbolTable() {
    const table = [];
    for (const scope of this.scopes) {
      for (const [name, symbol] of scope) {
        table.push({
          name: name,
          type: symbol.type,
          dataType: symbol.dataType || 'any',
          scope: symbol.scope,
          line: symbol.line,
          kind: symbol.kind,
          params: symbol.params
        });
      }
    }
    return table;
  }

  addError(message, node) {
    this.errors.push({
      message: message,
      line: node.line || 0,
      type: 'error'
    });
  }

  addWarning(message, node) {
    this.warnings.push({
      message: message,
      line: node.line || 0,
      type: 'warning'
    });
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SemanticAnalyzer;
} 