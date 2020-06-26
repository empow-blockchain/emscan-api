const EmpowService = require('../services/EmpowService')

async function updateProducer(dbo, address) {
    const rpc = EmpowService.rpc
    
    rpc.blockchain.getContractStorage("vote_producer.empow", "producerTable", address, true).then(result => {
        result.data = JSON.parse(result.data)
        result.data.address = address

        rpc.blockchain.getContractStorage("vote.empow", "v_1", address, true).then(vote => {
            vote.data = JSON.parse(vote.data)
            var obj = Object.assign(result.data, vote.data)
            const collection = dbo.collection('producers');
            collection.updateOne({ address: address }, { $set: obj }, { upsert: true })
        }).catch(err => {
            console.log(err)
        })
    })
}

module.exports = updateProducer