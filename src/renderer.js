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
        Object.assign(this, props);
    }

    setState(state) {
        Object.assign(this, state);
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
        if (classes.split(' ').includes('selectable')) domProps.tabIndex = 0;

        const listeners = {};
        const actions = getActions(classes.split(' '));
        if (actions.length > 0) {
            let handler = this.handleAction ? this.handleAction : this.context.onAction;
            listeners.keydown = handleKey(handler, actions, this.path);
        }

        return DOM.element(tagName, domProps, listeners, ...children);
    }

    input(parent, value) {
        let component = new Input({
            className: 'Input',
            path: parent.path + '.input',
            value: value,
            parentPath: parent.path,
            domain: parent.domain ? parent.domain : '...'
        });
        return render.component(component, parent.context);
    }

    child(role, context=this.context) {
        let child = role.split('#').reduce( (element, ix) => element[ix], this);
        if (Array.isArray(child)) {
            return child.map( (element, ix) => this.child(role + '#' + ix) );
        } else if (typeof child === 'object') {
            return render.component(child, context);
        } else {
            return this.input(this, child);
        }
    }

    token(token, variants, ...children) {
        let classes = 'token';
        if (variants) classes = classes + ' ' + variants;
        if (token === ':=') classes += ' arrow';
        if (token === '|0' || token === '/0') classes += ' falsy';
        if (token === '&&' || token === '||' || token === '!_') classes += ' keyword';
        if (token === '-_' || token === '~_') classes += ' prefix';
        const unicode = classes.split(' ').includes('domain') ? Unicode.mapDomain(token) : Unicode.mapToken(token);
        return this.inline(classes, unicode, children);
    }
}

class Input extends Component {
    constructor(props) {
        super(props);

        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        this.value = e.target.value;
        let oldContent = this.content;
        this.renderContent();
        oldContent.replaceWith(this.content);
    }

    focus() {
        this.facade.focus();
    }

    renderContent() {
        this.content = (this.value) ? this.token(this.value) : this.token(this.domain, 'domain');
    }

    renderFacade() {
        let domProps= {
            value: this.value,
            autofocus: true, // Controls focus on initial load - focus will fall on first DOM element with autofocus.
            className: 'facade'
        };
        let listeners = {
            input: this.handleInput,
            keydown: handleKey(this.context.onAction, ['input'], this.parentPath)
        };
        this.facade = DOM.element('input', domProps, listeners);
    }

    render() {
        this.renderContent();
        this.renderFacade();
        return (
            this.inline('input',
                this.content,
                this.facade
            )
        );
    }
}

function getActions(categorys) {
    const map = {
        'selectable': ['delete'],
        'code-line': ['newline'],
        'frame': ['save', 'generate']
    }
    return categorys.reduce( (actions, category) => map[category] ? actions.concat(map[category]) : actions, []); 
}

function handleKey(handler, actions, path) {

    const keyMap = {
        'save': e => e.ctrlKey && (e.key === 's' || e.key === 'S'),
        'generate': e => e.ctrlKey && (e.key === 'g' || e.key === 'G'),
        'input': e => e.target.value && (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab'),
        'newline': e => e.key === 'Enter',
        'delete': e => e.key === 'Delete'
    }

    return function(e) {
        for (const action of actions) {
            if (keyMap[action](e)) {
                if (! (action === 'input' && e.key === 'Enter') ) e.stopPropagation();
                if (! (action === 'delete') ) e.preventDefault();
                const info = (action === 'input') ? {value: e.target.value, complete: (e.key !== ' ')} : null;
                handler(action, path, info);
            }
        }
    }
}

var render = {
    application: function (appClass, parentElement) {
        let app = new appClass({});
        parentElement.appendChild(app.renderToDom());
        app.componentDidMount();
    },

    component(component, context={}) {
        Object.assign(component, {context});
        if (context.onCreate) context.onCreate(component);
        return component.renderToDom();
    }

}

export {Component, render};
