// Blockchain API
const Blockchain = require('./Blockchain');
const blockchain = new Blockchain();
const Transaction = require('./Transaction');

// express API
const PORT = process.env.PORT || 3000;
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
app.post('/mine', (req, res) => {
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

// run the server
app.listen(PORT, () => {
    // console.log(`Server is running on port ${PORT}`);
});