// Lexer para EmojiLang - Convierte código emoji en tokens
class Lexer {
  constructor() {
    this.emojiMap = {
      '🔧': 'FUNC',
      '🔙': 'RETURN', 
      '❓': 'IF',
      '🔄': 'WHILE',
      '🧱': 'CONST',
      '📦': 'VAR',
      '➕': 'PLUS',
      '➖': 'MINUS',
      '🟢': 'MULTIPLY',
      '➗': 'DIVIDE',
      '🖨️': 'PRINT',
      '🎤': 'INPUT',
      '✅': 'TRUE',
      '❌': 'FALSE',
      '=': 'ASSIGN',
      '(': 'LPAREN',
      ')': 'RPAREN',
      '{': 'LBRACE',
      '}': 'RBRACE',
      ';': 'SEMICOLON',
      ',': 'COMMA'
    };
  }

  tokenize(code) {
    const tokens = [];
    const lines = code.split('\n');
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      const words = this.splitLine(line);
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i].trim();
        if (word === '') continue;
        
        const token = this.createToken(word, lineNum + 1, i + 1);
        if (token && token.type !== 'UNKNOWN') {
          tokens.push(token);
        }
      }
    }
    
    // Agregar token EOF al final
    tokens.push({
      type: 'EOF',
      value: '',
      line: lines.length,
      column: 1
    });
    
    return tokens;
  }

  splitLine(line) {
    // Manejar strings primero
    const parts = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (!inString && (char === '"' || char === "'")) {
        if (current.trim()) {
          parts.push(current);
          current = '';
        }
        inString = true;
        stringChar = char;
        current = char;
        i++;
      } else if (inString && char === stringChar) {
        current += char;
        parts.push(current);
        current = '';
        inString = false;
        i++;
      } else if (inString) {
        current += char;
        i++;
      } else {
        // Verificar si el siguiente carácter es un emoji
        const emoji = this.getEmojiAt(line, i);
        if (emoji) {
          if (current.trim()) {
            parts.push(current);
          }
          parts.push(emoji);
          current = '';
          i += emoji.length;
        } else if (this.isSymbol(char)) {
          // Verificar si es un operador de comparación de dos caracteres
          if (i + 1 < line.length) {
            const nextChar = line[i + 1];
            const twoCharOp = char + nextChar;
            if (['==', '!=', '<=', '>='].includes(twoCharOp)) {
              if (current.trim()) {
                parts.push(current);
              }
              parts.push(twoCharOp);
              current = '';
              i += 2;
              continue;
            }
          }
          
          // Es un símbolo de un solo carácter
          if (current.trim()) {
            parts.push(current);
          }
          parts.push(char);
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
    }
    
    if (current.trim()) {
      parts.push(current);
    }
    
    return parts.filter(part => part.trim() !== '');
  }

  getEmojiAt(line, index) {
    const emojis = ['🔧', '🔙', '❓', '🔄', '🧱', '📦', '➕', '➖', '🟢', '➗', '🖨️', '🎤', '✅', '❌'];
    
    for (const emoji of emojis) {
      if (line.substring(index, index + emoji.length) === emoji) {
        return emoji;
      }
    }
    
    return null;
  }

  isSymbol(char) {
    const symbols = ['=', '(', ')', '{', '}', ';', ',', '>', '<', '!'];
    return symbols.includes(char);
  }

  isEmojiOrSymbol(char) {
    const emojis = ['🔧', '🔙', '❓', '🔄', '🧱', '📦', '➕', '➖', '🟢', '➗', '🖨️', '🎤', '✅', '❌'];
    const symbols = ['=', '(', ')', '{', '}', ';', ',', '>', '<', '!'];
    
    return emojis.includes(char) || symbols.includes(char);
  }

  createToken(value, line, column) {
    // Emojis del lenguaje
    if (this.emojiMap[value]) {
      return {
        type: this.emojiMap[value],
        value: value,
        line: line,
        column: column
      };
    }
    
    // Números
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
      return {
        type: 'NUMBER',
        value: parseFloat(value),
        line: line,
        column: column
      };
    }
    
    // Identificadores (variables, nombres de funciones)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      return {
        type: 'IDENTIFIER',
        value: value,
        line: line,
        column: column
      };
    }
    
    // Strings (entre comillas)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return {
        type: 'STRING',
        value: value.slice(1, -1),
        line: line,
        column: column
      };
    }
    
    // Operadores de comparación
    if (['==', '!=', '<=', '>=', '<', '>'].includes(value)) {
      return {
        type: 'COMPARISON',
        value: value,
        line: line,
        column: column
      };
    }
    
    // Ignorar espacios en blanco y otros caracteres no reconocidos
    if (value.trim() === '') {
      return null;
    }
    
    // Token desconocido (pero no lo agregamos a la lista)
    return {
      type: 'UNKNOWN',
      value: value,
      line: line,
      column: column
    };
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Lexer;
} 