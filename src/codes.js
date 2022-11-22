
var instructions = {
    '=' : {className: 'Assignment'},
    '<' : {className: 'Return'},
    '?' : {className: 'Selection', condition: '|', branchs: ['|1']},
    '?|': {className: 'Selection', condition: '|', branchs: ['|1', '|0']},
    '?$': {className: 'Iteration', optional: true},
    '$?': {className: 'Iteration', optional: false}
}

var expressions = {
    '+' : {left: '#', right: '#', output: '#'},
    '-' : {left: '#', right: '#', output: '#'},
    '*' : {left: '#', right: '#', output: '#'},
    '/' : {left: '#', right: '#', output: '#'},
    '%' : {left: '#', right: '#', output: '#'},
    '==': {left: '.', right: '.', output: '|'},
    '!=': {left: '.', right: '.', output: '|'},
    '<' : {left: '#', right: '#', output: '|'},
    '>' : {left: '#', right: '#', output: '|'},
    '<=': {left: '#', right: '#', output: '|'},
    '>=': {left: '#', right: '#', output: '|'},
    '&&': {left: '|', right: '|', output: '|'},
    '||': {left: '|', right: '|', output: '|'},
    '<<': {left: "'", right: "#N", output: "'"},
    '>>': {left: "'", right: "#N", output: "'"},
    '&' : {left: "'", right: "'", output: "'"},
    '|' : {left: "'", right: "'", output: "'"},
    '^' : {left: "'", right: "'", output: "'"},
    '-_': {right: '#', output: '#'},
    '!_': {right: '|', output: '|'},
    '~_': {right: "'", output: "'"}
}

var literals = {
    '|0': {domain: '|'},
    '|1': {domain: '|'},
    '/0': {domain: '.'}
}

var lookup = {
    instruction: function(code) {
        let template = instructions[code];
        if (template) return Object.assign({}, template);
        return null;
    },

    field: function(code) {
        let template = expressions[code];
        if (template) return Object.assign({className: 'Expression', operator: code}, template);
        template = literals[code];
        if (template) return Object.assign({className: 'Literal', value: code}, template);
        return null;
    }
}

export default lookup;