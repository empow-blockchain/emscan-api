require('dotenv').config({ path: '../.env' });
const EmpowService = require('../services/EmpowService')

const UpdateAddressService = {
    dbo: null,
    queue: [],
    limit: 10,
    checkPoint: {},

    init(dbo) {
        this.dbo = dbo
        const _this = this

        setInterval(() => {
            _this.runQueue()
        }, 1000);
    },

    setQueue(address, symbol = false, profile = false, upsert = false) {
        if (this.checkPoint.hasOwnProperty(address)) return;

        this.queue.push({
            address,
            symbol,
            profile,
            upsert
        })

        console.log("Address queue: " + this.queue.length)

        this.checkPoint[address] = true
    },

    runQueue() {
        const limit = this.queue.length < this.limit ? this.queue.length : this.limit
        const _this = this

        for (let i = 0; i < limit; i++) {
            var obj = this.queue[i]
            this.updateAddress(obj.address, obj.symbol, obj.profile, obj.upsert)
            delete _this.checkPoint[obj.address]
        }

        _this.queue.splice(0, limit)
    },

    async updateAddress(address, symbol = false, profile = false, upsert = false, callback = false) {
        const rpc = EmpowService.rpc
        const _this = this

        if (!symbol) {
            var accountInfo;

            try {
                accountInfo = await rpc.blockchain.getAccountInfo(address, true)
            } catch (e) {
                setTimeout(() => {
                    _this.updateAddress(address, symbol, profile, upsert, callback)
                }, 1000)

                return;
            }

            accountInfo.level = 1

            let username;
            let selected_username;

            try {
                username = await rpc.blockchain.getContractStorage("auth.empow", `u_${address}`, "", true)
                selected_username = await rpc.blockchain.getContractStorage("auth.empow", `s_${address}`, "", true)

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
            } catch (e) {
                console.log(e);
                if(callback) callback()
            }
           
            const collection = this.dbo.collection('addresses');

            const result = await collection.findOne({address: accountInfo.address})
            if(result) upsert = false
            else upsert = true

            collection.updateOne({ address: accountInfo.address }, { $set: accountInfo }, { upsert: upsert }, () => {
                if (callback) callback()
            })

        } else {
            var decimal
            try {
                decimal = await rpc.blockchain.getContractStorage("token.empow", `TI${symbol}`, "decimal", true)
            } catch(e) {
                console.log(e);
                if(callback) callback()
            }
            

            rpc.blockchain.getContractStorage("token.empow", `TB${address}`, symbol, true).then(token => {
                const collection = this.dbo.collection('addresses');
                collection.updateOne({ address: address }, { $set: { [`token.${symbol}`]: token.data / (10 ** decimal.data) } }, { upsert: upsert }, () => {
                    if(callback) callback()
                })
            }).catch(e => {
                console.log(e);
                if(callback) callback()
            })
        }
    }

}

module.exports = UpdateAddressService