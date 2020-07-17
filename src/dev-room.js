import {Component, render} from './renderer';
import Serializer from './serializer';
import Unicode from './unicode';
import Model from './model';
import Database from './db';
import './dev-room.css';

const db = new Database();

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
        db.loadModel()
        .then(json => this.setState({model: Model.import(json)}))
        .catch(error => this.setState({error: error}));
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
    }

    render() {
        return (
            render.block('frame',
                render.block('frame-header',
                    render.block('frame-node', 'Node: ', render.inline('token', this.props.node)),
                    render.block('frame-contexts', 'Contexts: ',
                        ...this.props.contexts.map( (context) => render.inline('token', context) )
                    )
                ),
                render.block('frame-contents', render.component(this.state.contents, {onKey: this.handleKey}))
            )
        );
    }

    handleKey = (path) => (e) => {
        if (e.target.value !== '' && (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab')) {
            e.preventDefault();
            let newFocus = this.props.model.processInput(this.props.node, path, e.target.value, (e.key === 'Enter'));
            db.updateNode(this.props.node, this.props.model.exportNode(this.props.node));
            let view = this.getView();
            if (newFocus) this.getField(view.contents.instructions, newFocus).focus = true;
            this.setState(view);
        }
    }

    getView() {
        return {
            contents: deserialize(this.props.model.compileView(this.props.node, this.props.contexts))
        };
    }

    getField(code, path) {
        return path.split('.').reduce( (node, prop) => node[prop], code);
    }

}

function CodeBlock(props) {
    return (
        render.block('code-block',
            render.block('arguments', render.child(props, 'arguments')),
            render.block('instructions', render.child(props, 'instructions'))
        )
    );
}

function CodeLine(props) {
    return render.block('code-line', render.inline('line-number', (props.ix + 1) + ':'), render.child(props, 'instruction'));
}

function CodeField(props) {
    return render.inline('code-field', render.child(props, 'value'));
}

function Declaration(props) {
    return render.block('declaration', render.inline('token', props.identifier), render.inline('separator', ':'), render.inline('token', props.domain));
}

function Expression(props) {
    return render.inline('expression', render.child(props, 'left'), render.child(props, 'operator'), render.child(props, 'right'));
}

function Token(props) {
    return render.inline('token', Unicode.mapToken(props.value));
}

function Literal(props) {
    return render.inline('literal', props.value);
}

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {value: props.value};

        this.handleKey = props.handlers.onKey(props.path);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({value: e.target.value});
    }

    render() {
        return render.input({
            className: 'input',
            value: this.state.value,
            size: Math.max(this.state.value.length, 1), // html does not allow zero
            onChange: this.handleChange,
            onKeyDown: this.handleKey
        }, this.props.focus);
    }
}

const classMap = {Frame, CodeBlock, CodeLine, CodeField, Declaration, Expression, Token, Input, Literal};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default DevRoom;
