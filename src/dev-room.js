import { Component, renderBlock , renderInLine, renderHtmlInput, renderComponent} from './renderer';
import Keyboard from './keyboard';
import './dev-room.css';

class DevRoom extends Component {
  render() {
    return (
      renderBlock('dev-room',
        renderComponent(Frame, null)
      )
    );
  }
}

class Frame extends Component {

  constructor() {
    super();
    this.state = {
      node: 'grid',
      contexts: ['Franca', 'DevRoom', 'SudokuMate'],
      contents: [
        {
          left: 'x', operator: '=', right: '1'
        }, 
        {
          left: 'y', operator: '=', right: {
            left: {
              left: 'x', operator: '*', right: '3'
            },
            operator: '+', right: '5'
          }
        }
      ]
    };
  }

  render() {
    return (
      renderBlock('frame',
        renderBlock('frame-header',
          renderBlock('frame-node', this.renderToken(this.state.node)), 
          renderBlock('frame-contexts', this.renderTokens(this.state.contexts)) 
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
    return renderComponent(CodeLine, {key: key, number: ix + 1, data: line});
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
  return renderBlock('code-line', '' + props.number + ': ', renderData(props.data));
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
