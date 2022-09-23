const express = require('express');
const generator = require('./generator');
const fs = require('./filesystem');

const server = express();
const port = 3001;

server.use(express.json());

server.put('/nodes/:nodeId', (req, res) => {
    fs.write('francaFile', req.params.nodeId, JSON.stringify(req.body, null, 2));
    console.log('Saved nodule: ' + req.params.nodeId);
    res.json({ message: "Hello from server saved!" });
});

server.put('/generated/:nodeId', (req, res) => {
    generator.generateNode(req.params.nodeId, req.body);
    console.log('Generated code for nodule: ' + req.params.nodeId);
    res.json({ message: "Hello from server generated!" });
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