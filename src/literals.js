import {Component} from './renderer';

const render = {
    '#' : function(props) {
        if (props.value.includes('E')) {
            const [significand, exponent] = props.value.split('E');
            return (
                props.token(significand, 'literal',
                    props.inline('superscript', 'E' + exponent)
                )
            )
        } else {
            return props.token(props.value, 'literal');
        }
    },

    '"' : function(props) {
        return (
            props.inline('string',
                props.token('("', 'prefix'),
                props.inline('literal', props.value),
                props.token(')"', 'suffix')
            )
        );
    }
};

class Literal extends Component {
    render() {
        return render[this.domain](this);
    }
}

export default Literal;
