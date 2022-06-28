// Block class

const crypto = require('crypto');

class Block {
    constructor(data, previousHash = '', index = 0) {
        this.timestamp = Date.now();
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.index = index;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return this.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    SHA256(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

module.exports = Block;