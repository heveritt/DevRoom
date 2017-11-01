import Serializer from './serializer';

class Model {

  constructor(json) {
    this.state = {
      focus: 'grid',
      contexts: ['Franca', 'DevRoom', 'SudokuMate'],
    };
  }

  static import(json) {
    return new Model(json);
  }
  
  static export(model) {
    return 'json-stram';
  }

  getView(frame) {
    return [['x', '=', '1'], ['y', '=', 'x', '+', '3', '*', '5', '_']];
  }
 
  getPublicProperties(context, klass) {
    return ['length', 'width'];
  }
 
  getProperties(context, klass) {
    return ['length', 'width'];
  }
 
  getPublicOperations(context, klass) {
    return ['length', 'width'];
  }
 
  getOperations(context, klass) {
    return ['length', 'width'];
  }
}

export default Model;

class Nodule {

  constructor(props) {
    this.attributes = props.attributes;
    this.operations = props.operations;
  }
}

class Operation {

  constructor(props) {
    this.context = props.context;
    this.operation = props.operation;
    this.args = props.args;
  }
}
