require('dotenv').config({ path: '../.env' });
const DatabaseService = require('./../services/DatabaseService')

var db;
const Address = {

    init(app, dbo) {
        db = dbo
        //#region GET 
        app.get('/getAddresses', this.getAddresses);
        app.get('/getAddress/:address', this.getAddress);
        app.get('/getAddressByKey/:key', this.getAddressByKey);
        app.get('/getAddressByUsername/:username', this.getAddressByUsername);
        app.get('/getUsernameByKey/:key', this.getUsernameByKey);
        app.get('/getCountAddress', this.getCountAddress);
        //#endregion

        //#region POST 

        //#endregion

        //#region PUT 

        //#endregion

    },

    //#region GET 
    async getAddresses(req, res) {
        const result = await DatabaseService.getAddresses(db, req.query.page, req.query.pageSize, req.query.orderBy, req.query.orderType);
        return res.send(result);
    },

    async getCountAddress(req, res) {
        var result = await DatabaseService.getCountAddress(db);
        return res.send(result.toString());
    },

    async getAddress(req, res) {
        var result = await DatabaseService.getAddress(db, req.params.address);

        if (!result || result === null) {
            res.status(404)
            return res.send("not found");
        }

        const producer_info = await DatabaseService.getProducerInfo(db, result.address)
        const on_stake = await DatabaseService.getOnStake(db, result.address)

        result.producer_info = producer_info;
        result.on_stake = on_stake.length > 0 ? on_stake[0].sum : 0

        return res.send(result);
    },

    async getAddressByKey(req, res) {
        var result = await DatabaseService.getAddressByKey(db, req.query.page, req.query.pageSize, req.params.key);
        return res.send(result);
    },

    async getAddressByUsername(req, res) {
        var result = await DatabaseService.getAddressByUsername(db, req.params.username);
        if (!result || result.length === 0) {
            res.status(404)
            return res.send("not found")
        }

        const producer_info = await DatabaseService.getProducerInfo(db, result.address)
        const on_stake = await DatabaseService.getOnStake(db, result.address)

        result.producer_info = producer_info;
        result.on_stake = on_stake.length > 0 ? on_stake[0].sum : 0

        return res.send(result);
    },


    async getUsernameByKey(req, res) {
        var result = await DatabaseService.getUsernameByKey(db, req.params.key);
        return res.send(result);
    },
    //#endregion

    //#region POST
    //#endregion
}

module.exports = Address