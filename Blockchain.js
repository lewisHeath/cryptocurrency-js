// Blockchain class 

const Block = require('./Block');
const Transaction = require('./Transaction');
//axios
const axios = require('axios');

class Blockchain {
    constructor(ip, port) {
        this.ip = ip;
        this.port = port;
        this.chain = [];
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.miningDifficulty = 5;
        this.addGenesisBlock();
        this.nodes = [];
        this.initialNodeConnections();
    }

    setDifficulty(difficulty) {
        this.miningDifficulty = difficulty;
    }

    setReward(reward) {
        this.miningReward = reward;
    }

    async addBlock(data) {
        const previousBlock = this.getLatestBlock();
        const block = new Block(data, previousBlock.hash, this.chain.length);
        block.mineBlock(this.miningDifficulty);
        this.chain.push(block);
        
        //broadcast the new block to all the nodes
        for (const node of this.nodes) {
            console.log(`Broadcasting to ${node}/mined`);
            const res = await fetch(`${node}/mined`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chain: this.chain,
                    block: block
                })
            });
        }
        return block;
    }

    addGenesisBlock() {
        const block = new Block([], '0', 0);
        block.mineBlock(this.miningDifficulty);
        this.chain.push(block);
        return block;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(miningRewardAddress) {
        this.addTransaction(new Transaction(null, miningRewardAddress, this.miningReward));
        const block = this.addBlock(this.pendingTransactions);
        this.pendingTransactions = [];
        return block;
    }

    getChain() {
        return this.chain;
    }

    getPendingTransactions() {
        return this.pendingTransactions;
    }

    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    getWalletBalance(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.data) {
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }
                if (transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }

    checkIfAddressExists(address) {
        for (const block of this.chain) {
            for (const transaction of block.data) {
                if (transaction.fromAddress === address || transaction.toAddress === address) {
                    return true;
                }
            }
        }
        return false;
    }

    addNode(ip, port) {
        // if the node is not in the list of nodes
        if (!this.nodes.includes(`http://${ip}:${port}`)) {
            //connect back to them
            this.connectToNode(`${ip}:${port}`);
            //add the node to the list of nodes
            this.nodes.push(`http://${ip}:${port}`);
        } 
    }

    async initialNodeConnections(){
        //the main record for all nodes is at 192.168.68.131:10000
        const res = await fetch('http://localhost:10000/nodes');
        if(res.status === 200){
            const nodes = await res.json();
            // console.log(nodes);
            this.connectToFirstNodes(nodes);
        }
        
        // send this node to the main record
        const res2 = await fetch('http://localhost:10000/nodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ip: this.ip,
                port: this.port
            })
        });
        if(res2.status === 200){
            console.log('Node added to the main record');
        }
    }

    connectToFirstNodes(nodes) {
        for (const node of nodes) {
            this.connectToNode(node);
        }
    }

    async connectToNode(nodeUrl) {
        // console.log(nodeUrl + '/connect');
        const res = await fetch(`http://${nodeUrl}/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ip: this.ip,
                port: this.port,
                chain: this.chain
            })
        });

        if (res.status === 200) {
            console.log(`Connected to ${nodeUrl}`);
            // add to the nodes record
            this.nodes.push(`http://${nodeUrl}`);
        }

        const res2 = await fetch(`http://${nodeUrl}/chain`);
        if (res2.status === 200) {
            const chain = await res2.json();
            if (chain.length > this.chain.length) {
                this.chain = chain;
            }
        }
    }

}

module.exports = Blockchain;