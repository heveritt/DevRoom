import {Component} from './renderer';
import Frame from './view';
import Model from './model';
import './dev-room.css';

class DevRoom extends Component {

    constructor() {
        super({
            node: 'max',
            contexts: ['Franca', 'DevRoom', 'SudokuMate']
        });
    }

    componentDidMount() {
        Model.open()
        .then(model => this.setState({model}))
        .catch(error => this.setState({error}));
    }

    render() {
        if (this.model) {
            this.frame = new Frame ({
                className: 'Frame',
                node: this.node,
                contexts: this.contexts,
                model: this.model
            });
            return (
                this.block('dev-room',
                    this.child('frame')
                )
            );
        } else {
            if (this.error) {
                return this.block('dev-room', 'Error: ' + this.error.message);
            } else {
                return this.block('dev-room', 'Loading Source Model...');
            }
        }
    }
}

export default DevRoom;
