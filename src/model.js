import Serializer from './serializer';
import Database from './db';
import client from './client'
import lookup from './codes'

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

    setChild(role, child) {
        this[role] = child;
        child.setParent(this, role);
    }

    addChild(role, child, ix=this[role].length) {
        this[role].splice(ix, 0, child);
        child.setParent(this, role, ix);
    }

    setParent(parent, role, ix) {
        if (ix !== undefined) role = role + '#' + ix;
        Object.defineProperty(this, 'parent', {value: parent, configurable: true});
        Object.defineProperty(this, 'role', {value: role, configurable: true});
    }

    getPath() {
        return this.parent.getPath() ? this.parent.getPath() + '.' + this.role: this.role;
    }

    getElement(path) {
        return this.parent.getElement(path);
    }

    getChild(role) {
        if (role.includes('#')) {
            let [stem, ix] = role.split('#');
            return this[stem][ix];
        } else {
            return this[role];
        }
    }

    lookupSymbol(token, line=0) {
        return this.parent.lookupSymbol(token, line);
    }

    isOptional() {
        return false;
    }

    deleteContents() {
        return '';
    }

    deleteChild(role) {
        if (this[role] && this[role].isOptional()) {
            let deleted = this[role];
            delete this[role];
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
        let {value, complete} = info;
        //console.log('Path: ' + path + ' value: ' + value + (complete ? ' +' : ' -'));

        this.getElement(path).input(value, complete);
    }

    lookupSymbol(token) {
        return null;
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

    getPath() {
        return '';
    }

    getElement(path) {
        return path.split('.').reduce( (node, child) => node && node.getChild ? node.getChild(child): null, this);
    }

    getParentChild(path) {
        let cut = path.lastIndexOf('.');
        let parent = this.getElement(path.slice(0, cut));
        let child = path.slice(cut + 1);
        return {parent, child};
    }

    newline(path) {
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

    lookupSymbol(token) {
        for (const input of this.inputs) {
            if (input.identifier === token) {
                return input;
            }
        }
        return this.parent.lookupSymbol(token);
    }
}

class Block extends Code {
    init(props) {
        this.lines = [];
        this.addChild('lines', create('Line'));
    }

    lookupSymbol(token, line=0) {
        for (let i = 0; i < line; i++ ) {
            //console.log(this.lines[i]);
            const instruction = this.lines[i].instruction;
            if (instruction && instruction.className === 'Assignment') {
                const assignee = instruction.left.value;
                if (assignee && assignee.className === 'Declaration' && assignee.identifier === token) {
                    return assignee;
                }
            }
        }
        return this.parent.lookupSymbol(token);
    }

    deleteContents() {
        if (this.isEmpty()) {
            return '';
        } else {
            let contents = this.lines;
            this.lines = [];
            this.addChild('lines', create('Line'));
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
        this.addChild('lines', create('Line'), ix + 1);
    }
}

class Line extends Code {

    init(props) {
        this.instruction = '';
    }

    input(value, complete) {
        let props = lookup.instruction(value);
        if (props) {
            if ( Array.isArray(this.instruction) ) {
                props.left = create('Field', {domain: props.left, value: this.instruction[0]});
            }
            this.setChild('instruction', create(props.className, props));
        } else {

            let referent = this.lookupSymbol(value);
            let token;
            if (referent) {
                token = create('Reference', {referent});
            } else {
                // TODO Assume in dictionary at this point and default a domain
                token = create('Declaration', {identifier: value, domain: '.'})
            }

            if (complete) {
                this.setChild('instruction', token);
            } else {
                if (! this.instruction) this.instruction = [''];
                this.addChild('instruction', token, this.instruction.length - 1);
            }
        }
    }

    isEmpty() {
        return ! this.instruction;
    }

    lookupSymbol(token) {
        return this.parent.lookupSymbol(token, Number(this.role.split('#').pop()));
    }

    deleteContents() {
        let contents = this.instruction;
        this.instruction = '';
        return contents;
    }
}

class Field extends Code {

    init(props) {
        this.domain = props.domain;
        if (props.value) {
            this.setChild('value', props.value);
        } else {
            this.value = '';
        }
    }

    input(value, complete) {
        let props = lookup.field(value);
        if (props) {
            if ( props.className === 'Expression' && Array.isArray(this.value) ) {
                props.left = create('Field', {domain: props.left, value: this.value[0]});
            }
            this.setChild('value', create(props.className, props));
        } else {
            let referent = this.lookupSymbol(value);
            let token;
            if (referent) {
                token = create('Reference', {referent});
            } else {
                token = (isNaN(value)) ? create('Token', {value}) : create('Literal', {domain: '#', value});
            }

            if (complete) {
                this.setChild('value', token);
            } else {
                if (! this.value) this.value = [''];
                this.addChild('value', token, this.value.length - 1);
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
        this.identifier = props.identifier;
        if (props.domain) this.domain = props.domain;
    }
}

class Expression extends Code {
    init(props) {
        if (props.left) {
            this.setChild('left', typeof props.left === 'object' ? props.left : create('Field', {domain: props.left}));
        }
        this.operator = props.operator;
        this.setChild('right', create('Field', {domain: props.right}));
        this.setChild('output', create('Field', {domain: props.output}));
        if (props.altRight) {
            this.setChild('altRight', create('Field', {domain: props.altRight}));
        }
    }
}

class Assignment extends Code {
    init(props) {
        this.setChild('left', props.left ? props.left : create('Field', {domain: '.'}));
        this.setChild('right', create('Field', {domain: '.'}));
    }
}

class Return extends Code {
    init(props) {
        this.setChild('right', create('Field', {domain: '.'})); // TODO - Should be output domain
    }
}

class Selection extends Code {
    init(props) {
        this.setChild('condition', create('Field', {domain: props.condition}));
        this.branchs = [];
        for (let branch of props.branchs) {
            this.addChild('branchs', create('Branch', {label: branch}));
        }
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
        this.setChild('code', create('Block'));
    }
}

class Iteration extends Code {
    init(props) {
        this.optional = props.optional;
        this.setChild('condition', create('Field', {domain: '|'}));
        this.setChild('code', create('Block'));
    }
}

class Reference extends Code {
    init(props) {
        this.refPath = props.referent.getPath();
        Object.defineProperty(this, 'identifier', {
            enumerable: true,
            get() {
                let element = this.getElement(this.refPath);
                return element ? element.identifier : '!UNRESOLVED!';
            },
            set(value) {}
        });
    }
}

class Token extends Code {
    init(props) {
        this.value = props.value;
    }
}

class Literal extends Code {
    init(props) {
        this.domain = props.domain;
        this.value = props.value;
    }
}

const classMap = {Sememe, Nodule, Procedure, Block, Line, Field, Declaration, Expression, Assignment, Return, Reference, Token, Literal, Selection, Branch, Iteration};

function create(className, props={}) {
    let element = new classMap[className]({className});
    element.init(props);
    return element;
}

const { serialize, deserialize } = new Serializer(classMap);

export default Model;
