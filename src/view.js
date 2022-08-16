import {Component} from './renderer';
import Serializer from './serializer';


class Frame extends Component {

    constructor(props) {
        super(props);
        this.state = {view: this.getView()};
        this.nodule = this.props.model.node(this.props.node); // Synonym only - link to node currently local

        this.handleAction = this.handleAction.bind(this);
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
                        this.component(this.state.view, {onAction: this.handleAction, focus: this.state.focus || 'NEXT'} )
                    )
                )
            )
        );
    }

    handleAction(action, path, info) {

        console.log(action + ': ' + path);
        let focus = path;
        if (action === 'save') {
            this.nodule.save();
        } else if (action === 'delete') {
            this.nodule.delete(path);
        } else if (action === 'input') {
            this.nodule.input(path, info);
        }

        let view = this.getView();
        this.setState({view, focus});
    }

    getView() {
        const view = deserialize(this.props.model.compileView(this.props.node, this.props.contexts));
/*        fetch("/nodes/12345")
            .then((res) => res.json())
            .then((data) => console.log(data.message));*/
        console.log(view);
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
                    this.block('indent'),
                    this.child('implementation')
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
                ...this.editable('instruction')
            )
        );
    }
}

class Field extends Component {
    render() {
        return (
            this.inline('code-field selectable', 
                ...this.editable('value')
            )
        );
    }
}

class Declaration extends Component {
    render() {
        return (
            this.inline('declaration',
                this.props.role ? this.inline('token', this.props.role + ':') : null,
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

class Selection extends Component {
    render() {
        return (
            this.block('selection',
                this.child('branches')
            )
        );
    }
}

class Branch extends Component {
    render() {
        return (
            this.block('branch',
                this.props.condition ? 
                    this.block('selection',
                        this.token('?'),
                        this.child('condition')
                    ) : null,
                this.block('branch-code',
                    this.block('indent',
                        this.token(this.props.condition ? '|1' : '|0', 'literal')),
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


const classMap = {Procedure, Block, Line, Field, Declaration, Expression, Token, Literal, Selection, Branch};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default Frame;