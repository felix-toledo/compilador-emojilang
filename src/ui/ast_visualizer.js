// Visualizador de árbol AST usando D3.js
class ASTVisualizer {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.nodeRadius = 30;
    this.levelHeight = 100;
  }

  // Convierte el AST a formato de árbol para D3
  convertASTToTree(astNode, parentId = null, nodeId = 0) {
    if (!astNode) return null;

    const node = {
      id: nodeId,
      name: this.getNodeLabel(astNode),
      type: astNode.type,
      value: astNode.value,
      children: [],
      parent: parentId
    };

    // Procesar hijos según el tipo de nodo
    if (astNode.body && Array.isArray(astNode.body)) {
      // Para nodos Program
      for (let i = 0; i < astNode.body.length; i++) {
        const child = this.convertASTToTree(astNode.body[i], nodeId, nodeId + 1 + i);
        if (child) {
          node.children.push(child);
          nodeId = child.id;
        }
      }
    } else if (astNode.statements && Array.isArray(astNode.statements)) {
      // Para nodos Block
      for (let i = 0; i < astNode.statements.length; i++) {
        const child = this.convertASTToTree(astNode.statements[i], nodeId, nodeId + 1 + i);
        if (child) {
          node.children.push(child);
          nodeId = child.id;
        }
      }
    } else if (astNode.left && astNode.right) {
      // Para expresiones binarias
      const leftChild = this.convertASTToTree(astNode.left, nodeId, nodeId + 1);
      const rightChild = this.convertASTToTree(astNode.right, nodeId, nodeId + 2);
      if (leftChild) node.children.push(leftChild);
      if (rightChild) node.children.push(rightChild);
    } else if (astNode.condition && astNode.thenBranch) {
      // Para if statements
      const conditionChild = this.convertASTToTree(astNode.condition, nodeId, nodeId + 1);
      const thenChild = this.convertASTToTree(astNode.thenBranch, nodeId, nodeId + 2);
      if (conditionChild) node.children.push(conditionChild);
      if (thenChild) node.children.push(thenChild);
      
      if (astNode.elseBranch) {
        const elseChild = this.convertASTToTree(astNode.elseBranch, nodeId, nodeId + 3);
        if (elseChild) node.children.push(elseChild);
      }
    } else if (astNode.condition && astNode.body) {
      // Para while loops
      const conditionChild = this.convertASTToTree(astNode.condition, nodeId, nodeId + 1);
      const bodyChild = this.convertASTToTree(astNode.body, nodeId, nodeId + 2);
      if (conditionChild) node.children.push(conditionChild);
      if (bodyChild) node.children.push(bodyChild);
    } else if (astNode.expression) {
      // Para expresiones agrupadas
      const exprChild = this.convertASTToTree(astNode.expression, nodeId, nodeId + 1);
      if (exprChild) node.children.push(exprChild);
    } else if (astNode.value && astNode.type === 'FunctionDeclaration') {
      // Para declaraciones de función
      const bodyChild = this.convertASTToTree(astNode.body, nodeId, nodeId + 1);
      if (bodyChild) node.children.push(bodyChild);
    } else if (astNode.arguments && Array.isArray(astNode.arguments)) {
      // Para llamadas de función
      for (let i = 0; i < astNode.arguments.length; i++) {
        const child = this.convertASTToTree(astNode.arguments[i], nodeId, nodeId + 1 + i);
        if (child) {
          node.children.push(child);
          nodeId = child.id;
        }
      }
    }

    return node;
  }

  // Obtiene la etiqueta para mostrar en el nodo
  getNodeLabel(astNode) {
    switch (astNode.type) {
      case 'Program':
        return 'Programa';
      case 'VariableDeclaration':
        return `Var: ${astNode.name}`;
      case 'FunctionDeclaration':
        return `Fun: ${astNode.name}`;
      case 'IfStatement':
        return 'If';
      case 'WhileStatement':
        return 'While';
      case 'Block':
        return 'Bloque';
      case 'PrintStatement':
        return 'Imprimir';
      case 'InputStatement':
        return 'Entrada';
      case 'ReturnStatement':
        return 'Retorno';
      case 'BinaryExpression':
        return astNode.operator;
      case 'AssignmentExpression':
        return `Asignar: ${astNode.name}`;
      case 'VariableExpression':
        return astNode.name;
      case 'FunctionCall':
        return `Llamar: ${astNode.name}`;
      case 'Literal':
        if (typeof astNode.value === 'string') {
          return `"${astNode.value}"`;
        }
        return String(astNode.value);
      case 'GroupingExpression':
        return '()';
      default:
        return astNode.type || 'Nodo';
    }
  }

  // Crea la visualización del árbol
  createVisualization(containerId, ast) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Contenedor no encontrado:', containerId);
      return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    // Convertir AST a formato de árbol
    const treeData = this.convertASTToTree(ast);
    if (!treeData) {
      container.innerHTML = '<p>No hay datos de AST para visualizar</p>';
      return;
    }

    // Configurar D3
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const width = this.width - margin.right - margin.left;
    const height = this.height - margin.top - margin.bottom;

    // Crear layout de árbol
    const tree = d3.tree().size([height, width]);

    // Crear jerarquía
    const root = d3.hierarchy(treeData);
    tree(root);

    // Crear SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Agregar enlaces
    const link = svg.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

    // Agregar nodos
    const node = svg.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Agregar círculos de nodos
    node.append('circle')
      .attr('r', this.nodeRadius)
      .style('fill', d => this.getNodeColor(d.data.type))
      .style('stroke', '#333')
      .style('stroke-width', 2);

    // Agregar texto de nodos
    node.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text(d => d.data.name);

    // Agregar tooltips
    node.append('title')
      .text(d => `Tipo: ${d.data.type}\nValor: ${d.data.value || 'N/A'}`);

    // Agregar estilos CSS
    this.addStyles();
  }

  // Obtiene el color para cada tipo de nodo
  getNodeColor(nodeType) {
    const colors = {
      'Program': '#667eea',
      'VariableDeclaration': '#28a745',
      'FunctionDeclaration': '#17a2b8',
      'IfStatement': '#ffc107',
      'WhileStatement': '#fd7e14',
      'Block': '#6f42c1',
      'PrintStatement': '#e83e8c',
      'InputStatement': '#20c997',
      'ReturnStatement': '#dc3545',
      'BinaryExpression': '#6c757d',
      'AssignmentExpression': '#fd7e14',
      'VariableExpression': '#28a745',
      'FunctionCall': '#17a2b8',
      'Literal': '#20c997',
      'GroupingExpression': '#6f42c1'
    };
    return colors[nodeType] || '#6c757d';
  }

  // Agrega estilos CSS para la visualización
  addStyles() {
    if (!document.getElementById('ast-visualizer-styles')) {
      const style = document.createElement('style');
      style.id = 'ast-visualizer-styles';
      style.textContent = `
        .ast-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: auto;
        }
        
        .ast-container svg {
          display: block;
          margin: 0 auto;
        }
        
        .ast-container .link {
          fill: none;
          stroke: #ccc;
          stroke-width: 2px;
        }
        
        .ast-container .node circle {
          transition: all 0.3s ease;
        }
        
        .ast-container .node:hover circle {
          stroke-width: 4px;
          stroke: #333;
        }
        
        .ast-container .node text {
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Actualiza la visualización existente
  updateVisualization(containerId, ast) {
    this.createVisualization(containerId, ast);
  }
} 