require('dotenv').config({ path: '../.env' });
const mongodb = require('../db');
const { default: Axios } = require('axios');
const UpdateAddressService = require("./UpdateAddressService")
let dbo;

async function init () {
    dbo = await mongodb.connect();
    UpdateAddressService.init(dbo)
    run()
}

function run() {
    // clean transaction
    dbo.collection("transactions").find({blockNumber: {$gt: 31197600}}).sort({time: -1}).limit(10000).toArray((err, docs) => {
        if(err) {
            return console.log(err);
        }

        for(let i = 0; i < docs.length; i++) {
            // check transaction
            const hash = docs[i].hash

            Axios.get(`https://node.empow.io/getTxByHash/${hash}`).then(res => {
                console.log("Hash exist: " + hash);
                console.log('Block number: ' + docs[i].blockNumber);
            }).catch(err => {
                console.log("Hash not exist: " + hash);
                console.log('Block number: ' + docs[i].blockNumber);

                dbo.collection("address_transactions").findOne({hash}).then(res => {
                    if(res.actions && res.actions.length > 0 && res.actions[0].action_name === "transfer") {
                        UpdateAddressService.setQueue(res.actions[0].data[1])
                        UpdateAddressService.setQueue(res.actions[0].data[2])
                    }

                    dbo.collection("address_transactions").deleteOne({hash: hash})
                })

                UpdateAddressService.setQueue(docs[i].publisher)
                dbo.collection("transactions").deleteOne({hash})
                console.log('Delete Hash: ' + hash);
            })
        }
    })
}

init()