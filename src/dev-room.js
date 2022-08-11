import {Component, render} from './renderer';
import Serializer from './serializer';
import Unicode from './unicode';
import Model from './model';
import './dev-room.css';

class DevRoom extends Component {

    constructor() {
        super();
        this.state = {
            node: 'transform',
            contexts: ['Franca', 'DevRoom', 'SudokuMate'],
            model: null,
            error: null
        } 
    }

    componentDidMount() {
        Model.open()
        .then(model => this.setState({model}))
        .catch(error => this.setState({error}));
    }

    render() {
        if (this.state.model) {
            const frame = {
                classConstructor: Frame,
                className: 'Frame',
                node: this.state.node,
                contexts: this.state.contexts,
                model: this.state.model
            };
            return (
                render.block('dev-room',
                    render.component(frame)
                )
            );
        } else {
            if (this.state.error) {
                return render.block('dev-room', 'Error: ' + this.state.error.message);
            } else {
                return render.block('dev-room', 'Loading Source Model...');
            }
        }
    }
}

class Frame extends Component {

    constructor(props) {
        super(props);
        this.state = {view: this.getView()};
        this.nodule = this.props.model.node(this.props.node); // Synonym only - link to node currently local

        this.handleAction = this.handleAction.bind(this);
    }

    render() {
        return (
            render.block('frame',
                render.block('frame-header',
                    render.block('frame-node', 'Node: ',
                        render.inline('token', this.props.node)
                    )
                ),
                render.block('frame-body',
                    render.block('frame-contexts',
                            ...this.props.contexts.map( (context) => Context({value: context}) )
                        ),
                    render.block('frame-contents',
                        render.component(this.state.view, {onAction: this.handleAction, focus: this.state.focus || 'NEXT'} )
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
            render.block('procedure',
                render.inline('interface',
                    render.child(this.props, 'output'),
                    Token({value: ':='}),
                    render.inline('operation', this.props.operation),
                    render.child(this.props, 'inputs')
                ),
                render.block('implementation',
                    render.block('indent'),
                    render.child(this.props, 'implementation')
                )
            )
        );
    }
}

class Block extends Component {
    render() {
        return render.element('code-block selectable', this.props, render.child(this.props, 'lines'));
    }
}

class Line extends Component {
    render() {
        function renderChild(line, child) {
            return (typeof child === 'object') ? render.component(child, line.context) : render.input(line, child);
        }
        const classes = 'code-line selectable';
        if (Array.isArray(this.props.instruction)) {
            return render.element(classes, this.props, ...( this.props.instruction.map( child => renderChild(this.props, child) ) ) );
        } else {
            return render.element(classes, this.props, renderChild(this.props, this.props.instruction));
        }
    }
}

class Field extends Component {
    render() {
        function renderChild(field, child) {
            return (typeof child === 'object') ? render.component(child, field.context) : render.input(field, child);
        }
        const classes = 'code-field selectable inline';
        if (Array.isArray(this.props.value)) {
            return render.element(classes, this.props, ...( this.props.value.map( child => renderChild(this.props, child) ) ) );
        } else {
            return render.element(classes, this.props, renderChild(this.props, this.props.value));
        }
    }
}

class Declaration extends Component {
    render() {
        return render.inline('declaration',
            this.props.role ? render.inline('token', this.props.role + ':') : null,
            render.inline('domain', this.props.domain)
        );
    }
}

class Expression extends Component {
    render() {
        return render.inline('expression', render.child(this.props, 'left'), render.child(this.props, 'operator'), render.child(this.props, 'right'));
    }
}

class Selection extends Component {
    render() {
        return render.block('selection', render.child(this.props, 'branches'));
    }
}

class Branch extends Component {
    render() {
        return (
            render.block('branch',
                this.props.condition ? render.block('selection', Token({value: '?'}), render.child(this.props, 'condition')) : null,
                render.block('branch-code',
                    render.block('indent', Literal({value: this.props.condition ? '|1' : '|0'})),
                    render.child(this.props, 'code')
                )
            )
        );
    }
}

function Token(props) {
    return render.inline(props.value === ':=' ? 'arrow' : 'token', Unicode.mapToken(props.value));
}

function Literal(props) {
    let classes = 'literal';
    if (props.value === '|0') classes += ' falsy';
    return render.inline(classes, Unicode.mapToken(props.value));
}

function Context(props) {
    return (
        render.block('context',
            render.inline('lozenge', props.value)
        )
    );
}

const classMap = {Frame, Procedure, Block, Line, Field, Declaration, Expression, Token, Literal, Selection, Branch};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default DevRoom;
