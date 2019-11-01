const express = require('express');

const server = express();
const port = 3001;

server.use(express.static('build'));

server.get('nodes/:nodeId', (req, res) => {
    console.log('Requested node: ' + req.params.nodeId);
});

server.use( (req, res, next) => {
    res.status(404).send("404 - Page not found!");
});

server.use( (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("500 - Application Error!");
});

server.listen(port, () => {
    console.log('Server started on port '  + port);
});