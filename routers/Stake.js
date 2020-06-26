const DatabaseService = require('./../services/DatabaseService')
var db;
const Stake = {

    init(app, dbo) {
        db = dbo

        //#region GET 
        app.get('/getStake/:address', this.getStake);
        app.get('/getStakeByPackageId/:address/:packageId', this.getStake);
        app.get('/getCountStake/:address', this.getCountStake);
        app.get('/getStaking/:address', this.getStaking);
        //#endregion

        //#region POST 

        //#endregion

        //#region PUT 

        //#endregion

    },

    //#region GET 
    async getStake(req, res) {
        const result = await DatabaseService.getStake(db, req.params.address, req.query.page, req.query.pageSize, req.query.orderBy, req.query.orderType);
        return res.send(result);
    },

    async getStakeByPackageId(req, res) {
        const result = await DatabaseService.getStakeByPackageId(db, req.params.address, req.params.packageId);
        return res.send(result);
    },

    async getCountStake(req, res) {
        let result = await DatabaseService.getCountStake(db, req.params.address);
        return res.send(result.toString());
    },

    async getStaking(req,res) {
        let result = await DatabaseService.getStaking(db, req.params.address);

        if(!result || result.length === 0) {
            return res.send("0")
        }

        res.send(result[0].sum.toString())
    }
    //#endregion
}

module.exports = Stake