require('dotenv').config({ path: '../.env' });
const EmpowService = require('../services/EmpowService')

async function updateAddress(dbo, address, symbol = false, profile = false, upsert = false) {
    const rpc = EmpowService.rpc

    if (!symbol) {
        var accountInfo;

        try {
            accountInfo = await rpc.blockchain.getAccountInfo(address, true)
        } catch (e) {
            setTimeout(() => {
                updateAddress(dbo, address, symbol, profile, upsert)
            }, 1000)

            return;
        }

        accountInfo.level = 1

        var username = await rpc.blockchain.getContractStorage("auth.empow", `u_${address}`, "", true)
        var selected_username = await rpc.blockchain.getContractStorage("auth.empow", `s_${address}`, "", true)
        accountInfo.username = JSON.parse(username.data);
        if (selected_username.data !== "null") {
            accountInfo.selected_username = selected_username.data;
        }

        if (profile) {
            pro5 = await rpc.blockchain.getContractStorage("social.empow", `u_${address}`, "", true)
            if (pro5) {
                accountInfo.profile = JSON.parse(pro5.data)
                accountInfo.resizeAvatar = false
            }
        }

        let blockContent = await rpc.blockchain.getContractStorage("social.empow", `bt_${address}`, "", true)

        if (blockContent.data !== "null") {
            accountInfo.blockContent = JSON.parse(blockContent.data)
        }

        const collection = dbo.collection('addresses');
        collection.updateOne({ address: accountInfo.address }, { $set: accountInfo }, { upsert: upsert })
    } else {
        const decimal = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "decimal", true)

        rpc.blockchain.getContractStorage("token.empow", `TB${address}`, symbol, true).then(token => {
            const collection = dbo.collection('addresses');
            collection.updateOne({ address: address }, { $set: { [`token.${symbol}`]: token.data / (10 ** decimal.data) } }, { upsert: upsert })
        })
    }
}

module.exports = updateAddress