const fs = require('fs');

props = {
    francaFile:  {path: './franca/', ext: '.json'},
    generatedJS: {path: './generated/', ext: '.js'}
}

const filesystem = {

    write(type, node, content) {
        const {path, ext} = props[type];
        const fileName = path + node + ext;
        fs.writeFile(fileName, content, (error) => { if (error) { console.log(error); } } );
    }

}

module.exports = filesystem;