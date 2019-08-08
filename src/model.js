import Serializer from './serializer';

class Model {

    constructor(sememes, nodes) {
        this.sememes = new Map(sememes.map(sememe => [sememe.id, sememe]));
        this.nodes = new Map(nodes.map(node => [node.id, node]));
        console.log(this);
    }

    static import(json) {
        const sememes = serializerIn.deserialize(json.sememes);
        const nodes = serializerIn.deserialize(json.nodes);
        return new Model(sememes, nodes);
    }
    
    static export(model) {
        return 'json-stream';
    }

    getNode(id) {
        return serializer.serialize(this.nodes.get(id));
    }

    compileView(nodeId, contexts) {
        return serializer.serialize(this.nodes.get(nodeId).code);
    }

    processInput(reference, value, newLine) {
        console.log('Ref: ' + reference + ' value: ' + value + (newLine ? ' +' : ' -'));
    }

    translate(language, version) {
        
    }
 
}

class CodeLine {
    constructor(props) {
        this.instruction = props.instruction;
    }
}

class CodeField {
    constructor(props) {
        this.domain = props.domain;
        this.value = props.value;
    }
}

class Expression {
    constructor(props) {
        this.left = props.left;
        this.operator = props.operator;
        this.right = props.right;
    }
}

class Token {
    constructor(props) {
        this.value = props.value;
    }
}

class Input {
    constructor(props) {
        this.value = props.value;
    }
}

const classMap = {CodeLine, CodeField, Expression, Token, Input};

const serializer = new Serializer(classMap);

//const classMapV1 = Object.assign({}, classMap, {Expression: CodeField, Token: CodeField, Input: CodeField});

const serializerIn = serializer;

/*
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
