const Keyboard = {
    map: {
        '=>': '\u21D2' // Is a sub-class of
    },

    mapToken: function(rawToken) {
        const token = this.map[rawToken];
        return token ? token : rawToken;
    }
}

export default Keyboard;
