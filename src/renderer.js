import ReactDOM from 'react-dom';
import React from 'react';
import Unicode from './unicode';

class Component extends React.Component {
    
    render () {
        return this.token('Missing render() implementation!');
    }

    block(classes, ...children) {
        return this.element(classes, ...children);
    }

    inline(classes, ...children) {
        return this.element(classes + ' inline', ...children);
    }

    element(classes, ...children) {
        const htmlElement = (classes.split(' ').includes('inline')) ? 'span' : 'div';
        const domProps = {className: classes};
        if (classes.split(' ').includes('selectable')) {
            domProps.tabIndex = 0;
            domProps.onKeyDown = handleKey(this.props.context.onAction, ['delete', 'save'], this.props.path);
        }
        return React.createElement(htmlElement, domProps, ...children);
    }

    input(field, value) {
        let props = {
            value: value,
            context: field.context,
            fieldPath: field.path
        }
        return React.createElement(Input, props);
    }

    component(data, context={}) {
        if (Array.isArray(data)) {
            return data.map( (element, ix) => {
                element.ix = ix;
                element.key = ix.toString();
                return this.component(element, context);
            });
        } else {
            if (data.path === context.focus) {
                context = Object.assign({}, context)
                context.focus = 'NEXT';
            }
            return React.createElement(data.classConstructor, Object.assign({context}, data), null);
        }
    }

    child(role) {
        return this.component(this.props[role], this.props.context);
    }

    editable(role) {
        function renderChild(parent, child) {
            return (typeof child === 'object') ? parent.component(child, parent.props.context) : parent.input(parent.props, child);
        }
        if (Array.isArray(this.props[role])) {
            return this.props[role].map( child => renderChild(this, child) );
        } else {
            return [ renderChild(this, this.props[role]) ];
        }
    }

    token(token, classes='token') {
        if (token === ':=') classes = 'arrow';
        if (token === '|0') classes += ' falsy';
        return this.inline(classes, Unicode.mapToken(token));
    }
}

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
        let domProps= {
            value: this.state.value,
            size: Math.max(this.state.value.length, 1), // html does not allow zero
            onChange: this.handleChange,
            onKeyDown: handleKey(this.props.context.onAction, ['input'], this.props.fieldPath)
        };
        if (this.props.context.focus === 'NEXT') {
            this.props.context.focus = 'DONE';
            domProps.autoFocus = true;
        }

        return React.createElement('input', domProps, null);
    }
}

var handleKey = (handler, actions, path) => (e) => {

    //console.log('Key: ', e.key, 'actions: ', actions, 'path: ', path)
    if (actions.includes('save') && e.key === '£') {

        e.stopPropagation();
        e.preventDefault();
        handler('save');

    } else if (actions.includes('input') && e.target.value && (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab')) {

        e.stopPropagation();
        e.preventDefault();
        handler('input', path, { value: e.target.value, fieldComplete: (e.key !== ' '), lineComplete:  (e.key === 'Enter')});

    } else if (actions.includes('delete') && e.key === 'Delete') {

        e.stopPropagation();
        handler('delete', path);

    }
}

var render = {
    application: function (appClass, parentElement) {
        ReactDOM.render(React.createElement(appClass, null, null), parentElement);
    }
}

export {Component, render};
