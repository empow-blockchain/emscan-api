require('dotenv').config({ path: '../.env' });
const empowjs = require('empowjs')
const ping = require("ping")

const EmpowService = {
    rpc: null,
    async init() {
        // var ips = process.env.RPC_URL.split(",")

        // var minTime = 99999999
        // var selectHost;
        // for(let i = 0; i < ips.length; i++) {
        //     const result = await ping.promise.probe(ips[i])
    
        //     if(result.time < minTime) {
        //         selectHost = ips[i]
        //         minTime = result.time
        //     }
        // }
       
        this.rpc = new empowjs.RPC(new empowjs.HTTPProvider(`https://node.empow.io`))
    }
}

module.exports = EmpowService