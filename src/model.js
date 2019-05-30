//import Serializer from './serializer';

class Model {

  constructor(props) {
    this.sememes = props.sememes;
    this.nodes = props.nodes;
  }

  static import(json) {
    return new Model(json);
  }
  
  static export(model) {
    return 'json-stream';
  }

  compileView(node, contexts) {
    return [
      {
        className: 'codeline', instruction: {
          className: 'expression', left: 'x', operator: '=', right: '1'
        }
      },
      {
        className: 'codeline', instruction: {
          className: 'expression', left: 'y', operator: '=', right: {
            className: 'expression', left: {
              className: 'expression', left: 'x', operator: '*', right: '3'
            }, operator: '+', right: '5'
          }
        }
      },
      {
        className: 'codeline', instruction: '_'
      }
    ];
  }

  translate(language, version) {
    
  }
 
}
/*
class Expression {
  constructor(props) {
    this.left = props.left;
    this.operator = props.operator;
    this.right = props.right;
  }
}

class Sememe {
  constructor(props) {
    this.morpheme = props.morpheme;
  }
}

class Morpheme {
  constructor(props) {
    this.token = props.token;
    this.symbolic = props.symbolic;
  }
}

class Nodule {

  constructor(props) {
    this.attributes = props.attributes;
    this.operations = props.operations;
  }

  getAttributes() {
    return this.attributes;
  }
 
  getOperations() {
    return this.operations;
  }
}

class Procedure {

  constructor(props) {
    this.instructions = props.instructions;
  }
}

class instruction {
  
  constructor(props) {
    this.declaration = props.declaration;
    this.operation = props.operation;
  }
}

class Operation {

  constructor(props) {
    this.left = props.left;
    this.operator = props.operator;
    this.right = props.right;
    this.qualifiers = props.qualifiers;
  }
}

*/
export default Model;
