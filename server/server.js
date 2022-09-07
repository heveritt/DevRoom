const express = require('express');
const generator = require('./generator');

const server = express();
const port = 3001;

server.use(express.json());

server.get('/nodes/:nodeId', (req, res) => {
    console.log('Requested node: ' + req.params.nodeId);
    res.json({ message: "Hello from server!" });
});

server.put('/generated/:nodeId', (req, res) => {
    console.log('Generated code for nodule: ' + req.params.nodeId);
    generator.generateNode(req.params.nodeId, req.body);
    res.json({ message: "Hello from server Hugo!" });
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