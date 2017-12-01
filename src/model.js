//import Serializer from './serializer';

class Model {

  static import(json) {
    return new Model(json);
  }
  
  static export(model) {
    return 'json-stram';
  }

  compileView(node, contexts) {
    return [
      {
        left: 'x', operator: '=', right: '1'
      },
      {
        left: 'y', operator: '=', right: {
          left: {
            left: 'x', operator: '*', right: '3'
          },
          operator: '+', right: '5'
        }
      }
    ];
  }
 
}

export default Model;
/*
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

class Operation {

  constructor(props) {
    this.operator = props.operator;
    this.operand = props.operand;
    this.qualifiers = props.qualifiers;
  }
}

class Procedure {

  constructor(props) {
    this.instructions = props.instructions;
  }
}
*/
