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
      focus: 'grid',
      contexts: ['Franca', 'DevRoom', 'SudokuMate'],
      contents: [['x', '=', '1'], ['y', '=', 'x', '+', '3', '*', '5', '_']]
    };
  }

  render() {
    var focus = this.renderToken(this.state.focus);
    var contexts = this.renderTokens(this.state.contexts);
    var contents = this.renderLines(this.state.contents);
    return (
      <div className="frame">
        <div className="frame-header">
          <div className="frame-focus">{focus}</div>
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
      newContents[ix[0]][ix[1]] = e.target.value;
      if (e.key === 'Enter') {
        newContents.push(['_']);
      } else {
        newContents[ix[0]].push('_');
      }
      this.setState({
        contents: newContents
      });
    }
  }

  renderLines(lines) {
    return lines.map( (line, ixLine) => this.renderLine(line, ixLine) );
  }

  renderLine(line, ixLine) {
    return (<CodeLine tokens={this.renderTokens(line, ixLine)} />);
  }

  renderTokens(tokens, ixLine) {
    return tokens.map( (token, ixToken) => this.renderToken(token, [ixLine, ixToken]) );
  }

  renderToken(token, ix) {
    if (token === '_') {
      return (<TokenInput onKey={this.handleKey(ix)}/>);
    } else {
      return (<Token token={token} />);
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
    this.state = {value: ''};

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
