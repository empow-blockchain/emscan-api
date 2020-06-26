const EmpowService = require('../services/EmpowService')

async function updateStake(dbo, packageId, address) {
    const rpc = EmpowService.rpc
    var stake = await rpc.blockchain.getContractStorage("stake.empow", `p_${address}_${packageId}`, "", true)
    var obj = JSON.parse(stake.data)
    obj.address = address
    obj.packageId = packageId
    const collection = dbo.collection('stakes');
    collection.updateOne({ address: address, packageId: packageId }, { $set: obj }, { upsert: true })
}

module.exports = updateStake