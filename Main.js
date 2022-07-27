// Get arguments from command line
const args = process.argv.slice(2);
const inputPort = args[0];
const ip = 'localhost';

// Blockchain API
const Blockchain = require('./Blockchain');
const blockchain = new Blockchain(ip, inputPort);
const Transaction = require('./Transaction');

// express API
const PORT = process.env.PORT || inputPort;
const express = require('express');
const app = express();
app.use(express.json());

// get the chain
app.get('/', (req, res) => {
    res.send(blockchain.getChain());
});

//get the latest block
app.get('/latest', (req, res) => {
    res.send(blockchain.getLatestBlock());
});

//add a new transaction
app.post('/transaction', (req, res) => {
    console.log(req.body);
    const newTransaction = new Transaction(req.body.from, req.body.to, req.body.amount);
    blockchain.addTransaction(newTransaction);
    res.send({
        message: 'Transaction added successfully.',
        transaction: newTransaction
    });
});

// mine a new block
app.get('/mine', (req, res) => {
    const block = blockchain.minePendingTransactions('x');
    res.send({
        message: 'Block added successfully.',
        block: block
    });
});

//get balance of address
app.get('/balance', (req, res) => {
    let address = req.body.address;
    if (blockchain.checkIfAddressExists(address)) {
        let balance = blockchain.getWalletBalance(address);
        res.send({
            message: 'Balance retrieved successfully.',
            balance: balance
        });
    } else {
        res.send({
            message: 'Address does not exist.'
        });
    }
});

//get mempool
app.get('/mempool', (req, res) => {
    res.send({
        message: 'Mempool retrieved successfully.',
        mempool: blockchain.getPendingTransactions()
    });
});

//connect nodes
app.post('/connect', (req, res) => {
    let nodeIp = req.body.ip;
    let port = req.body.port;
    let chain = req.body.chain;
    if (blockchain.validateChain(chain) && blockchain.chain.length < chain.length) {
        blockchain.chain = chain;
    }
    blockchain.addNode(nodeIp, port);
    res.send({
        message: 'Node added successfully.'
    });
});

//validate block mined by other node
app.post('/mined', (req, res) => {
    let chain = req.body.chain;
    if (blockchain.validateChain(chain)) {
        if(chain.length > blockchain.chain.length) {
            blockchain.chain = chain;
            res.send({
                message: 'Blockchain updated successfully.'
            });
        }
        else {
            res.send({
                message: 'Blockchain is already up to date.'
            });
        }
    } else {
        res.send({
            message: 'Block not valid.'
        });
    }
})

//get all connected nodes
app.get('/nodes', (req, res) => {
    res.send(blockchain.getNodes());
});

//TEST 
app.get('/validate', (req, res) => {
    res.send(blockchain.validateChain(blockchain.chain));
});

// run the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});