require('dotenv').config();

var MongoClient = require('mongodb').MongoClient;

function connect () {
    return new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO_URL, function (err, db) {
            if (err) return reject(err);
            var dbo = db.db(process.env.DB_NAME);
            resolve(dbo)
        });
    })
}

module.exports = {
    connect: connect
}


