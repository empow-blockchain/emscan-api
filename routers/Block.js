const DatabaseService = require('./../services/DatabaseService')
var db;
const Block = {

    init(app, dbo) {
        db = dbo

        //#region GET 
        app.get('/getBlocks', this.getBlocks);
        app.get('/getBlock/:number', this.getBlock);
        app.get('/getCountBlock', this.getCountBlock);
        //#endregion

        //#region POST 

        //#endregion

        //#region PUT 

        //#endregion

    },

    //#region GET 
    async getBlocks(req, res) {
        const result = await DatabaseService.getBlocks(db, req.query.page, req.query.pageSize, req.query.orderBy, req.query.orderType);
        return res.send(result);
    },

    async getBlock(req, res) {
        var result = await DatabaseService.getBlock(db, req.params.number);
        if (!result || result === null) {
            res.status(404)
            return res.send("not found")
        } else {
            const witness_info = await DatabaseService.getWitnessInfo(db, result.witness);
            result.witness_info = witness_info;
            if (req.query.getTransaction) {
                const transactions = await DatabaseService.getBlockTransaction(db,result.number)
                result.transactions = transactions
            }

        }
        return res.send(result);
    },

    async getCountBlock(req, res) {
        let result = await DatabaseService.getCountBlock(db);
        return res.send(result.toString());
    },
    //#endregion
}

module.exports = Block