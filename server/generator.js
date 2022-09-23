const fs = require('./filesystem');
const translate = require('./translate');

const generator = {

    generateNode(id, nodule) {
        const jsCode = translate(nodule.code);
        fs.write('generatedJS', id, jsCode);
    }

}

module.exports = generator;