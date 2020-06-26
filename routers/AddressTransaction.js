const DatabaseService = require('../services/DatabaseService')
var db;
const AddressTransaction = {

    init(app, dbo) {
        db = dbo

        //#region GET 
        app.get('/getAddressTransactions', this.getAddressTransactions);
        app.get('/getAddressTransfer/:address', this.getAddressTransfer);
        app.get('/getAddressTransaction/:address', this.getAddressTransaction);
        app.get('/getCountAddressTransaction/:address', this.getCountAddressTransaction);
        //#endregion

        //#region POST 

        //#endregion

        //#region PUT 

        //#endregion

    },

    //#region GET 
    async getAddressTransactions(req, res) {
        const result = await DatabaseService.getAddressTransactions(db, req.query.page, req.query.pageSize);
        return res.send(result);
    },

    async getAddressTransaction(req, res) {
        const addressTransaction = await DatabaseService.getAddressTransaction(db, req.params.address, req.query.page, req.query.pageSize, req.query.page);
        for (let i = 0; i < addressTransaction.length; i++) {
            const transaction = await DatabaseService.getTransaction(db, addressTransaction[i].hash)
            addressTransaction[i] = Object.assign(addressTransaction[i], transaction)
        }
        return res.send(addressTransaction);
    },

    async getAddressTransfer(req, res) {
        const result = await DatabaseService.getAddressTransfer(db, req.params.address, req.query.page, req.query.pageSize, req.query.page);
        return res.send(result);
    },

    async getCountAddressTransaction(req, res) {
        const result = await DatabaseService.getCountAddressTransaction(db, req.params.address);
        return res.send(result.toString());
    },
    //#endregion
}

module.exports = AddressTransaction