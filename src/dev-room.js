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
        this.state = this.getView();
        this.nodule = this.props.model.node(this.props.node); // Synonym only - link to node currently local

        this.handleAction = this.handleAction.bind(this);
    }

    render() {
        return (
            render.block('frame',
                render.block('frame-header',
                    render.block('frame-node', 'Node: ',
                        render.inline('token', this.props.node)
                    ),
                    render.block('frame-contexts', 'Contexts: ',
                        ...this.props.contexts.map( (context) => render.inline('token', context) )
                    )
                ),
                render.block('frame-contents',
                    render.component(this.state.contents, {onAction: this.handleAction, focus: this.state.focus || 'NEXT'} )
                )
            )
        );
    }

    handleAction(action, path, info) {

        console.log(action + ': ' + path);
        if (action === 'save') {
            this.nodule.save();
        } else if (action === 'delete') {
            this.nodule.delete(path);
        } else if (action === 'input') {
            this.nodule.input(path, info);
        }

        let view = this.getView();
        view.focus = path;
        this.setState(view);
    }

    getView() {
        const view = {
            contents: deserialize(this.props.model.compileView(this.props.node, this.props.contexts))
        };
        console.log(view);
        return view;
    }
}

function Procedure(props) {
    return (
        render.block('procedure',
            render.inline('interface',
                render.child(props, 'output'),
                Token({value: ':='}),
                render.inline('operation', props.operation),
                render.child(props, 'inputs')
            ),
            render.block('implementation',
                render.block('indent'),
                render.child(props, 'implementation')
            )
        )
    );
}

function Block(props) {
    return render.element('code-block selectable', props, render.child(props, 'lines'));
}

function Line(props) {
    function renderChild(child) {
        return (typeof child === 'object') ? render.component(child, props.context) : render.input(props, child);
    }
    const classes = 'code-line selectable';
    if (Array.isArray(props.instruction)) {
        return render.element(classes, props, ...( props.instruction.map( child => renderChild(child) ) ) );
    } else {
        return render.element(classes, props, renderChild(props.instruction));
    }
}

function Field(props) {
    function renderChild(child) {
        return (typeof child === 'object') ? render.component(child, props.context) : render.input(props, child);
    }
    const classes = 'code-field selectable inline';
    if (Array.isArray(props.value)) {
        return render.element(classes, props, ...( props.value.map( child => renderChild(child) ) ) );
    } else {
        return render.element(classes, props, renderChild(props.value));
    }
}

function Declaration(props) {
    return render.inline('declaration',
        props.role ? render.inline('token', props.role + ':') : null,
        render.inline('domain', props.domain)
    );
}

function Expression(props) {
    return render.inline('expression', render.child(props, 'left'), render.child(props, 'operator'), render.child(props, 'right'));
}

function Token(props) {
    return render.inline(props.value === ':=' ? 'arrow' : 'token', Unicode.mapToken(props.value));
}

function Literal(props) {
    let classes = 'literal';
    if (props.value === '|0') classes += ' falsy';
    return render.inline(classes, Unicode.mapToken(props.value));
}

function Selection(props) {
    return render.block('selection', render.child(props, 'branches'));
}

function Branch(props) {
    return (
        render.block('branch',
            props.condition ? render.block('selection', Token({value: '?'}), render.child(props, 'condition')) : null,
            render.block('branch-code',
                render.block('indent', Literal({value: props.condition ? '|1' : '|0'})),
                render.child(props, 'code')
            )
        )
    );
}

const classMap = {Frame, Procedure, Block, Line, Field, Declaration, Expression, Token, Literal, Selection, Branch};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default DevRoom;
