import {Component} from './renderer';

const render = {
    '#' : function(props) {
        const [significand, exponent] = props.value.split('E');
        return (
            props.token(significand, 'literal',
                exponent ? props.inline('superscript', 'E' + exponent) : null
            )
        )
    },

    '"' : function(props) {
        return (
            props.inline('string',
                props.token('("', 'prefix'),
                props.inline('literal', props.value),
                props.token(')"', 'suffix')
            )
        );
    },

    '|': function(props) {
        return props.token(props.value, 'literal');
    }
};

class Literal extends Component {
    render() {
        return render[this.domain](this);
    }
}

export default Literal;
