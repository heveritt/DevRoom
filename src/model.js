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
                className: 'code-line',
                instruction: {
                    className: 'expression',
                    left: {
                        className: 'token',
                        value: 'x'
                    },
                    operator: {
                        className: 'token',
                        value: '='
                    },
                    right: {
                        className: 'token',
                        value: '1'
                    }
                }
            },
            {
                className: 'code-line',
                instruction: {
                    className: 'expression',
                    left: {
                        className: 'token',
                        value: 'y'
                    },
                    operator: {
                        className: 'token',
                        value: '='
                    },
                    right: {
                        className: 'expression',
                        left: {
                            className: 'expression',
                            left: {
                                className: 'token',
                                value: 'x',
                            },
                            operator: {
                                className: 'token',
                                value: '*'
                            },
                            right: {
                                className: 'input',
                                reference: 0,
                                value: ''
                            }
                        },
                        operator: {
                            className: 'token',
                            value: '+'
                        },
                        right: {
                            className: 'token',
                            value: '5'
                        }
                    }
                }
            },
            {
                className: 'code-line',
                instruction: {
                    className: 'input',
                    reference: 1,
                    value: ''
                }
            }
        ];
    }

    processInput(reference, value, newLine) {
        console.log('Ref: ' + reference + ' value: ' + value + (newLine ? ' +' : ' -'));
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
