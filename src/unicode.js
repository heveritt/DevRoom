const Unicode = {
    token: {
        '=>': '\u21D2', // Is a sub-class of
        ':=': '\u2B60', // Assign
        '-' : '\u2212', // Minus
        '*' : '\u00D7', // Multiply
        '/' : '\u00F7', // Divide
        '-_': '\u2212', // Unary Minus
        '==': '\u225F', // Equal to
        '!=': '\u2260', // Not equal to
        '<=': '\u2264', // Less-than or equal to
        '>=': '\u2265', // Greater-than or equal to
        '&&': 'AND',    // Logical AND
        '||': 'OR',     // Logical OR
        '!_': 'NOT',    // Logical NOT
        '|1': '\u2714', // TRUE (Heavy check mark)
        '|0': '\u2718', // FALSE (Heavy ballot X)
        '[$': '\u2B8D', // Loop symbol
        //'&' : '\u2227', // Bitwise AND
        //'|' : '\u2228', // Bitwise inlusive OR
        //'^' : '\u22BB', // Bitwise exclusive OR
        '>>': '\u226B', // Right shift (bits)
        '<<': '\u226A', // Left shift (bits)
        '~_': '~',      // Bitwise one's complement
        '/0': '\u2205', // Null sign
    },

    domain: {
        '.' : '\u00B7', // Data domain (Middle Dot)
        '|' : '\u2611', // Boolean domain (Ballot box with check)
        '#N': '\u2115', // Set of all natural numbers (unsigned integers)
        '#Z': '\u2124', // Set of all integers (signed integers)
        '#R': '\u211D', // Set of all real numbers (floating point numbers)
        '...' : '\u22EF', // Unknown (Middle ellipsis)
    },

    mapToken: function(code) {
        const token = this.token[code];
        return token ? token : code;
    },

    mapDomain: function(code) {
        const token = this.domain[code];
        return token ? token : code;
    }
}

export default Unicode;
