import Unicode from './unicode';

var DOM = {
    element: function(tagName, props, listeners, ...children) {

        function appendChild(parent, child) {
            if (child) {
                if (typeof child === 'object') {
                    element.appendChild(child);
                } else {
                    element.innerHTML = child;
                }
            }
        }

        //console.log('<' + tagName + ' ' + props.className + '>');
        let element = document.createElement(tagName);

        for (let key in props) {
            element.setAttribute(key === 'className' ? 'class' : key, props[key]);
        }

        for (let key in listeners) {
            element.addEventListener(key, listeners[key]);
        }

        for (let child of children) {
            //console.log(child);
            if (Array.isArray(child)) {
                child.map( (c) => appendChild(element, c));
            } else {
                appendChild(element, child);
            }
        }

        return element;
    }
}

class Component {

    constructor(props) {
        this.props = {};
        this.state = {};
        Object.assign(this.props, props);
    }

    setState(state) {
        Object.assign(this.state, state);
        let oldElement = this.domElement;
        let newElement = this.render();
        oldElement.replaceWith(newElement);
        this.domElement = newElement;
    }

    focus() {
        if (this.domElement) this.domElement.focus();
    }

    renderToDom() {
        this.domElement = this.render();
        return this.domElement;
    }
    
    render () {
        return this.token('Missing render() implementation!');
    }

    block(classes, ...children) {
        return this.element('div', classes, ...children);
    }

    inline(classes, ...children) {
        return this.element('span', classes, ...children);
    }

    element(tagName, classes, ...children) {
        const domProps = {className: classes};
        const listeners = {};
        if (classes.split(' ').includes('selectable')) {
            domProps.tabIndex = 0;
            listeners.keydown = handleKey(this.props.context.onAction, ['delete', 'save', 'generate'], this.props.path);
        }
        return DOM.element(tagName, domProps, listeners, ...children);
    }

    input(field, value) {
        let props = {
            className: 'Input',
            classConstructor: Input,
            path: field.path + '.value',
            value: value,
            fieldPath: field.path,
            placeholder: field.domain
        }
        return this.component(props, field.context);
    }

    component(data, context={}) {
        let component = new data.classConstructor(Object.assign({context}, data));
        if (context.onCreate) context.onCreate(component);
        return component.renderToDom();
    }

    child(role, ix=null) {
        const child = (ix !== null) ? this.props[role][ix] : this.props[role];
        if (Array.isArray(child)) {
            return child.map( (element, ix) => this.child(role, ix) );
        } else if (typeof child === 'object') {
            return this.component(child, this.props.context);
        } else {
            return this.input(this.props, child);
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
        };
        if (this.props.placeholder) domProps.placeholder = Unicode.mapToken(this.props.placeholder);
        let listeners= {
            change: this.handleChange,
            keydown: handleKey(this.props.context.onAction, ['input'], this.props.fieldPath)
        };

        return DOM.element('input', domProps, listeners);
    }
}

var handleKey = (handler, actions, path) => (e) => {

    //console.log('Key: ', e.key, 'actions: ', actions, 'path: ', path)
    if (actions.includes('save') && e.ctrlKey && (e.key === 's' || e.key === 'S')) {

        e.stopPropagation();
        e.preventDefault();
        handler('save');

    } else if (actions.includes('generate') && e.ctrlKey && (e.key === 'g' || e.key === 'G')) {

        e.stopPropagation();
        e.preventDefault();
        handler('generate');

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
        let app = new appClass({});
        parentElement.appendChild(app.renderToDom());
        app.componentDidMount();
    }
}

export {Component, render};
