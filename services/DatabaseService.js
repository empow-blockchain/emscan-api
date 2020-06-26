require('dotenv').config({ path: '../.env' });

const DatabaseService = {
    client: null,

    //#region GET 
    getAddresses(dbo, page = '1', pageSize = '20', orderBy = 'balance', orderType = '-1') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        orderType = parseInt(orderType)
        return new Promise((resolve, reject) => {
            dbo.collection("addresses")
                .find({}, { projection: { _id: 0 } })
                .sort({ [`${orderBy}`]: orderType })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getCountAddress(dbo) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("addresses").find({}, { projection: { _id: 0 } }).count()
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getAddress(dbo, address) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("addresses").findOne({ address: address }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getBlocks(dbo, page = '1', pageSize = '20', orderBy = 'number', orderType = '-1') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        orderType = parseInt(orderType)
        return new Promise((resolve, reject) => {
            dbo.collection("blocks")
                .find({}, { projection: { _id: 0 } })
                .sort({ [`${orderBy}`]: orderType })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })

    },

    getBlock(dbo, number = '0') {
        number = parseInt(number)
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("blocks").findOne({ number: number }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })

    },

    getTransactions(dbo, page = '1', pageSize = '20', orderBy = 'blockNumber', orderType = '-1', disable_base = false) {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        orderType = parseInt(orderType)
        return new Promise((resolve, reject) => {
            if (disable_base) {
                dbo.collection("transactions")
                    .find({}, { projection: { _id: 0 } })
                    .sort({ [`${orderBy}`]: orderType })
                    .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                    .limit(pageSize)
                    .toArray(function (err, docs) {
                        if (err) {
                            reject(err)
                        }
                        resolve(docs);
                    });
            } else {
                dbo.collection("transactions")
                    .find({}, { projection: { _id: 0 } })
                    .sort({ [`${orderBy}`]: orderType })
                    .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                    .limit(pageSize)
                    .toArray(function (err, docs) {
                        if (err) {
                            reject(err)
                        }
                        resolve(docs);
                    });
            }

        })
    },

    getTransaction(dbo, hash) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("transactions").findOne({ hash: hash }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getTransactionByFilter(dbo, filter) {
        var obj = JSON.parse(filter)
        return new Promise((resolve, reject) => {
            dbo.collection("transactions")
                .find(obj, { projection: { _id: 0 } })
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getAddressTransactions(dbo, page = '1', pageSize = '20') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        return new Promise((resolve, reject) => {
            dbo.collection("address_transactions")
                .find({}, { projection: { _id: 0 } })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .sort({ time: -1 })
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getAddressTransaction(dbo, address, page = '1', pageSize = '20') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        return new Promise((resolve, reject) => {
            dbo.collection("address_transactions")
                .find({ address: address }, { projection: { _id: 0 } })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .sort({ time: -1 })
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getProducers(dbo, page = '1', pageSize = '20', orderBy = 'votes', orderType = '-1') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        orderType = parseInt(orderType)
        return new Promise((resolve, reject) => {
            dbo.collection("producers")
                .find({}, { projection: { _id: 0 } })
                .sort({ [`${orderBy}`]: orderType })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });

        })
    },

    getProducer(dbo, address) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("producers").findOne({ address: address }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getAddressByKey(dbo, page = '1', pageSize = '20', key) {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        return new Promise((resolve, reject) => {
            dbo.collection("addresses")
                .find({ selected_username: { '$regex': key }})
                // .find({ $text: { $search: key } })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });

        })
    },

    getAddressTransfer(dbo, address, page = '1', pageSize = '20') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        return new Promise((resolve, reject) => {
            dbo.collection("address_transactions")
                .find({ address: address, [`actions.contract`]: "token.empow", [`actions.action_name`]: "transfer" }, { projection: { _id: 0 } })
                .sort({ time: -1 })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getWitnessInfo(dbo, witness) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("producers").findOne({ pubkey: witness }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getProducerInfo(dbo, address) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("producers").findOne({ address: address }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getOnStake(dbo, address) {
        return new Promise((resolve, reject) => {
            dbo.collection("stakes").aggregate([{ $match: { address: address, unstake: false } }, {
                $group: { _id: null, sum: { $sum: { $toDouble: "$amount" } } }
            }]).toArray(function (err, docs) {
                if (err) {
                    reject(err)
                }
                resolve(docs);
            });
        })
    },

    getBlockProduced(dbo, pubkey) {
        return dbo.collection("blocks").countDocuments({ witness: pubkey })
    },

    getBlockReward(dbo, pubkey) {
        return new Promise((resolve, reject) => {
            dbo.collection("blocks").aggregate([{ $match: { witness: pubkey } }, {
                $group: { _id: null, sum: { $sum: { $toDouble: "$blockReward" } } }
            }]).toArray(function (err, docs) {
                if (err) {
                    reject(err)
                }
                resolve(docs);
            });
        })
    },

    getBlockRewardWithdrawn(dbo, address) {
        return new Promise((resolve, reject) => {
            dbo.collection("transactions").aggregate([
                { $match: { publisher: address, actions: { $elemMatch: { contract: "bonus.empow", action_name: "exchangeEMPOW" } } } },
                { $unwind: "$actions" },
                {
                    $group: { _id: null, sum: { $sum: { $toDouble: { $arrayElemAt: ["$actions.data", 1] } } } }
                }]).toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getTokens(dbo, page = '1', pageSize = '20', orderBy = 'supply', orderType = '-1') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        orderType = parseInt(orderType)
        return new Promise((resolve, reject) => {
            dbo.collection("tokens")
                .find({}, { projection: { _id: 0 } })
                .sort({ [`${orderBy}`]: orderType })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getToken(dbo, symbol) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("tokens").findOne({ symbol: symbol }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getCountTransaction(dbo) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("transactions").find({}, { projection: { _id: 0 } }).count()
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getBlockTransaction(dbo, number) {
        return new Promise((resolve, reject) => {
            dbo.collection("transactions")
                .find({ blockNumber: number }, { projection: { _id: 0 } })
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getStake(dbo, address, page = '1', pageSize = '20', orderBy = 'amount', orderType = '-1') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        orderType = parseInt(orderType)

        return new Promise((resolve, reject) => {
            dbo.collection("stakes")
                .find({ address: address }, { projection: { _id: 0 } })
                .sort({ [`${orderBy}`]: orderType })
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });
        })
    },

    getStakeByPackageId(dbo, address, packageId) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("stakes").findOne({ address: address, packageId: packageId }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getCountProducer(dbo) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("producers").countDocuments({})
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getCountBlock(dbo) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("blocks").countDocuments({})
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getCountStake(dbo, address) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("stakes").countDocuments({ address: address })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getStaking(dbo, address) {
        return new Promise((resolve, reject) => {
            dbo.collection("stakes").aggregate([
                { $match: { address: address, unstake: false } },
                { $group: { _id: null, sum: { $sum: { $toDouble: "$amount" } } } }
            ]).toArray((err, docs) => {
                if (err) {
                    return reject(err)
                }
                resolve(docs)
            })
        })
    },

    getCountAddressTransaction(dbo, address) {
        return dbo.collection("address_transactions").countDocuments({ address: address })
    },

    getAddressByUsername(dbo, username) {
        return new Promise((resolve, reject) => {
            try {
                var result = dbo.collection("addresses").findOne({ ['username']: username }, { projection: { _id: 0 } })
                resolve(result);
            } catch (err) {
                reject(err)
            }
        })
    },

    getUsernameByKey(dbo, key, page = '1', pageSize = '10') {
        page = parseInt(page)
        pageSize = parseInt(pageSize)

        return new Promise((resolve, reject) => {
            dbo.collection("addresses")
                .find({ selected_username: { '$regex': key }})
                .skip(page > 0 ? ((page - 1) * pageSize) : 0)
                .limit(pageSize)
                .toArray(function (err, docs) {
                    if (err) {
                        reject(err)
                    }
                    resolve(docs);
                });

        })
    },

    //#endregion


    //#region UPDATE 
  
    //#endregion
}

module.exports = DatabaseService