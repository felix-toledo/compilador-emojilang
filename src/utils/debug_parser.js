// Debug específico para el código problemático
console.log('=== DEBUG CÓDIGO PROBLEMÁTICO ===');

// Cargar módulos
const Lexer = require('./lexer.js');
const Parser = require('./parser.js');

// Código problemático
const testCode = `🔧 suma(a, b) {
  🔙 a ➕ b
}
🧱 resultado = suma(10, 20)
🖨️("La suma es: " ➕ resultado)`;

console.log('Código:', testCode);

// Paso 1: Generar tokens
const lexer = new Lexer();
const tokens = lexer.tokenize(testCode);

console.log('\n=== TOKENS ===');
tokens.forEach((token, index) => {
  console.log(`${index + 1}. ${token.type}: "${token.value}" (línea ${token.line}, columna ${token.column})`);
});

// Paso 2: Generar AST
const parser = new Parser();
const ast = parser.parse(tokens);

console.log('\n=== AST DETALLADO ===');
console.log('Tipo:', ast.type);
console.log('Body length:', ast.body.length);

ast.body.forEach((stmt, index) => {
  console.log(`\nStatement ${index}:`, stmt.type);
  
  if (stmt.type === 'FunctionDeclaration') {
    console.log(`  - Función: ${stmt.name}`);
    console.log(`  - Parámetros:`, stmt.params);
    console.log(`  - Body:`, stmt.body.type);
  } else if (stmt.type === 'VariableDeclaration') {
    console.log(`  - Variable: ${stmt.name}`);
    console.log(`  - Valor:`, stmt.value.type);
  } else if (stmt.type === 'ErrorStatement') {
    console.log(`  - Error: ${stmt.error}`);
  }
});

// Paso 3: Probar cada statement individualmente
console.log('\n=== PRUEBA STATEMENTS INDIVIDUALES ===');

// Probar solo la línea problemática: 🧱 resultado = suma(10, 20)
const problemCode = '🧱 resultado = suma(10, 20)';
console.log('Probando:', problemCode);

const problemTokens = lexer.tokenize(problemCode);
console.log('Tokens de la línea problemática:');
problemTokens.forEach((token, index) => {
  console.log(`${index + 1}. ${token.type}: "${token.value}"`);
});

try {
  const problemParser = new Parser();
  const problemAST = problemParser.parse(problemTokens);
  console.log('AST de la línea problemática:', problemAST.body[0].type);
} catch (error) {
  console.log('Error en línea problemática:', error.message);
}

// Paso 4: Verificar cada statement
console.log('\nVerificando statements:');
ast.body.forEach((stmt, index) => {
  console.log(`Statement ${index}:`, stmt.type);
  
  if (stmt.type === 'FunctionDeclaration') {
    console.log(`  - Función: ${stmt.name}`);
    console.log(`  - ¿Tiene body?`, stmt.hasOwnProperty('body'));
    console.log(`  - Body es array?`, Array.isArray(stmt.body));
    console.log(`  - Body:`, stmt.body);
    
    if (stmt.body && stmt.body.type === 'Block') {
      console.log(`  - Block statements es array?`, Array.isArray(stmt.body.statements));
      console.log(`  - Block statements:`, stmt.body.statements);
    }
  }
});

// Paso 5: Probar cada fase por separado
console.log('\n=== PRUEBA DE FASES ===');

// Fase 1: Lexer
console.log('1. Lexer: ✅ OK');

// Fase 2: Parser
console.log('2. Parser: ✅ OK');

// Fase 3: Semantic Analyzer
console.log('3. Semantic Analyzer:');
try {
  const SemanticAnalyzer = require('./semantic.js');
  const semantic = new SemanticAnalyzer();
  const result = semantic.analyze(ast);
  console.log('   ✅ OK - Errores:', result.errors.length);
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Fase 4: Intermediate Code Generator
console.log('4. Intermediate Code Generator:');
try {
  const IntermediateCodeGenerator = require('./intermediate.js');
  const intermediate = new IntermediateCodeGenerator();
  const result = intermediate.generateIntermediate(ast);
  console.log('   ✅ OK - Instrucciones:', result.instructions.length);
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Fase 5: Optimizer
console.log('5. Optimizer:');
try {
  const Optimizer = require('./optimizer.js');
  const optimizer = new Optimizer();
  const intermediateCode = { instructions: [] };
  const result = optimizer.optimize(intermediateCode);
  console.log('   ✅ OK');
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Fase 6: Python Generator
console.log('6. Python Generator:');
try {
  const PythonGenerator = require('./generator.js');
  const generator = new PythonGenerator();
  const intermediateCode = { instructions: [] };
  const result = generator.generateCode(intermediateCode);
  console.log('   ✅ OK');
} catch (error) {
  console.log('   ❌ Error:', error.message);
} 