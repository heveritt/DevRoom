
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
            return props.role;
        },
        
        Expression: function(props) {
            return '(' + trObject(props.left) + ' ' + trObject(props.operator) + ' ' + trObject(props.right) + ')';
        },

        Assignment: function(props) {
            return trObject(props.left) + ' = ' + trObject(props.right) + ';';
        },

        Token: function(props) {
            return props.value;
        },

        Literal: function(props) {
            return props.value;
        },

        Selection: function(props) {
            return trArray(props.branches, '');
        },

        Branch: function(props) {
            if (props.condition) {
                return 'if ' + trObject(props.condition) + trObject(props.code);
            } else {
                return ' else' + trObject(props.code);
            }
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