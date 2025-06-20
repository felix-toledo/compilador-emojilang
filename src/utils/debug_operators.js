// Script de debug para operadores EmojiLang
const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const IntermediateCodeGenerator = require('./intermediate.js');
const PythonGenerator = require('./generator.js');

function debugOperators() {
    console.log('🔍 Debug de Operadores EmojiLang\n');
    
    // Test 1: Verificar mapeo de emojis en el lexer
    console.log('=== Test 1: Mapeo de Emojis ===');
    const lexer = new Lexer();
    console.log('EmojiMap del Lexer:');
    console.log(lexer.emojiMap);
    
    // Test 2: Verificar detección de emojis
    console.log('\n=== Test 2: Detección de Emojis ===');
    const testCode = '➕ ➖ ✖️ ➗';
    console.log(`Código de prueba: "${testCode}"`);
    
    const tokens = lexer.tokenize(testCode);
    console.log('Tokens generados:');
    tokens.forEach((token, index) => {
        if (token.type !== 'EOF') {
            console.log(`  ${index + 1}. ${token.type}: "${token.value}"`);
        }
    });
    
    // Test 3: Verificar operaciones individuales
    console.log('\n=== Test 3: Operaciones Individuales ===');
    
    // Test suma
    console.log('\n--- Test Suma ---');
    const sumCode = '📦 x = 5 ➕ 3';
    console.log(`Código: "${sumCode}"`);
    const sumTokens = lexer.tokenize(sumCode);
    console.log('Tokens:');
    sumTokens.forEach(token => {
        if (token.type !== 'EOF') {
            console.log(`  ${token.type}: "${token.value}"`);
        }
    });
    
    // Test multiplicación
    console.log('\n--- Test Multiplicación ---');
    const multCode = '📦 y = 4 ✖️ 2';
    console.log(`Código: "${multCode}"`);
    const multTokens = lexer.tokenize(multCode);
    console.log('Tokens:');
    multTokens.forEach(token => {
        if (token.type !== 'EOF') {
            console.log(`  ${token.type}: "${token.value}"`);
        }
    });
    
    // Test 4: Verificar parsing
    console.log('\n=== Test 4: Parsing ===');
    
    try {
        const parser = new Parser();
        const sumAST = parser.parse(sumTokens);
        console.log('AST para suma:');
        console.log(JSON.stringify(sumAST, null, 2));
        
        const multAST = parser.parse(multTokens);
        console.log('AST para multiplicación:');
        console.log(JSON.stringify(multAST, null, 2));
        
        // Test 5: Verificar código intermedio
        console.log('\n=== Test 5: Código Intermedio ===');
        
        const intermediateGen = new IntermediateCodeGenerator();
        
        const sumIntermediate = intermediateGen.generateIntermediate(sumAST);
        console.log('Código intermedio para suma:');
        console.log(intermediateGen.getIntermediateCode());
        
        const multIntermediate = intermediateGen.generateIntermediate(multAST);
        console.log('Código intermedio para multiplicación:');
        console.log(intermediateGen.getIntermediateCode());
        
        // Test 6: Verificar generación de Python
        console.log('\n=== Test 6: Generación Python ===');
        
        const generator = new PythonGenerator();
        
        const sumResult = generator.generateCode(sumIntermediate);
        console.log('Código Python para suma:');
        console.log(sumResult.code);
        
        const multResult = generator.generateCode(multIntermediate);
        console.log('Código Python para multiplicación:');
        console.log(multResult.code);
        
        // Test 7: Verificar problema específico
        console.log('\n=== Test 7: Problema Específico ===');
        const problemCode = '📦 resultado = 5 ➕ 3 ✖️ 2';
        console.log(`Código problemático: "${problemCode}"`);
        
        const problemTokens = lexer.tokenize(problemCode);
        console.log('Tokens del código problemático:');
        problemTokens.forEach(token => {
            if (token.type !== 'EOF') {
                console.log(`  ${token.type}: "${token.value}"`);
            }
        });
        
        const problemAST = parser.parse(problemTokens);
        console.log('AST del código problemático:');
        console.log(JSON.stringify(problemAST, null, 2));
        
        const problemIntermediate = intermediateGen.generateIntermediate(problemAST);
        console.log('Código intermedio del problema:');
        console.log(intermediateGen.getIntermediateCode());
        
        const problemPython = generator.generateCode(problemIntermediate);
        console.log('Código Python del problema:');
        console.log(problemPython.code);
        
    } catch (error) {
        console.log('Error en análisis:', error.message);
    }
}

// Ejecutar el debug
debugOperators(); 