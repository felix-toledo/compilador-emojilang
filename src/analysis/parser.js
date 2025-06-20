// Parser para EmojiLang - Construye AST jerárquico
class Parser {
  constructor() {
    this.tokens = [];
    this.current = 0;
  }

  parse(tokens) {
    this.tokens = tokens;
    this.current = 0;
    
    // Validar que hay tokens
    if (!tokens || tokens.length === 0) {
      return {
        type: 'Program',
        body: []
      };
    }
    
    const program = {
      type: 'Program',
      body: []
    };
    
    while (!this.isAtEnd()) {
      try {
        const statement = this.parseStatement();
        if (statement) {
          program.body.push(statement);
        }
      } catch (error) {
        // Si hay un error, agregar un nodo de error y continuar
        program.body.push({
          type: 'ErrorStatement',
          error: error.message,
          line: this.peek()?.line || 0
        });
        break; // Salir del bucle para evitar errores infinitos
      }
    }
    
    return program;
  }

  parseStatement() {
    if (this.isAtEnd()) return null;
    
    if (this.match('FUNC')) {
      return this.parseFunctionDeclaration();
    }
    if (this.match('CONST') || this.match('VAR')) {
      return this.parseVariableDeclaration();
    }
    if (this.match('IF')) {
      return this.parseIfStatement();
    }
    if (this.match('WHILE')) {
      return this.parseWhileStatement();
    }
    if (this.match('PRINT')) {
      return this.parsePrintStatement();
    }
    if (this.match('INPUT')) {
      return this.parseInputStatement();
    }
    if (this.match('RETURN')) {
      return this.parseReturnStatement();
    }
    
    // Expresión como statement
    return this.parseExpressionStatement();
  }

  parseFunctionDeclaration() {
    // No necesitamos advance() aquí porque match() ya consumió el token FUNC
    
    const name = this.consume('IDENTIFIER', 'Se esperaba nombre de función').value;
    
    this.consume('LPAREN', 'Se esperaba (');
    const params = this.parseParameters();
    this.consume('RPAREN', 'Se esperaba )');
    
    this.consume('LBRACE', 'Se esperaba {');
    const body = this.parseBlock();
    this.consume('RBRACE', 'Se esperaba }');
    
    return {
      type: 'FunctionDeclaration',
      name: name,
      params: params,
      body: body
    };
  }

  parseVariableDeclaration() {
    const isConst = this.match('CONST');
    if (!isConst) {
      // Si no es CONST, debe ser VAR
      this.match('VAR');
    }
    
    const name = this.consume('IDENTIFIER', 'Se esperaba nombre de variable').value;
    
    this.consume('ASSIGN', 'Se esperaba =');
    const value = this.parseExpression();
    
    return {
      type: 'VariableDeclaration',
      kind: isConst ? 'const' : 'var',
      name: name,
      value: value
    };
  }

  parseIfStatement() {
    // No necesitamos advance() aquí porque match() ya consumió el token IF
    
    this.consume('LPAREN', 'Se esperaba (');
    const condition = this.parseExpression();
    this.consume('RPAREN', 'Se esperaba )');
    
    this.consume('LBRACE', 'Se esperaba {');
    const thenBranch = this.parseBlock();
    this.consume('RBRACE', 'Se esperaba }');
    
    let elseBranch = null;
    if (this.match('ELSE')) {
      this.advance();
      this.consume('LBRACE', 'Se esperaba {');
      elseBranch = this.parseBlock();
      this.consume('RBRACE', 'Se esperaba }');
    }
    
    return {
      type: 'IfStatement',
      condition: condition,
      thenBranch: thenBranch,
      elseBranch: elseBranch
    };
  }

  parseWhileStatement() {
    // No necesitamos advance() aquí porque match() ya consumió el token WHILE
    
    this.consume('LPAREN', 'Se esperaba (');
    const condition = this.parseExpression();
    this.consume('RPAREN', 'Se esperaba )');
    
    this.consume('LBRACE', 'Se esperaba {');
    const body = this.parseBlock();
    this.consume('RBRACE', 'Se esperaba }');
    
    return {
      type: 'WhileStatement',
      condition: condition,
      body: body
    };
  }

  parsePrintStatement() {
    // No necesitamos advance() aquí porque match() ya consumió el token PRINT
    
    this.consume('LPAREN', 'Se esperaba (');
    const value = this.parseExpression();
    this.consume('RPAREN', 'Se esperaba )');
    
    return {
      type: 'PrintStatement',
      value: value
    };
  }

  parseInputStatement() {
    // No necesitamos advance() aquí porque match() ya consumió el token INPUT
    
    this.consume('LPAREN', 'Se esperaba (');
    const prompt = this.parseExpression();
    this.consume('RPAREN', 'Se esperaba )');
    
    return {
      type: 'InputStatement',
      prompt: prompt
    };
  }

  parseReturnStatement() {
    // No necesitamos advance() aquí porque match() ya consumió el token RETURN
    
    let value = null;
    if (!this.match('SEMICOLON')) {
      value = this.parseExpression();
    }
    
    return {
      type: 'ReturnStatement',
      value: value
    };
  }

  parseExpressionStatement() {
    const expression = this.parseExpression();
    return {
      type: 'ExpressionStatement',
      expression: expression
    };
  }

  parseExpression() {
    const result = this.parseAssignment();
    return result;
  }

  parseAssignment() {
    const expr = this.parseEquality();
    
    if (this.match('ASSIGN')) {
      const equals = this.previous();
      const value = this.parseAssignment();
      
      if (expr.type === 'VariableExpression') {
        return {
          type: 'AssignmentExpression',
          name: expr.name,
          value: value
        };
      }
      
      this.error(equals, 'Objetivo de asignación inválido');
    }
    
    return expr;
  }

  parseEquality() {
    let expr = this.parseComparison();
    
    while (this.match('COMPARISON')) {
      const operator = this.previous();
      const right = this.parseComparison();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator: operator.value,
        right: right
      };
    }
    
    return expr;
  }

  parseComparison() {
    let expr = this.parseTerm();
    
    while (this.match('COMPARISON')) {
      const operator = this.previous();
      const right = this.parseTerm();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator: operator.value,
        right: right
      };
    }
    
    return expr;
  }

  parseTerm() {
    let expr = this.parseFactor();
    
    while (this.match('PLUS', 'MINUS')) {
      const operator = this.previous();
      const right = this.parseFactor();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator: operator.value,
        right: right
      };
    }
    
    return expr;
  }

  parseFactor() {
    let expr = this.parsePrimary();
    
    while (this.match('MULTIPLY', 'DIVIDE')) {
      const operator = this.previous();
      const right = this.parsePrimary();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator: operator.value,
        right: right
      };
    }
    
    return expr;
  }

  parsePrimary() {
    if (this.match('TRUE')) {
      return { type: 'Literal', value: true };
    }
    if (this.match('FALSE')) {
      return { type: 'Literal', value: false };
    }
    if (this.match('NUMBER')) {
      return { type: 'Literal', value: this.previous().value };
    }
    if (this.match('STRING')) {
      return { type: 'Literal', value: this.previous().value };
    }
    if (this.match('IDENTIFIER')) {
      const name = this.previous().value;
      
      // Verificar si es una llamada a función
      if (this.match('LPAREN')) {
        const args = this.parseArguments();
        this.consume('RPAREN', 'Se esperaba )');
        return {
          type: 'FunctionCall',
          name: name,
          arguments: args
        };
      }
      
      return { type: 'VariableExpression', name: name };
    }
    if (this.match('LPAREN')) {
      const expr = this.parseExpression();
      this.consume('RPAREN', 'Se esperaba )');
      return { type: 'GroupingExpression', expression: expr };
    }
    
    // Si llegamos aquí, no hay una expresión válida
    const token = this.peek();
    if (token && token.type === 'EOF') {
      this.error(token, 'Se esperaba expresión pero se encontró el final del archivo');
    } else {
      this.error(token, 'Se esperaba expresión');
    }
  }

  parseParameters() {
    const params = [];
    
    if (!this.match('RPAREN')) {
      do {
        params.push(this.consume('IDENTIFIER', 'Se esperaba parámetro').value);
      } while (this.match('COMMA'));
    }
    
    return params;
  }

  parseArguments() {
    const args = [];
    
    if (!this.match('RPAREN')) {
      do {
        args.push(this.parseExpression());
      } while (this.match('COMMA'));
    }
    
    return args;
  }

  parseBlock() {
    const statements = [];
    
    while (!this.check('RBRACE') && !this.isAtEnd()) {
      try {
        const statement = this.parseStatement();
        if (statement) {
          statements.push(statement);
        }
      } catch (error) {
        // Si hay un error en el parsing, agregar un nodo de error y continuar
        statements.push({
          type: 'ErrorStatement',
          error: error.message,
          line: this.peek()?.line || 0
        });
        
        // Avanzar para evitar bucle infinito
        if (!this.isAtEnd()) {
          this.advance();
        }
      }
    }
    
    return {
      type: 'Block',
      statements: statements
    };
  }

  // Métodos auxiliares
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.current >= this.tokens.length || this.peek().type === 'EOF';
  }

  peek() {
    if (this.current >= this.tokens.length) {
      return { type: 'EOF', value: '', line: 0, column: 0 };
    }
    return this.tokens[this.current];
  }

  previous() {
    if (this.current === 0) {
      return { type: 'EOF', value: '', line: 0, column: 0 };
    }
    return this.tokens[this.current - 1];
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    this.error(this.peek(), message);
  }

  error(token, message) {
    const line = token ? token.line : 0;
    const column = token ? token.column : 0;
    throw new Error(`Error en línea ${line}, columna ${column}: ${message}`);
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Parser;
} 