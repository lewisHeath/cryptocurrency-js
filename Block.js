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

    updateTimeStamp() {
        this.timestamp = Date.now();
        return this.timestamp;
    }

    calculateHash() {
        let toBeHashed = this.index + this.previousHash + this.updateTimeStamp() + JSON.stringify(this.data) + this.nonce.toString();
        return crypto.createHash('sha256').update(toBeHashed).digest('hex');
    }

    mineBlock(difficulty) {
        console.log('Mining block...');
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
            // console.log(this.hash);
            process.stdout.write('\r' + this.hash);
            process.stdout.write('\r');
        }
        // print the hash but the 0's in green
        console.log(`Block mined: \x1b[92m${this.hash.substring(0, difficulty)}\x1b[0m${this.hash.substring(difficulty)}`);
        // console.log(`Block mined: ${this.hash}`);
    }
}

module.exports = Block;