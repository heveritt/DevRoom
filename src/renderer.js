import ReactDOM from 'react-dom';
import React from 'react';

class Component extends React.Component {}

function renderBlock(className, ...children) {
  return React.createElement('div', {className: className}, ...children);
}

function renderInLine(className, ...children) {
  return React.createElement('span', {className: className}, ...children);
}

function renderHtmlInput(props) {
  return React.createElement('input', props, null);
}

function renderComponent(compClass, props) {
  return React.createElement(compClass, props, null);
}

function renderApplication(appClass, parentElement) {
  ReactDOM.render(renderComponent(appClass, null), parentElement);
}

export {Component, renderBlock, renderInLine, renderHtmlInput, renderComponent, renderApplication};
