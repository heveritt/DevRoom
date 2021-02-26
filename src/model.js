import Serializer from './serializer';
import Database from './db';

const db = new Database();

class Model {

    static open() {
        return db.loadModel().then(json => Model.import(json))
    }

    static import(json) {
        const sememes = deserialize(json.sememes);
        const nodes = deserialize(json.nodes);
        return new Model(sememes, nodes);
    }
    
    constructor(sememes, nodes) {
        this.sememes = new Map(sememes.map(sememe => [sememe.id, sememe]));
        this.nodes = new Map(nodes.map(node => [node.id, node.withModel(this)]));
        console.log(this);
    }

    node(id) {
        return this.nodes.get(id);
    }

    compileView(nodeId, contexts) {
        return serialize(this.node(nodeId).code);
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

    getChild(child) {
        if (child.includes('#')) {
            let [children, ix] = child.split('#');
            return this[children][ix];
        } else {
            return this[child];
        }
    }
}

class Nodule extends Code {
    constructor(props) {
        super('Nodule');
        this.id = props.id;
        this.code = props.code;
    }

    withModel(model) {
        // Don't want this outward pointing property to be serialised, otherwise we get circular dependencies
        Object.defineProperty(this, 'model', {value: model, enumerable: false});
        return this;
    }

    input(path, info) {
        let {value, fieldComplete, lineComplete} = info;
        console.log('Path: ' + path + ' value: ' + value + (fieldComplete ? ' +' : ' -') + (lineComplete ? ' +' : ' -'));

        this.getElement(path).input(value, fieldComplete);

        if (lineComplete) this.addLineBelow(path);
    }

    delete(path) {
        this.getElement(path).deleteContents();
    }

    getElement(path) {
        return path.split('.').reduce( (node, child) => node.getChild(child), this.code);
    }

    addLineBelow(path) {
        let cut = path.lastIndexOf('.lines#');
        let block = this.getElement(path.slice(0, cut))
        let ix = +path.slice(cut + 7).split('.')[0];
        block.addLineBelow(ix);
    }

    save() {
        console.log('Saving node ' + this.id + ' to database.');
        db.updateNode(this.id, serialize(this, false) );
    }
}

class Procedure extends Code {
    constructor(props) {
        super('Procedure');
        this.operation = props.operation;
        this.inputs = props.inputs;
        this.output = props.output;
        this.implementation = props.implementation || new Field({domain: props.output.domain});
    }
}

class Block extends Code {
    constructor(props) {
        super('Block');
        this.lines = props.lines || [new Line({})];
    }

    deleteContents() {
        this.lines = [new Line({})];
    }

    addLineBelow(ix) {
        this.lines.splice(ix + 1, 0, new Line({}));
    }
}

class Line extends Code {

    static inputs = {
        ':=': {className: 'Expression', operator: ':=', left: '.', right: '.'},
        '?' : {className: 'Selection', condition: '|', if: true},
        '?|': {className: 'Selection', condition: '|', if: true, else: true}
    };

    constructor(props) {
        super('Line');
        this.instruction = props.instruction || '';
    }

    input(value) {
        if (Line.inputs[value]) {
            let props = Line.inputs[value];
            const classConstructor = classMap[props.className];
            this.instruction = new classConstructor(props);
        }
    }

    deleteContents() {
        this.instruction = '';
    }
}

class Field extends Code {

    static expressions = {
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
        '||': {left: '|', right: '|', return: '|'}
    };

    constructor(props) {
        super('Field');
        this.domain = props.domain;
        this.value = props.value || '';
    }

    input(value, complete) {
        if (Field.expressions[value]) {
            let props = Object.assign({operator: value}, Field.expressions[value]);
            if ( Array.isArray(this.value) ) {
                props.left = new Field({domain: props.left, value: this.value[0]});
            }
            this.value = new Expression(props);
        } else {
            const token = (isNaN(value) && !value.startsWith('|')) ? new Token({value}) : new Literal({value});
            if (Array.isArray(this.value) ) {
                this.value.splice(-1, 1, token);
                if (! complete) this.value.push('');
            } else {
                this.value = complete ? token : [token, ''];
            }
        }
    }

    deleteContents() {
        this.value = '';
    }
}

class Declaration extends Code {
    constructor(props) {
        super('Declaration');
        this.role = props.role;
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

class Selection extends Code {
    constructor(props) {
        super('Selection');
        this.condition = typeof props.condition === 'object' ? props.condition : new Field({domain: props.condition});
        this.if = typeof props.if === 'object' ? props.if : new Block({});
        if (props.else) this.else = typeof props.else === 'object' ? props.else : new Block({});
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
        this.domain = props.value.startsWith('|') ? '|' : '#';
    }
}

const classMap = {Sememe, Nodule, Procedure, Block, Line, Field, Declaration, Expression, Token, Literal, Selection};
const { serialize, deserialize } = new Serializer(classMap);

export default Model;
