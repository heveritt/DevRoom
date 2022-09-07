const fs = require('fs');
const translate = require('./translate');

class Generator {

    constructor() {
        this.filePath = './generated/';
    }

    generateNode(id, nodule) {
        const fileName = this.filePath + id + '.js';
        const jsCode = translate(nodule.code);
        fs.writeFile(fileName, jsCode, (error) => { if (error) { console.log(error); } } );
    }

}

const generator = new Generator();

module.exports = generator;