import Serializer from './serializer';

class Model {

    static import(json) {
        const sememes = deserialize(json.sememes);
        const nodes = deserialize(json.nodes);
        return new Model(sememes, nodes);
    }
    
    static export(model) {
        return 'json-stream';
    }

    constructor(sememes, nodes) {
        this.sememes = new Map(sememes.map(sememe => [sememe.id, sememe]));
        this.nodes = new Map(nodes.map(node => [node.id, node]));
        this.expressions = {
            ':=': {left: '.', right: '.'},
            '+' : {left: '#', right: '#', return: '#'},
            '-' : {left: '#', right: '#', return: '#'},
            '*' : {left: '#', right: '#', return: '#'},
            '/' : {left: '#', right: '#', return: '#'},
            '%' : {left: '#', right: '#', return: '#'},
            '==': {left: '.', right: '.', return: '|'},
            '!=': {left: '.', right: '.', return: '|'},
            '<' : {left: '#', right: '#', return: '|'},
            '>' : {left: '#', right: '#', return: '|'},
            '<=': {left: '#', right: '#', return: '|'},
            '>=': {left: '#', right: '#', return: '|'},
            '&&': {left: '|', right: '|', return: '|'},
            '||': {left: '|', right: '|', return: '|'},
        };
        console.log(this);
    }

    node(id) {
        return this.nodes.get(id);
    }

    exportNode(id) {
        return serialize(this.node(id), false);
    }

    compileView(nodeId, contexts) {
        return serialize(this.node(nodeId).code);
    }

    processInput(nodeId, path, value, newLine) {
        return this.node(nodeId).processInput(this, path, value, newLine);
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

    processInput(model, path, value, newLine) {
        console.log('Path: ' + path + ' value: ' + value + (newLine ? ' +' : ' -'));
        let field = this.getParentField(path);
        if (model.expressions[value]) {
            let props = model.expressions[value];
            props.operator = value;
            let newFocus = path + '.left.value';
            if ( Array.isArray(field.value) ) {
                path = path.slice(0, -2); // Hack off array number!
                let leftValue = field.value[0];
                leftValue.path = 'value';
                props.left = new CodeField({domain: props.left, value: leftValue}, 'left');;
                newFocus = path + '.right.value';
            }
            field.value = new Expression(props, path);
            return newFocus;
        } else {

            const token = (isNaN(value)) ? new Token({value}) : new Literal({value});

            if (newLine) {
                token.addPath(path);
                field.value = token;
                const ix = this.addLineBelow(path);
                return '' + ix + '.instruction.value';
            } else {
                token.addPath(path + '.0');
                field.value = [token, new Input({}, path + '.1')]
                return path + '.1';
            }
        }
    }

    getParentField(path) {
        let dirs = path.split('.');
        do { } while (dirs.pop() !== 'value')
        return dirs.reduce( (node, prop) => node[prop], this.code.instructions);
    }

    getLineIx(path) {
        return 1 * path.split('.')[0];
    }

    addLineBelow(path) {
        let ix = this.getLineIx(path) + 1;
        let line = new CodeLine({}, '' + ix);
        this.code.instructions.splice(ix, 0, line);
        return ix;
    }
}

class CodeBlock extends CodeNode {
    constructor(props, key) {
        super('CodeBlock');
        this.arguments = props.arguments;
        this.instructions = props.instructions;
        this.addPath(key);
    }
}

class CodeLine extends CodeNode {
    constructor(props, key) {
        super('CodeLine');
        this.instruction = props.instruction ? props.instruction : new CodeField({domain: ''}, 'instruction');
        this.addPath(key);
    }
}

class CodeField extends CodeNode {
    constructor(props, key) {
        super('CodeField');
        this.domain = props.domain;
        this.value = props.value ? props.value : new Input({}, 'value');
        this.addPath(key);
    }
}

class Declaration extends CodeNode {
    constructor(props, key) {
        super('Declaration');
        this.identifier = props.identifier;
        this.domain = props.domain;
        this.addPath(key);
    }
}

class Expression extends CodeNode {
    constructor(props, key) {
        super('Expression');
        this.left = typeof props.left === 'object' ? props.left : new CodeField({domain: props.left}, 'left');
        this.operator = typeof props.operator === 'object' ? props.operator : new Token({value: props.operator}, 'operator');
        this.right = typeof props.right === 'object' ? props.right : new CodeField({domain: props.right}, 'right');
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

class Literal extends CodeNode {
    constructor(props, key) {
        super('Literal');
        this.value = props.value;
        this.addPath(key);
    }
}

class Input extends CodeNode {
    constructor(props, key) {
        super('Input');
        this.value = props.value ? props.value : '';
        this.addPath(key);
    }
}

const classMap = {Sememe, Node, CodeBlock, CodeLine, CodeField, Declaration, Expression, Token, Input, Literal};
const { serialize, deserialize } = new Serializer(classMap);

export default Model;
