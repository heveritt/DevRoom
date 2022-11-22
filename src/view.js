import {Component} from './renderer';
import Serializer from './serializer';


class Frame extends Component {

    constructor(props) {
        super(props);
        this.view = this.getView();
        this.components = {};
        this.focus = '';
        this.nodule = this.model.node(this.node); // Synonym only - link to node currently local

        this.handleAction = this.handleAction.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
    }

    render() {
        return (
            this.block('frame',
                this.block('frame-header',
                    this.block('frame-node', 'Node: ',
                        this.token(this.node)
                    )
                ),
                this.block('frame-body',
                    this.block('frame-contexts',
                            ...this.contexts.map( (context) => this.block('context', this.inline('lozenge', context)) )
                        ),
                    this.block('frame-contents',
                        this.child('view', {onAction: this.handleAction, onCreate: this.handleCreate} )
                    )
                )
            )
        );
    }

    handleAction(action, path, info) {

        //console.log(action + ': ' + path);
        this.focus = path;
        this.nodule[action](path, info);
        let view = this.getView();
        this.components = {};
        this.setState({view});
        //console.log('Focus: ' + this.focus);
        if (this.focus && this.components[this.focus]) this.components[this.focus].focus();
        //console.log(this.components);
    }

    handleCreate(component) {
        if (component.path) this.components[component.path] = component;
        if (this.focus) {
            if (this.focus === component.path) this.focus = '';
        } else {
            if (component.className === 'Input') this.focus = component.path;
        }
    }

    getView() {
        const view = deserialize(this.model.compileView(this.node, this.contexts));
        // console.log(view);
        return view;
    }
}


class Procedure extends Component {
    render() {
        return (
            this.block('procedure',
                this.inline('interface',
                    this.child('output'),
                    this.token(':='),
                    this.token(this.operation),
                    this.child('inputs')
                ),
                this.block('implementation',
                    this.block('procedure-code',
                        this.block('indent'),
                        this.child('implementation')
                    )
                )
            )
        );
    }
}

class Block extends Component {
    render() {
        return (
            this.block('code-block selectable', 
                this.child('lines')
            )
        );
    }
}

class Line extends Component {
    render() {
        return (
            this.block('code-line selectable', 
                this.child('instruction')
            )
        );
    }
}

class Field extends Component {
    render() {
        return (
            this.inline('code-field selectable', 
                this.child('value')
            )
        );
    }
}

class Declaration extends Component {
    render() {
        return (
            this.inline('declaration',
                this.identifier ? this.token(this.identifier) : null,
                this.token(this.domain, 'domain')
            )
        );
    }
}

class Expression extends Component {
    render() {
        return (
            this.inline('expression',
                this.left ? this.child('left') : null,
                this.token(this.operator),
                this.child('right')
            )
        );
    }
}

class Assignment extends Component {
    render() {
        return (
            this.inline('assignment',
                this.child('left'),
                this.token(':='),
                this.child('right')
            )
        );
    }
}

class Return extends Component {
    render() {
        return (
            this.inline('return',
                this.token(':='),
                this.child('right')
            )
        );
    }
}

class Selection extends Component {
    render() {
        return (
            this.block('selection',
                this.token('?'),
                this.child('condition'),
                this.child('branchs')
            )
        );
    }
}

class Branch extends Component {
    render() {
        return (
            this.block('branch selectable',
                this.block('label',
                    this.token(this.label, 'literal')
                ),
                this.block('indent'),
                this.child('code')
            )
        );
    }
}

class Iteration extends Component {
    render() {
        return (
            this.block('iteration',
                this.optional ? (
                    this.block('loop-condition',
                        this.token('?'),
                        this.child('condition'),
                        this.token('[$')
                    )
                ) : (
                    this.block('loop-condition',
                        this.token('[$'),
                        this.child('condition'),
                        this.token('?'),
                    )
                ),
                this.block('loop-code',
                    this.block('indent'),
                    this.child('code')
                )
            )
        );
    }
}

class Reference extends Component {
    render() {
        return this.token(this.identifier, 'reference');
    }
}

class Token extends Component {
    render() {
        return this.token(this.value);
    }
}

class Literal extends Component {
    render() {
        return this.token(this.value, 'literal');
    }
}


const classMap = {Procedure, Block, Line, Field, Declaration, Expression, Assignment, Return, Reference, Token, Literal, Selection, Branch, Iteration};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default Frame;