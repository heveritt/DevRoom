import { Component, renderBlock , renderInLine, renderHtmlInput, renderComponent} from './renderer';
import Keyboard from './keyboard';
import Model from './model';
import './dev-room.css';

class DevRoom extends Component {

  constructor() {
    super();
    this.state = {
      node: 'grid',
      contexts: ['Franca', 'DevRoom', 'SudokuMate'],
      model: new Model()
    } 
  }

  render() {
    const props = {
      node: this.state.node,
      contexts: this.state.contexts,
      model: this.state.model
    }
    return (
      renderBlock('dev-room',
        renderComponent(Frame, props)
      )
    );
  }
}

class Frame extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: this.props.model.compileView(this.props.node, this.props.contexts)
    };
  }

  render() {
    return (
      renderBlock('frame',
        renderBlock('frame-header',
          renderBlock('frame-node', this.renderToken(this.props.node)), 
          renderBlock('frame-contexts', this.renderTokens(this.props.contexts)) 
        ),
        renderBlock('frame-contents', this.renderLines(this.state.contents))
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

  renderLines(lines) {
    return lines.map( (line, ix) => this.renderLine(line, ix) );
  }

  renderLine(line, ix) {
    const key = ix.toString();
    return renderComponent(CodeLine, {key: key, data: line});
  }

  renderTokens(tokens, ixLine) {
    return tokens.map( (token, ix) => this.renderToken(token, {line: ixLine, token: ix}) );
  }

  renderToken(token, ix) {
    const key = ix ? ix.token.toString() : '';
    if (token === '_') {
      return renderComponent(TokenInput, {key: key, value: '', onKey: this.handleKey(ix)});
    } else {
      return renderComponent(Token, {key: key, data: token});
    }
  }

}

function renderData(data) {
  if (typeof data === 'object') {
    return renderComponent(Expression, {data: data});
  } else {
    return renderComponent(Token, {data: data});
  }
}
  
function CodeLine(props) {
  return renderBlock('code-line', renderData(props.data));
}

function Expression(props) {
  return renderInLine('expression', renderData(props.data.left), renderData(props.data.operator), renderData(props.data.right));
}

function Token(props) {
  return renderInLine('token', props.data);
}
    
class TokenInput extends Component {
  constructor(props) {
    super(props);
    this.state = {value: props.value};

    this.handleKey = props.onKey;
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const mappedValue = Keyboard.mapToken(e.target.value);
    this.setState({value: mappedValue});
  }

  render() {
    return renderHtmlInput({
             className: 'token',
             autoFocus: 'autofocus',
             value: this.state.value,
             size: Math.max(this.state.value.length, 1), // html does not allow zero
             onChange: this.handleChange,
             onKeyDown: this.handleKey
           });
  }
}

export default DevRoom;
