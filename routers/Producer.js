const DatabaseService = require('../services/DatabaseService')
const ping = require("ping")
var db;
const Producer = {
    init(app, dbo) {
        db = dbo

        //#region GET 
        app.get('/getProducers', this.getProducers);
        app.get('/getProducer/:address', this.getProducer);
        app.get('/getCountProducer', this.getCountProducer);
        app.get('/getBlockRewardWithdrawn/:address', this.getBlockRewardWithdrawn);
        //#endregion

        //#region POST 

        //#endregion

        //#region PUT 

        //#endregion

    },

    //#region GET

    async getProducers(req, res) {
        let result = await DatabaseService.getProducers(db, req.query.page, req.query.pageSize, req.query.orderBy, req.query.orderType);
        return res.send(result);
    },

    async getProducer(req, res) {
        var result = await DatabaseService.getProducer(db, req.params.address);

        if (!result || result === null) {
            res.status(404)
            return res.send("not found")
        }

        const block_produced = await DatabaseService.getBlockProduced(db, result.pubkey);
        result.block_produced = block_produced;

        const block_reward = await DatabaseService.getBlockReward(db, result.pubkey);
        result.block_reward = block_reward.length > 0 ? block_reward[0].sum : 0


        return res.send(result);
    },

    async getCountProducer(req, res) {
        let result = await DatabaseService.getCountProducer(db);
        return res.send(result.toString());
    },

    async getBlockRewardWithdrawn(req, res) {
        let result = await DatabaseService.getBlockRewardWithdrawn(db, req.params.address);

        return res.send(result.length > 0 && result[0].sum ? result[0].sum.toString() : "0");
    },
    //#endregion
}

module.exports = Producer