import Serializer from './serializer';
import Database from './db';
import client from './client'

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
        return serialize(this.node(nodeId).code, true);
    }

    translate(language, version) {
        
    }
 
}

class Code {

    constructor(props) {
        Object.assign(this, props);
    }

    init(props) {
        console.log('No initialisation provided for code elements of class: ' + this.className);
    }

    getChild(child) {
        if (child.includes('#')) {
            let [children, ix] = child.split('#');
            return this[children][ix];
        } else {
            return this[child];
        }
    }

    isOptional() {
        return false;
    }

    deleteContents() {
        return '';
    }

    deleteChild(child) {
        if (this[child] && this[child].isOptional()) {
            let deleted = this[child];
            delete this[child];
            return deleted;
        } else {
            return '';
        }
    }
}

class Sememe extends Code{
    init(props) {
        /* TODO
        this.id = props.id;
        this.symbol = props.symbol;
        this.realm = props.realm; */
    }
}

class Nodule extends Code {
    init(props) {
        /* TODO
        this.id = props.id;
        this.code = props.code; */
    }

    withModel(model) {
        // Don't want this outward pointing property to be serialised, otherwise we get circular dependencies
        Object.defineProperty(this, 'model', {value: model, enumerable: false});
        return this;
    }

    input(path, info) {
        let {value, fieldComplete, lineComplete} = info;
        //console.log('Path: ' + path + ' value: ' + value + (fieldComplete ? ' +' : ' -') + (lineComplete ? ' +' : ' -'));

        this.getElement(path).input(value, fieldComplete);

        if (lineComplete) this.addLineBelow(path);
    }

    delete(path) {
        let contents = this.getElement(path).deleteContents();
        if (! contents) {
            let {parent, child} = this.getParentChild(path);
            return parent.deleteChild(child);
        } else {
            return contents;
        }
    }

    getElement(path) {
        return path.split('.').reduce( (node, child) => node.getChild(child), this.code);
    }

    getParentChild(path) {
        let cut = path.lastIndexOf('.');
        let parent = this.getElement(path.slice(0, cut));
        let child = path.slice(cut + 1);
        return {parent, child};
    }

    addLineBelow(path) {
        let cut = path.lastIndexOf('.lines#');
        let block = this.getElement(path.slice(0, cut));
        let ix = +path.slice(cut + 7).split('.')[0];
        block.addLineBelow(ix);
    }

    save() {
        db.updateNode(this.id, serialize(this));
        client.save(this);
    }

    generate() {
        client.generate(this);
    }
}

class Procedure extends Code {
    init(props) {
        /* TODO
        this.operation = props.operation;
        this.inputs = props.inputs;
        this.output = props.output;
        this.implementation = create('Field', {domain: props.output.domain}); */
    }
}

class Block extends Code {
    init(props) {
        this.lines = [create('Line')];
    }

    deleteContents() {
        if (this.isEmpty()) {
            return '';
        } else {
            let contents = this.lines;
            this.lines = [create('Line')];
            return contents;
        }
    }

    deleteChild(child) {
        if (this.lines.length > 1) {
            let ix = child.split('#')[1];
            return this.lines.splice(ix, 1)[0];
        } else {
            return '';
        }
    }

    isEmpty() {
        return this.lines.length === 1 && this.lines[0].isEmpty();
    }

    addLineBelow(ix) {
        this.lines.splice(ix + 1, 0, create('Line'));
    }
}

class Line extends Code {

    static inputs = {
        '=' : {className: 'Assignment'},
        '<' : {className: 'Return'},
        '?' : {className: 'Selection', condition: '|', branchs: ['|1']},
        '?|': {className: 'Selection', condition: '|', branchs: ['|1', '|0']},
        '?$': {className: 'Iteration', optional: true},
        '$?': {className: 'Iteration', optional: false}
    };

    init(props) {
        this.instruction = '';
    }

    input(value, complete) {
        if (Line.inputs[value]) {
            let props = Object.assign({}, Line.inputs[value]);
            if ( Array.isArray(this.instruction) ) {
                props.left = create('Field', {domain: props.left, value: this.instruction[0]});
            }
            this.instruction = create(props.className, props);
        } else {
            const token = create('Token', {value});
            if (Array.isArray(this.instruction) ) {
                this.instruction.splice(-1, 1, token);
                if (! complete) this.instruction.push('');
            } else {
                this.instruction = complete ? token : [token, ''];
            }
        }
    }

    isEmpty() {
        return ! this.instruction;
    }

    deleteContents() {
        let contents = this.instruction;
        this.instruction = '';
        return contents;
    }
}

class Field extends Code {

    static inputs = {
        '+' : {left: '#', right: '#', output: '#'},
        '-' : {left: '#', right: '#', output: '#'},
        '*' : {left: '#', right: '#', output: '#'},
        '/' : {left: '#', right: '#', output: '#'},
        '%' : {left: '#', right: '#', output: '#'},
        '==': {left: '.', right: '.', output: '|'},
        '!=': {left: '.', right: '.', output: '|'},
        '<' : {left: '#', right: '#', output: '|'},
        '>' : {left: '#', right: '#', output: '|'},
        '<=': {left: '#', right: '#', output: '|'},
        '>=': {left: '#', right: '#', output: '|'},
        '&&': {left: '|', right: '|', output: '|'},
        '||': {left: '|', right: '|', output: '|'}
    };

    init(props) {
        this.domain = props.domain;
        this.value = props.value || '';
    }

    input(value, complete) {
        if (Field.inputs[value]) {
            let props = Object.assign({operator: value}, Field.inputs[value]);
            if ( Array.isArray(this.value) ) {
                props.left = create('Field', {domain: props.left, value: this.value[0]});
            }
            this.value = create('Expression', props);
        } else {
            const token = (isNaN(value) && !value.startsWith('|')) ? create('Token', {value}) : create('Literal', {value});
            if (Array.isArray(this.value) ) {
                this.value.splice(-1, 1, token);
                if (! complete) this.value.push('');
            } else {
                this.value = complete ? token : [token, ''];
            }
        }
    }

    isOptional() {
        return this.domain.endsWith('?');
    }

    deleteContents() {
        let contents = this.value;
        this.value = '';
        return contents;
    }
}

class Declaration extends Code {
    init(props) {
        // TODO
    }
}

class Expression extends Code {
    init(props) {
        this.left = typeof props.left === 'object' ? props.left : create('Field', {domain: props.left});
        this.operator = props.operator;
        this.right = create('Field', {domain: props.right});
        this.output = create('Field', {domain: props.output});
    }
}

class Assignment extends Code {
    init(props) {
        this.left = props.left ? props.left : create('Field', {domain: '.'});
        this.right = create('Field', {domain: '.'});
    }
}

class Return extends Code {
    init(props) {
        this.right = create('Field', {domain: '.'}); // TODO - Should be output domain
    }
}

class Selection extends Code {
    init(props) {
        this.condition = create('Field', {domain: props.condition});
        this.branchs = props.branchs.map( branch => create('Branch', {label: branch}));
    }

    deleteChild(child) {
        let ix = Number(child.split('#')[1]);
        // Can only remove last (i.e. "else") branch from if-else
        if (this.branchs.length === ix + 1) {
            return this.branchs.pop();
        } else {
            return '';
        }
    }
}

class Branch extends Code {
    init(props) {
        this.label = props.label;
        this.code = create('Block');
    }
}

class Iteration extends Code {
    init(props) {
        this.optional = props.optional;
        this.condition = create('Field', {domain: '|'});
        this.code = create('Block');
    }
}

class Token extends Code {
    init(props) {
        this.value = props.value;
    }
}

class Literal extends Code {
    init(props) {
        this.value = props.value;
        this.domain = props.value.startsWith('|') ? '|' : '#';
    }
}

const classMap = {Sememe, Nodule, Procedure, Block, Line, Field, Declaration, Expression, Assignment, Return, Token, Literal, Selection, Branch, Iteration};

function create(className, props={}) {
    let element = new classMap[className]({className});
    element.init(props);
    return element;
}

const { serialize, deserialize } = new Serializer(classMap);

export default Model;
