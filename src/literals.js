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
        props.content = props.inline('editable', props.value)
        return (
            props.inline('string literal',
                props.token('("', 'prefix'),
                props.content,
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

    focus() {
        if (this.domain === '"' && this.content) {
            this.content.focus();
        } else {
            super.focus();
        }
    }
}

export default Literal;
