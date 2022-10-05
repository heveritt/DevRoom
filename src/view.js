import {Component} from './renderer';
import Serializer from './serializer';


class Frame extends Component {

    constructor(props) {
        super(props);
        this.state = {view: this.getView()};
        this.components = {};
        this.focus = '';
        this.nodule = this.props.model.node(this.props.node); // Synonym only - link to node currently local

        this.handleAction = this.handleAction.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
    }

    render() {
        return (
            this.block('frame',
                this.block('frame-header',
                    this.block('frame-node', 'Node: ',
                        this.inline('token', this.props.node)
                    )
                ),
                this.block('frame-body',
                    this.block('frame-contexts',
                            ...this.props.contexts.map( (context) => this.block('context', this.inline('lozenge', context)) )
                        ),
                    this.block('frame-contents',
                        this.component(this.state.view, {onAction: this.handleAction, onCreate: this.handleCreate} )
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
        if (component.props.path) this.components[component.props.path] = component;
        if (this.focus) {
            if (this.focus === component.props.path) this.focus = '';
        } else {
            if (component.props.className === 'Input') this.focus = component.props.path;
        }
    }

    getView() {
        const view = deserialize(this.props.model.compileView(this.props.node, this.props.contexts));
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
                    this.token(this.props.operation),
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
            this.inline(this.getRole() + ' declaration',
                this.props.role ? this.inline('token', this.props.role) : null,
                this.inline('domain', this.props.domain)
            )
        );
    }
}

class Expression extends Component {
    render() {
        return (
            this.inline('expression',
                this.child('left'),
                this.child('operator'),
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
                    this.token(this.props.label, 'literal')
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
                this.props.optional ? (
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

class Token extends Component {
    render() {
        return this.token(this.props.value);
    }
}

class Literal extends Component {
    render() {
        return this.token(this.props.value, 'literal');
    }
}


const classMap = {Procedure, Block, Line, Field, Declaration, Expression, Assignment, Return, Token, Literal, Selection, Branch, Iteration};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default Frame;