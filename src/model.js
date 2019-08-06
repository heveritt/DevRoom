import Serializer from './serializer';

class Model {

    constructor(sememes, nodes) {
        this.sememes = new Map(sememes.map(sememe => [sememe.id, sememe]));
        this.nodes = new Map(nodes.map(node => [node.id, node]));
        console.log(this);
    }

    static import(json) {
        console.log(json);
        const sememes = deserialize(json.sememes);
        const nodes = deserialize(json.nodes);
        return new Model(sememes, nodes);
    }
    
    static export(model) {
        return 'json-stream';
    }

    getNode(id) {
        return this.nodes.get(id);
    }

    compileView(nodeId, contexts) {
        console.log(serialize(this.getNode(nodeId).code))
        return serialize(this.getNode(nodeId).code);
    }

    processInput(reference, value, newLine) {
        console.log('Ref: ' + reference + ' value: ' + value + (newLine ? ' +' : ' -'));
    }

    translate(language, version) {
        
    }
 
}

class CodeLine {
    constructor(props) {
        this.className = 'code-line';
        this.instruction = props.instruction;
    }
}

class Expression {
    constructor(props) {
        this.className = 'expression';
        this.left = props.left;
        this.operator = props.operator;
        this.right = props.right;
    }
}

class Token {
    constructor(props) {
        this.className = 'token';
        this.value = props.value;
    }
}

class Input {
    constructor(props) {
        this.className = 'input';
        this.value = props.value;
    }
}

const classMap = {
    'code-line': CodeLine,
    'expression': Expression,
    'token': Token,
    'input': Input
};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString);
}

function serialize(code) {
    return serializer.serialize(code);
}

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
