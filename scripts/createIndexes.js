const dbIndexes = require("../dbIndexes.json")

async function createIndexes(dbo) {
    Object.keys(dbIndexes).map(async key => {

        const collection = key
        const indexes = dbIndexes[key]

        var exist = await dbo.listCollections({ name: collection }).next()

        if (exist === null) return;

        for(let i = 0; i < indexes.length; i++) {
            dbo.collection(collection).createIndex(indexes[i]).then(res => {
                console.log(`CREATE INDEX ${JSON.stringify(indexes[i])} in ${collection}`);
            }).catch(err => {
                console.log(`INDEX EXISTS ${JSON.stringify(indexes[i])} in ${collection}`)
            })
        }
    })
}

module.exports = createIndexes