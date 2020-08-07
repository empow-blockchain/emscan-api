require('dotenv').config({ path: '../.env' });

const base58 = require('bs58');
const empowjs = require('empowjs')
const EmpowService = require('./../services/EmpowService')


function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = {
    randomString: randomString,
    addressToPublicKey(address, type = "string") {
        const addressNoPrefix = address.slice(2, address.length)
        const addressBuffer = base58.decode(addressNoPrefix)
        const addressBufferNoPrefix = addressBuffer.slice(2, addressBuffer.length)
        const publicKey = base58.encode(addressBufferNoPrefix)

        if (type === "string") return publicKey
        if (type === "buffer") return addressBufferNoPrefix
    },

    createEmpowWithPrivateKey(privateKey) {
        const privateKeyBuffer = empowjs.Base58.decode(privateKey)
        const wallet = new empowjs.Wallet(privateKeyBuffer)
        const empow = new empowjs.EMPOW(EmpowService.rpc, wallet)

        return empow
    },

    sendAction(empow, tx) {
        return new Promise((resolve, reject) => {
            tx.addApprove("*", "unlimited")
            const handler = empow.signAndSend(tx)

            handler.on("failed", (error) => {
                reject(error.message ? error.message : error)
            })

            handler.on("success", (res) => {
                resolve(res)
            })
        })
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}