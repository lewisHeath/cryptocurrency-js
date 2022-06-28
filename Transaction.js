// Transaction for blockchain class

class Transaction {
    constructor(from, to, amount) {
        this.fromAddress = from;
        this.toAddress = to;
        this.amount = amount;
    }
}

module.exports = Transaction;