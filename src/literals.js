import {Component} from './renderer';

class Literal extends Component {
    render() {
        if (this.domain === '#' && this.value.includes('E')) {
            const [significand, exponent] = this.value.split('E');
            return (
                this.token(significand, 'literal',
                    this.inline('superscript', 'E' + exponent)
                )
            );
        } else if (this.domain === '"') {
            return (
                this.inline('string',
                    this.token('("', 'prefix'),
                    this.inline('literal', this.value),
                    this.token(')"', 'suffix')
                )
            );
        } else {
            return this.token(this.value, 'literal');
        }
    }
}

export default Literal;
