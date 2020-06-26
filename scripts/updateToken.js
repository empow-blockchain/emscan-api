const EmpowService = require('../services/EmpowService')

async function updateToken(dbo, symbol) {
    const rpc = EmpowService.rpc

    const issuer = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "issuer", true)
    const supply = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "supply", true)
    const totalSupply = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "totalSupply", true)
    const canTransfer = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "canTransfer", true)
    const onlyIssuerCanTransfer = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "onlyIssuerCanTransfer", true)
    const defaultRate = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "defaultRate", true)
    const decimal = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "decimal", true)
    const fullName = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "fullName", true)

    var obj = {
        issuer: issuer.data,
        supply: supply.data / (10 ** decimal.data),
        totalSupply: totalSupply.data / (10 ** decimal.data),
        canTransfer: canTransfer.data === 'true' ? true : false,
        onlyIssuerCanTransfer: onlyIssuerCanTransfer.data === 'true' ? true : false,
        defaultRate: defaultRate.data,
        decimal: decimal.data,
        fullName: fullName.data,
        symbol: symbol
    }

    const collection = dbo.collection('tokens');
    collection.updateOne({ symbol: symbol }, { $set: obj }, { upsert: true })
}

module.exports = updateToken