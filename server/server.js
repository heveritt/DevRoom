const express = require('express');

const server = express();
server.use(express.static('build'));
server.listen(3001, function() {
    console.log('Server started on port 3001');
});