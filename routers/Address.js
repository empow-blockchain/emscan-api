require('dotenv').config({ path: '../.env' });
const DatabaseService = require('./../services/DatabaseService')
const { createEmpowWithPrivateKey, sendAction } = require("../utils/index")
const UpdateAddressService = require('../scripts/UpdateAddressService')
var db;
var request = require('request');
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
        app.post('/activeAddress', this.activeAddress);
        app.post('/updateAddress', this.updateAddress);
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
    async activeAddress(req, res) {
        request({
            url: 'https://www.google.com/recaptcha/api/siteverify',
            method: 'POST',
            form: {
                secret: process.env.RECAPTCHA_SECRET,
                response: req.body.response
            }
        }, async function (error, response, body) {
            try {
                body = JSON.parse(body);
            } catch (err) {
                body = {};
            }

            if (!error && response.statusCode == 200 && body.success) {

                const result = await DatabaseService.getAddress(db, req.body.myAddress);
                if (result) return res.status(500).send("address exist")

                const empow = createEmpowWithPrivateKey(process.env.PRIVATEKEY_EM)
                const tx = empow.callABI("token.empow", "transfer", ["em", empow.wallet.address, req.body.myAddress, '0.00000001', 'active wallet'])
                sendAction(empow, tx).catch(err => res.status(500).send(err + ""))

                Address.checkAddressExist(req.body.myAddress, () => {
                    res.send({ success: true })
                })
            } else {
                res.status(500).send("Please check to captcha")
            }
        });
    },

    updateAddress(req, res) {
      
        UpdateAddressService.updateAddress(req.body.address)
        res.send({ success: true })
    },

    //#endregion

    async checkAddressExist(address, callback, loopTime = 1000, countLoop = 1, limitLoop = 5) {
        var result = await DatabaseService.getAddress(db, address);
        if (result) return callback(true)

        if (countLoop > limitLoop) return callback(false)
        setTimeout(() => {
            Address.checkAddressExist(address, callback, loopTime, countLoop + 1, limitLoop)
        }, loopTime)
    }
}

module.exports = Address