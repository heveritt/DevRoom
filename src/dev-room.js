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
                    render.block('frame-node', 'Node: ',
                        render.inline('token', this.props.node)
                    ),
                    render.block('frame-contexts', 'Contexts: ',
                        ...this.props.contexts.map( (context) => render.inline('token', context) )
                    )
                ),
                render.block('frame-contents',
                    render.component(this.state.contents, {onKey: this.handleKey, focus: this.state.focus || ''} )
                )
            )
        );
    }

    handleKey = (path) => (e) => {
        if (e.target.value !== '' && (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab')) {
            e.preventDefault();
            const fieldComplete = (e.key !== ' ');
            const lineComplete = (e.key === 'Enter');
            let newFocus = this.props.model.processInput(this.props.node, path, e.target.value, fieldComplete, lineComplete);
            console.log('Focus: ' + newFocus);
            db.updateNode(this.props.node, this.props.model.exportNode(this.props.node));
            let view = this.getView();
            if (newFocus) view.focus = newFocus;
            this.setState(view);
        }
    }

    getView() {
        const view = {
            contents: deserialize(this.props.model.compileView(this.props.node, this.props.contexts))
        };
        console.log(view);
        return view;
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
    function renderChild(child) {
        return (typeof child === 'object') ? render.component(child, props.context) : render.input(props, child);
    }
    if (Array.isArray(props.value)) {
        return render.inline('code-field', ...( props.value.map( child => renderChild(child) ) ) );
    } else {
        return render.inline('code-field', renderChild(props.value));
    }
}

function Declaration(props) {
    return render.block('declaration', render.inline('token', props.identifier), render.inline('separator', ':'), render.inline('token', props.domain));
}

function Expression(props) {
    return render.inline('expression', render.child(props, 'left'), render.child(props, 'operator'), render.child(props, 'right'));
}

function Token(props) {
    return render.inline(props.value === ':=' ? 'arrow' : 'token', Unicode.mapToken(props.value));
}

function Literal(props) {
    return render.inline('literal', props.value);
}

const classMap = {Frame, CodeBlock, CodeLine, CodeField, Declaration, Expression, Token, Literal};

const serializer = new Serializer(classMap);

function deserialize(jsonString) {
    return serializer.deserialize(jsonString, false);
}

export default DevRoom;
