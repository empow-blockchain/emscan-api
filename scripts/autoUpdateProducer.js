require('dotenv').config({ path: '../.env' });
const mongodb = require('../db')
const DatabaseService = require('../services/DatabaseService')

async function init () {
    const dbo = await mongodb.connect();
    run(dbo)
}

init()

async function run(dbo) {
    try {
        listProducers = await getProducers(dbo)

        for(let i = 0; i < listProducers.length; i++) {
        	listProducers[i].block_produced = await DatabaseService.getBlockProduced(dbo, listProducers[i].pubkey);
        	var block_reward = await DatabaseService.getBlockReward(dbo, listProducers[i].pubkey);
            listProducers[i].block_reward = block_reward.length > 0 ? block_reward[0].sum : 0
            updateProducer(listProducers[i], dbo)
            console.log(`Updated ${listProducers[i].pubkey}`);
        }

        setTimeout(() => {
            run(dbo)
        }, 10 * 60 * 1000);

    } catch (ex) {
        console.log(ex)
    }
}

function getProducers(dbo) {
    return new Promise((resolve, reject) => {
        dbo.collection("producers")
            .find({}, { projection: { _id: 0 } })
            .toArray(function (err, docs) {
                if (err) {
                    reject(err)
                }
                resolve(docs);
            });

    })
}

function updateProducer(producer, dbo) {
    const collection = dbo.collection('producers');
    collection.updateOne({ address: producer.address }, { $set: producer }, { upsert: true })
}