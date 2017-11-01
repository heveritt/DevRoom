const Keyboard = {
  map: {
    '=>': '\u21D2',
    '!=': '\u2260',
    '/=': '\u2260',
    '==': '\u225F',
    '.': '\u00B7'
  },

  mapToken: function(rawToken) {
    const token = this.map[rawToken];
    return token ? token : rawToken;
  }

}

export default Keyboard;
