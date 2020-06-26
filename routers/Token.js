const DatabaseService = require('./../services/DatabaseService')

var db;
const Token = {

    init(app, dbo) {
        db = dbo
        //#region GET 
        app.get('/getTokens', this.getTokens);
        app.get('/getToken/:symbol', this.getToken);
        //#endregion

        //#region POST 

        //#endregion

        //#region PUT 

        //#endregion

    },

    //#region GET 
    async getTokens(req, res) {
        const result = await DatabaseService.getTokens(db, req.query.page, req.query.pageSize, req.query.orderBy, req.query.orderType);
        return res.send(result);
    },

    async getToken(req, res) {
        var result = await DatabaseService.getToken(db, req.params.symbol);

        if (!result || result === null) {
            res.status(404)
            return res.send("not found")
        }

        if(req.query.q && result[req.query.q]) {
            return res.send(`${result[req.query.q]}`)
        }
        
        return res.send(result);
    },
    //#endregion
}

module.exports = Token