const DatabaseService = require('./../services/DatabaseService')
var db;
const Transaction = {

    init(app, dbo) {
        db = dbo

        //#region GET 
        app.get('/getTransactions/:disable_base?', this.getTransactions);
        app.get('/getTransaction/:hash', this.getTransaction);
        app.get('/getCountTransaction', this.getCountTransaction);
        app.get('/getTransactionByFilter/:filter', this.getTransactionByFilter);
         
        //#endregion

        //#region POST 

        //#endregion

        //#region PUT 

        //#endregion

    },

    //#region GET 
    async getTransactions(req, res) {
        const result = await DatabaseService.getTransactions(db, req.query.page, req.query.pageSize, req.query.orderBy, req.query.orderType, req.params.disable_base);
        return res.send(result);
    },

    async getTransaction(req, res) {
        var result = await DatabaseService.getTransaction(db, req.params.hash);
        if (!result || result.length === 0) {
            res.status(404)
            return res.send("not found")
        }
        return res.send(result);
    },

    async getTransactionByFilter(req, res) {
        var result = await DatabaseService.getTransactionByFilter(db, req.params.filter);
        if (!result || result.length === 0) {
            res.status(404)
            return res.send("not found")
        }
        return res.send(result);
    },

    async getCountTransaction(req, res) {
        var result = await DatabaseService.getCountTransaction(db);
        return res.send(result.toString());
    },
    //#endregion
}

module.exports = Transaction