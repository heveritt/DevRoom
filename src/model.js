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

    exportNode(id) {
        return serializer.serialize(this.nodes.get(id), false);
    }

    compileView(nodeId, contexts) {
        return serializer.serialize(this.nodes.get(nodeId).code);
    }

    processInput(nodeId, path, value, newLine) {
        const node = this.nodes.get(nodeId);
        node.getField(path).value = new Token({value}, path);
        console.log('Path: ' + path + ' value: ' + value + (newLine ? ' +' : ' -'));
    }

    generateHashId(value) {
        var char, hash = 0;
        for (let i = 0; i < value.length; i++) {
            char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    translate(language, version) {
        
    }
 
}

class Sememe {
    constructor(props) {
        this.className = 'Sememe';
        this.id = props.id;
        this.symbol = props.symbol;
        this.realm = props.realm;
    }
}

class CodeNode {
    constructor(className) {
        this.path = '';
        this.className = className;
    }

    addPath(key) {
        this.path = (this.path === '') ? key : key + '.' + this.path;
        Object.values(this)
        .filter( value => (typeof value === 'object' && value.addPath) )
        .forEach( value => value.addPath(key));
    }
}

class Node extends CodeNode {
    constructor(props) {
        super('Node');
        this.id = props.id;
        this.code = props.code;
    }

    getField(path) {
        let dirs = path.split('.');
        dirs.splice(-1);
        return dirs.reduce( (node, prop) => node[prop], this.code);
    }
}

class CodeLine extends CodeNode {
    constructor(props, key) {
        super('CodeLine');
        this.instruction = props.instruction;
        this.addPath(key);
    }
}

class CodeField extends CodeNode {
    constructor(props, key) {
        super('CodeField');
        this.domain = props.domain;
        this.value = props.value;
        this.addPath(key);
    }
}

class Expression extends CodeNode {
    constructor(props, key) {
        super('Expression');
        this.left = props.left;
        this.operator = props.operator;
        this.right = props.right;
        this.addPath(key);
    }
}

class Token extends CodeNode {
    constructor(props, key) {
        super('Token');
        this.value = props.value;
        this.addPath(key);
    }
}

class Input extends CodeNode {
    constructor(props, key) {
        super('Input');
        this.value = props.value;
        this.addPath(key);
    }
}

const classMap = {Sememe, Node, CodeLine, CodeField, Expression, Token, Input};

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
