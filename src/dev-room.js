import React, { Component } from 'react';
import Keyboard from './keyboard';
import './dev-room.css';

class DevRoom extends Component {
  render() {
    return (
      <div className="dev-room">
        <Frame />
      </div>
    );
  }
}

class Frame extends Component {

  constructor() {
    super();
    this.state = {
      node: 'grid',
      contexts: ['Franca', 'DevRoom', 'SudokuMate'],
      contents: [['x', '=', '1'], ['y', '=', 'x', '+', '3', '*', '5', '_']]
    };
  }

  render() {
    var node = this.renderToken(this.state.node);
    var contexts = this.renderTokens(this.state.contexts);
    var contents = this.renderLines(this.state.contents);
    return (
      <div className="frame">
        <div className="frame-header">
          <div className="frame-node">{node}</div>
          <div className="frame-contexts">{contexts}</div>
        </div>
        <div className="frame-contents">{contents}</div>
      </div>
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
    return (<CodeLine key={key} tokens={this.renderTokens(line, ix)} />);
  }

  renderTokens(tokens, ixLine) {
    return tokens.map( (token, ix) => this.renderToken(token, {line: ixLine, token: ix}) );
  }

  renderToken(token, ix) {
    const key = ix ? ix.token.toString() : '';
    if (token === '_') {
      return (<TokenInput key={key} value='' onKey={this.handleKey(ix)}/>);
    } else {
      return (<Token key={key} token={token} />);
    }
  }

}

function CodeLine(props) {
  return (<div className="code-line">{props.tokens}</div>);
}

function Token(props) {
  return (<span className="token">{props.token}</span>);
}
    
class TokenInput extends React.Component {
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
    return (
        <input
          className="token"
          autoFocus
          value={this.state.value}
          size={Math.max(this.state.value.length, 1)} // html does not allow zero
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
        />
    );
  }
}

export default DevRoom;
