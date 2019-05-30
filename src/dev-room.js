import {Component, render} from './renderer';
import Keyboard from './keyboard';
import Model from './model';
import './dev-room.css';

class DevRoom extends Component {

  constructor() {
    super();
    this.state = {
      node: 'grid',
      contexts: ['Franca', 'DevRoom', 'SudokuMate'],
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
    var contents = props.model.compileView(props.node, props.contexts);
    this.state = {
      contents: contents
    };
  }

  render() {
    return (
      render.block('frame',
        render.block('frame-header',
          render.block('frame-node', render.component(this.props.node)), 
          render.block('frame-contexts', render.component(this.props.contexts)) 
        ),
        render.block('frame-contents', render.component(this.state.contents))
      )
    );
  }

  handleKey = (ix) => (e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      var newContents = this.state.contents.slice();
      newContents[ix.line][ix.token] = e.target.value;
      if (e.key === 'Enter') {
        newContents.push(['_']);
      } else {
        newContents[ix.line].push('_');
      }
      this.setState({
        contents: newContents
      });
    }
  }

}

function CodeLine(props) {
  return render.block('code-line', render.inline('line-number', (props.ix + 1) + ':'), render.component(props.instruction));
}

function Expression(props) {
  return render.inline('expression', render.component(props.left), render.component(props.operator), render.component(props.right));
}

function Token(props) {
  return render.inline('token', props.data);
}

class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {value: props.data};

    this.handleKey = props.onKey;
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
  'codeline': CodeLine,
  'expression': Expression,
  'token': Token,
  'input': Input
}

export default DevRoom;
