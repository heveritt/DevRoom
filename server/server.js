const express = require('express');

const server = express();
server.use(express.static('public'));
server.listen(3001, function() {
    console.log('Server started on port 3001');
});