const fs = require('fs');

class Generator {

    constructor() {
        this.filePath = './generated/';
    }

    generateNode(id, json) {
        const fileName = this.filePath + id + '.js';
        fs.writeFile(fileName, json, (error) => { if (error) { console.log(error); } } );
    }

}

const generator = new Generator();

module.exports = generator;