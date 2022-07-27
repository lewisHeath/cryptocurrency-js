// express API
const PORT = process.env.PORT || 10000;
const express = require('express');
const app = express();
app.use(express.json());

let nodes = [];

// get the node list
app.get('/nodes', (req, res) => {
    console.log('Sending Node List...');
    res.send(nodes);
});

// add node to the list
app.post('/nodes', (req, res) => {
    let ip = req.body.ip;
    let port = req.body.port;
    let node = ip + ':' + port;
    
    // check if the node is already in the list
    if (nodes.indexOf(node) === -1) {
        nodes.push(node);
    }

    console.log(`Node added to the list: ${node}`);

    res.send({
        message: 'Node added successfully.'
    });
});

// run the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});