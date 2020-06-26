async function updateAddressTransaction(dbo, address, transaction) {

    var obj = {
        address: address,
        hash: transaction.hash,
        time: transaction.time,
    }

    if(transaction.actions[0].contract === "token.empow" && transaction.actions[0].action_name === "transfer") {
        obj.actions = transaction.actions
    }

    dbo.collection("address_transactions").insertOne(obj, function (err, ress) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = updateAddressTransaction