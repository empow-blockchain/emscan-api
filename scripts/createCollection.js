const dbCollections = require("../dbCollections.json")

async function createCollection(dbo) {
    for(let i = 0; i < dbCollections.length; i++) {
        const name = dbCollections[i]
        
        var exist = await dbo.listCollections({ name: name }).next()
        if (exist === null) {
            dbo.createCollection(name)
            console.log("CREATED COLLECTION : " + name)
        } else {
            console.log("COLLECTION EXISTED : " + name)
        }
    }
}

module.exports = createCollection