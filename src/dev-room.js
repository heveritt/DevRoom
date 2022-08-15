import {Component, render} from './renderer';
import Frame from './view';
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

export default DevRoom;
