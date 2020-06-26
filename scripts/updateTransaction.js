function isNotBlockRewardTransaction(transaction) {
    if(transaction.publisher === "base.empow" && transaction.tx_receipt.receipts.length === 1) {
        return false
    }

    return true
}

async function updateTransaction(dbo, block) {
    var transactions = block.transactions

    transactions = transactions.filter(x => isNotBlockRewardTransaction(x))

    if (!transactions || transactions.length === 0) {
        return;
    }
    
    for (let i = 0; i < transactions.length; i++) {
        transactions[i].blockNumber = block.number
        for (let j = 0; j < transactions[i].actions.length; j++) {
            transactions[i].actions[j].data = JSON.parse(transactions[i].actions[j].data)
        }

        for (let z = 0; z < transactions[i].tx_receipt.receipts.length; z++) {
            transactions[i].tx_receipt.receipts[z].content = JSON.parse(transactions[i].tx_receipt.receipts[z].content)
        }
    }

    dbo.collection("transactions").insertMany(transactions, { checkKeys: false }, async function (err, ress) {
        if (err) {
            console.log(err);
        }
    });

}

module.exports = updateTransaction