import {Component, render} from './renderer';
import Serializer from './serializer';
import Keyboard from './keyboard';
import Model from './model';
import './dev-room.css';

class DevRoom extends Component {

    constructor() {
        super();
        this.state = {
            node: {className: 'token', value: 'grid'},
            contexts: [
                {className: 'token', value: 'Franca'},
                {className: 'token', value: 'DevRoom'},
                {className: 'token', value: 'SudokuMate'}
            ],
            model: new Model({})
        } 
    }

    render() {
        const frame = {
            className: 'frame',
            node: this.state.node,
            contexts: this.state.contexts,
            model: this.state.model
        }
        return (
            render.block('dev-room',
                render.component(frame)
            )
        );
    }
}

class Frame extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contents: props.model.compileView(props.node, props.contexts)
        };
    }

    render() {
        return (
            render.block('frame',
                render.block('frame-header',
                    render.block('frame-node', render.component(this.props.node)), 
                    render.block('frame-contexts', render.component(this.props.contexts)) 
                ),
                render.block('frame-contents', render.component(JSON.parse(this.state.contents), {onKey: this.handleKey}))
            )
        );
    }

    handleKey = (reference) => (e) => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            this.props.model.processInput(reference, e.target.value, (e.key === 'Enter'));
            this.refresh();
        }
    }

    refresh() {
        this.setState(this.props.model.compileView(this.props.node, this.props.contexts));
    }

}

function CodeLine(props) {
    return render.block('code-line', render.inline('line-number', (props.ix + 1) + ':'), render.child(props, 'instruction'));
}

function Expression(props) {
    return render.inline('expression', render.child(props, 'left'), render.child(props, 'operator'), render.child(props, 'right'));
}

function Token(props) {
    return render.inline('token', props.value);
}

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {value: props.value};

        this.handleKey = props.handlers.onKey(props.reference);
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

render.components = {
    'frame': Frame,
    'code-line': CodeLine,
    'expression': Expression,
    'token': Token,
    'input': Input
}

export default DevRoom;
