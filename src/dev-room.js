import {Component, render} from './renderer';
import Serializer from './serializer';
import Keyboard from './keyboard';
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
        this.state = this.getContents();
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
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            this.props.model.processInput(this.props.node, path, e.target.value, (e.key === 'Enter'));
            db.updateNode(this.props.node, this.props.model.exportNode(this.props.node));
            this.setState(this.getContents());
        }
    }

    getContents() {
        return {
            contents: deserialize(this.props.model.compileView(this.props.node, this.props.contexts))
        };
    }

}

function CodeLine(props) {
    return render.block('code-line', render.inline('line-number', (props.ix + 1) + ':'), render.child(props, 'instruction'));
}

function CodeField(props) {
    return render.inline('code-field', render.child(props, 'value'));
}

function Expression(props) {
    return render.inline('expression', render.child(props, 'left'), render.child(props, 'operator'), render.child(props, 'right'));
}

function Token(props) {
    return render.inline('token', props.value);
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
        const mappedValue = Keyboard.mapToken(e.target.value);
        this.setState({value: mappedValue});
    }   

    render() {
        return render.input({
            className: 'input',
            autoFocus: 'autofocus',
            value: this.state.value,
            size: Math.max(this.state.value.length, 1), // html does not allow zero
            onChange: this.handleChange,
            onKeyDown: this.handleKey
        });
    }
}

const classMap = {Frame, CodeLine, CodeField, Expression, Token, Input, Literal};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default DevRoom;
