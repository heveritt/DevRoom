import ReactDOM from 'react-dom';
import React from 'react';

class Component extends React.Component {}

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {value: props.value};

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({value: e.target.value});
    }

    render() {
        let props= {
            value: this.state.value,
            size: Math.max(this.state.value.length, 1), // html does not allow zero
            onChange: this.handleChange,
            onKeyDown: this.props.context.onKey(this.props.fieldPath)
        };
        if (this.props.context.focus === 'NEXT') {
            this.props.context.focus = 'DONE';
            props.autoFocus = true;
        }
        return React.createElement('input', props, null);
    }
}

var render = {

    block: function(classes, ...children) {
        return this.element(classes, ...children);
    },

    inline: function (classes, ...children) {
        return this.element(classes + ' inline', ...children);
    },

    element: function (classes, ...children) {
        const htmlElement = (classes.split(' ').includes('inline')) ? 'span' : 'div';
        const domProps = {className: classes};
        if (classes.split(' ').includes('selectable')) domProps.tabIndex = 0;
        return React.createElement(htmlElement, domProps, ...children);
    },

    input: function(field, value) {
        let props = {
            value: value,
            context: field.context,
            fieldPath: field.path
        }
        return React.createElement(Input, props);
    },

    application: function (appClass, parentElement) {
        ReactDOM.render(React.createElement(appClass, null, null), parentElement);
    },

    component: function (data, context={}) {
        if (Array.isArray(data)) {
            return data.map( (element, ix) => {
                element.ix = ix;
                element.key = ix.toString();
                return this.component(element, context);
            });
        } else {
            if (data.path === context.focus) context.focus = 'NEXT';
            data.context = context;
            return React.createElement(data.classConstructor, data, null);
        }
    },

    child: function(parent, role) {
        return this.component(parent[role], parent.context);
    }
}

export {Component, render};
