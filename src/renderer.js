import ReactDOM from 'react-dom';
import React from 'react';

class Component extends React.Component {}

var render = {

	components: {},

	block: function(className, ...children) {
	  return React.createElement('div', {className: className}, ...children);
	},

	inline: function (className, ...children) {
	  return React.createElement('span', {className: className, tabIndex: "0"}, ...children);
	},

	input: function(props) {
	  return React.createElement('input', props, null);
	},

	application: function (appClass, parentElement) {
	  ReactDOM.render(React.createElement(appClass, null, null), parentElement);
	},

	component: function (component, ix) {
 
	  if (typeof component === 'object') {
	    if (Array.isArray(component)) {
	      return component.map( (element, ix) => this.component(element, ix));
	    } else {
	      if (ix !== undefined) {
	        component.ix = ix;
	        component.key = ix.toString();
	      }
	      return React.createElement(this.components[component.className], component, null);
	    }
	  } else {
	    if (component !== '_') {
	      let props = {data: component}
	      if (ix !== undefined) props.key = ix.toString();
	      return React.createElement(this.components['token'], props, null);
	    } else {
	      return React.createElement(this.components['input'], {data: ''}, null);
	    }
	  }
	}
}

export {Component, render};
