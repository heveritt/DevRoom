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

    processInput(nodeId, path, value, fieldComplete, lineComplete) {
        return this.node(nodeId).processInput(this, path, value, fieldComplete, lineComplete);
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

class Code {
    constructor(className) {
        this.className = className;
    }

}

class Nodule extends Code {
    constructor(props) {
        super('Nodule');
        this.id = props.id;
        this.code = props.code;
    }

    processInput(model, path, value, fieldComplete, lineComplete) {
        console.log('Path: ' + path + ' value: ' + value + (fieldComplete ? ' +' : ' -') + (lineComplete ? ' +' : ' -'));

        let field = this.getField(path);

        if (model.expressions[value]) {
            let props = Object.assign({operator: value}, model.expressions[value]);
            let newFocus = path + '.value.left';
            if ( Array.isArray(field.value) ) {
                props.left = new Field({domain: props.left, value: field.value[0]});
                newFocus = path + '.value.right';
            }
            field.value = new Expression(props);
            return newFocus;
        } else {

            const token = (isNaN(value)) ? new Token({value}) : new Literal({value});
            field.addToken(token, fieldComplete);

            if (lineComplete) {
                const ix = this.addLineBelow(path);
                return 'instructions.' + ix + '.instruction';
            } else {
                return fieldComplete ? null : path;
            }
        }
    }

    getField(path) {
        return path.split('.').reduce( (node, prop) => node[prop], this.code);
    }

    getLineIx(path) {
        return 1 * path.split('.')[1];
    }

    addLineBelow(path) {
        let ix = this.getLineIx(path) + 1;
        let line = new Line({});
        this.code.instructions.splice(ix, 0, line);
        return ix;
    }
}

class Block extends Code {
    constructor(props) {
        super('Block');
        this.arguments = props.arguments;
        this.instructions = props.instructions;
    }
}

class Line extends Code {
    constructor(props) {
        super('Line');
        this.instruction = props.instruction ? props.instruction : new Field({domain: ''});
    }
}

class Field extends Code {
    constructor(props) {
        super('Field');
        this.domain = props.domain;
        this.value = props.value || '';
    }

    addToken(token, complete) {
        if (Array.isArray(this.value) ) {
            this.value.splice(-1, 1, token);
            if (! complete) this.value.push('');
        } else {
            this.value = complete ? token : [token, ''];
        }
    }
}

class Declaration extends Code {
    constructor(props) {
        super('Declaration');
        this.identifier = props.identifier;
        this.domain = props.domain;
    }
}

class Expression extends Code {
    constructor(props) {
        super('Expression');
        this.left = typeof props.left === 'object' ? props.left : new Field({domain: props.left});
        this.operator = typeof props.operator === 'object' ? props.operator : new Token({value: props.operator});
        this.right = typeof props.right === 'object' ? props.right : new Field({domain: props.right});
    }
}

class Token extends Code {
    constructor(props) {
        super('Token');
        this.value = props.value;
    }
}

class Literal extends Code {
    constructor(props) {
        super('Literal');
        this.value = props.value;
    }
}

const classMap = {Sememe, Nodule, Block, Line, Field, Declaration, Expression, Token, Literal};
const { serialize, deserialize } = new Serializer(classMap);

export default Model;
