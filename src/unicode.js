const Unicode = {
    map: {
        '=>': '\u21D2', // Is a sub-class of
        ':=': '\u2190', // Assign
        '*' : '\u00D7', // Multiply
        '/' : '\u00F7', // Divide
        '==': '\u225F', // Equal to
        '!=': '\u2260', // Not equal to
        '<=': '\u2264', // Less-than or equal to
        '>=': '\u2265', // Greater-than or equal to
        '&&': '\u2227', // Logical AND
        '||': '\u2228', // Logical OR
    },

    mapToken: function(rawToken) {
        const token = this.map[rawToken];
        return token ? token : rawToken;
    }
}

export default Unicode;
