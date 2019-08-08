import ReactDOM from 'react-dom';
import React from 'react';

class Component extends React.Component {}

var render = {

    block: function(className, ...children) {
        return React.createElement('div', {className: className}, ...children);
    },

    inline: function (className, ...children) {
        let props = {className: className};
        // TODO - Temporary fudge to preserve selectable tabbing
        if (className === 'code-field') props.tabIndex = 0;
        return React.createElement('span', props, ...children);
    },

    input: function(props) {
        return React.createElement('input', props, null);
    },

    application: function (appClass, parentElement) {
        ReactDOM.render(React.createElement(appClass, null, null), parentElement);
    },

    component: function (data, handlers={}) {
        if (Array.isArray(data)) {
            return data.map( (element, ix) => {
                element.ix = ix;
                element.key = ix.toString();
                return this.component(element, handlers);
            });
        } else {
            data.handlers = handlers;
            return React.createElement(data.classConstructor, data, null);
        }
    },

    child: function(parent, role) {
        return this.component(parent[role], parent.handlers);
    }
}

export {Component, render};
