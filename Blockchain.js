// Blockchain class 

const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.miningDifficulty = 5;
        this.addGenesisBlock();
    }

    setDifficulty(difficulty) {
        this.miningDifficulty = difficulty;
    }

    setReward(reward) {
        this.miningReward = reward;
    }

    addBlock(data) {
        const previousBlock = this.getLatestBlock();
        const block = new Block(data, previousBlock.hash, this.chain.length);
        block.mineBlock(this.miningDifficulty);
        this.chain.push(block);
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
}

module.exports = Blockchain;