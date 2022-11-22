
function translate(nodule) {

    let indent = '';

    const translate = {

        Procedure: function(props) {
            return indent + 'function ' + props.operation + '(' + trArray(props.inputs) + ')' + trObject(props.implementation);
        },
        
        Block: function(props) {
            let code = ' {\n';
            indent = indent + '    ';
            code += trArray(props.lines, '');
            indent = indent.slice(0, -4);
            code += indent + '}'
            return code;
        },

        Line: function(props) {
            if (props.instruction) {
                return indent + trObject(props.instruction) + '\n';
            } else {
                return '\n';
            }
        },

        Field: function(props) {
            if (typeof props.value === 'object') {
                return trObject(props.value);
            } else {
                return props.value.toString();
            }
        },
        
        Declaration: function(props) {
            if (props.assignee) {
                return 'let ' + props.identifier;
            } else {
                return props.identifier;
            }
        },

        Expression: function(props) {
            if (props.altRight) {       // Ternary
                return '(' + trObject(props.left) + ' ' + props.operator + ' ' + trObject(props.right) + ' : ' + trObject(props.altRight) + ')';
            } else if (props.left) {    // Binary
                return '(' + trObject(props.left) + ' ' + props.operator + ' ' + trObject(props.right) + ')';
            } else {                    // Unary
                return '(' + props.operator.slice(0, 1) + trObject(props.right) + ')';
            }
        },

        Assignment: function(props) {
            props.left.value.assignee = true;
            return trObject(props.left) + ' = ' + trObject(props.right) + ';';
        },

        Return: function(props) {
            return 'return ' + trObject(props.right) + ';';
        },

        Reference: function(props) {
            return props.identifier;
        },

        Token: function(props) {
            return props.value;
        },

        Literal: function(props) {
            const map = {
                '|1': 'true',
                '|0': 'false',
                '/0': 'null'
            }
            return map[props.value] ? map[props.value] : props.value;
        },

        Selection: function(props) {
            let code = 'if ' + trObject(props.condition) + trObject(props.branchs[0]);
            if (props.branchs.length > 1) code += ' else' + trObject(props.branchs[1]);
            return code;
        },

        Branch: function(props) {
            return trObject(props.code);
        },
        
        Iteration: function(props) {
            if (props.optional) {
                return 'while ' + trObject(props.condition) + trObject(props.code);
            } else {
                return 'do' + trObject(props.code) + ' while ' + trObject(props.condition) + ';'; 
            }
        }
    };

    function trObject(object) {
        return translate[object.className](object);
    }

    function trArray(array, separator=', ') {
        return array.map( (element) => trObject(element) ).join(separator);
    }

    return trObject(nodule);
}

module.exports = translate;