require('dotenv').config({ path: '../.env' });
const mongodb = require('../db')
const updateTransaction = require('./updateTransaction')
const updateAddressTransaction = require('./updateAddressTransaction')
const updateProducer = require('./updateProducer')
const updateToken = require('./updateToken')
const updateStake = require('./updateStake')
const socket = require('./socket')

const UpdateAddressService = require('./UpdateAddressService')
const createCollection = require('./createCollection')
const createIndexes = require('./createIndexes')

const EmpowService = require('../services/EmpowService')

const Utils = require('./utils');

var head_block = 2;
var currentBlock = -1;
var timeExpri = 2 * 24 * 60 * 60 * 1000; // 2 days
var dbo;
var rpc;
async function init() {
  
    await EmpowService.init()
    rpc = EmpowService.rpc
    dbo = await mongodb.connect();
    UpdateAddressService.init(dbo)
    run()
}

async function run() {
    try {
        currentBlock = await getCurrentBlock();
        head_block = await getChainInfo()
        getBlockByNum()
    } catch (ex) {
        console.log(ex)
    }
}

async function getBlockByNum() {
    if (currentBlock <= head_block) {
        rpc.blockchain.getBlockByNum(currentBlock + 1, true).then(res => {

            var block = res.block;

            block.number = parseInt(block.number);
            block.status = res.status;
            var blockTime = block.time / 10**6

            console.log(new Date(blockTime));
            
            if(block.status !== "IRREVERSIBLE" || blockTime + timeExpri < new Date().getTime() ) {
                return getBlockByNum()
            }

            console.log("Block: " + block.number + " - transaction: " + block.transactions.length)

            updateTransaction(dbo, block)

            var transactions = block.transactions

            transactions.forEach(transaction => {
                transaction.tx_receipt.receipts.forEach(receipt => {
                    if (receipt.func_name === "gas.empow/pledge") {
                        receiptsGas(receipt, transaction.publisher)
                    }

                    if (receipt.func_name === "token.empow/transfer") {
                        receiptsRam(receipt, transaction.publisher)
                        receiptsEM(receipt, transaction)
                        receiptsSymbol(receipt, transaction)
                    }

                    if (receipt.func_name === "auth.empow/signUp") {
                        receiptsSignUp(receipt)
                    }

                    if (receipt.func_name === "vote_producer.empow/applyRegister"
                        || receipt.func_name === "vote_producer.empow/applyUnregister"
                        || receipt.func_name === "vote_producer.empow/approveRegister"
                        || receipt.func_name === "vote_producer.empow/approveUnregister"
                        || receipt.func_name === "vote_producer.empow/forceUnregister"
                        || receipt.func_name === "vote_producer.empow/updateProducer"
                        || receipt.func_name === "vote_producer.empow/logInProducer"
                        || receipt.func_name === "vote_producer.empow/logOutProducer") {
                        receiptsProducer(receipt, 0)
                    }

                    if (receipt.func_name === "vote_producer.empow/vote" || receipt.func_name === "vote_producer.empow/unvote") {
                        receiptsProducer( receipt, 1)
                    }

                    if (receipt.func_name === "token.empow/create") {
                        receiptsCreate(receipt)
                    }

                    if (receipt.func_name === "token.empow/issue") {
                        receiptsIssue(receipt)
                    }

                    if (receipt.func_name === "stake.empow/stake" || receipt.func_name === "stake.empow/withdraw" || receipt.func_name === "stake.empow/unstake") {
                        receiptsStake(receipt)
                    }

                    if (receipt.func_name === "token.empow/transferFreeze") {
                        receiptsTransferFreeze(receipt)
                    }
            
                    if (receipt.func_name === "auth.empow/addNormalUsername"
                        || receipt.func_name === "auth.empow/addPremiumUsername"
                        || receipt.func_name === "auth.empow/selectUsername") {
                        receiptsUsername(receipt)
                    }
                    
                    if (receipt.func_name === "social.empow/likeWithdraw") {
                        UpdateAddressService.setQueue(receipt.content[0])
                    }

                    if (receipt.func_name === "social.empow/blockContent") {
                        UpdateAddressService.setQueue(receipt.content[0])
                    }

                    if (receipt.func_name === "social.empow/likeCommentWithdraw") {
                        UpdateAddressService.setQueue(receipt.content[0])
                    }

                    if (receipt.func_name === "social.empow/updateProfile") {
                        receiptsUpdateProfile(receipt)
                    }

                });

                if (Utils.isAddress(transaction.publisher)) {
                    updateAddressTransaction(dbo, transaction.publisher, transaction)
                    UpdateAddressService.setQueue(transaction.publisher)
                }

                if (transaction.publisher === "base.empow") {
                    for (let i = 0; i < transaction.tx_receipt.receipts.length; i++) {
                        let content = typeof transaction.tx_receipt.receipts[i].content === "string" ? JSON.parse(transaction.tx_receipt.receipts[i].content) : transaction.tx_receipt.receipts[i].content

                        if (content[0] === "contribute") {
                            block.blockReward = content[2]
                            break;
                        }

                    }
                }
            });

            socket.emitNewBlock(block);
            delete block.transactions

            // #region insert Block 
            dbo.collection("blocks").insertOne(block, async function (err, ress) {
                if (err) {
                    console.log(err);
                    return;
                };
                currentBlock++;
                if (currentBlock === head_block) {
                    head_block = await getChainInfo()
                }

                getBlockByNum()
            });
            //#endregion

        }).catch(async err => {
            setTimeout(async () => {
                head_block = await getChainInfo()
                getBlockByNum()
            }, 500);
        })
    } else {
        head_block = await getChainInfo()
        getBlockByNum()
    }

}

function getCurrentBlock() {
    return new Promise((resolve, reject) => {
        const collection = dbo.collection('blocks');
        collection.find().sort({ number: -1 }).limit(1).toArray(function (err, docs) {
            if (docs && docs.length > 0) {
                resolve(docs[0].number);
            }

            resolve(-1);
        });
    })

}

function getChainInfo() {
    return new Promise((resolve, reject) => {
        rpc.blockchain.getChainInfo().then(res => {
            resolve(parseInt(res.head_block))
        })
    })
}

function receiptsUpdateProfile(receiptsUpdateProfile) {
    var content = receiptsUpdateProfile.content;
    if (Utils.isAddress(content[0])) {
        UpdateAddressService.setQueue(content[0], false, true)
    }
}

function receiptsGas(receiptsGas, publisher) {
    var content = receiptsGas.content
    if (content[1] !== publisher && Utils.isAddress(content[1])) {
        UpdateAddressService.setQueue(content[1])
    }
}

function receiptsRam(receiptsRam, publisher) {
    var content = receiptsRam.content
    if (content[0] !== 'ram') {
        return;
    }

    if (content[2] !== publisher && Utils.isAddress(content[2])) {
        UpdateAddressService.setQueue(content[2])
    }
}

function receiptsSignUp(receiptsSignUp) {
    var address = receiptsSignUp.content[0];
    if (Utils.isAddress(address)) {
        UpdateAddressService.setQueue(address)
    }
}

function receiptsEM(receiptsEM, transaction) {
    var content = receiptsEM.content
    if (content[0] !== 'em') {
        return;
    }

    if (Utils.isAddress(content[2]) && content[2] !== transaction.publisher) {
        updateAddressTransaction(dbo, content[2], transaction)
        UpdateAddressService.setQueue(content[2])
    }
}

function receiptsSymbol(receiptsSymbol, transaction) {
    var content = receiptsSymbol.content
    if (content[0] === 'em' || content[0] === 'ram') {
        return;
    }

    if (Utils.isAddress(content[1])) {
        UpdateAddressService.setQueue(content[1], content[0])
    }

    if (Utils.isAddress(content[2])) {
        UpdateAddressService.setQueue(content[2], content[0])
        updateAddressTransaction(dbo, content[2], transaction)
    }
}

function receiptsProducer(receiptsProducer, index) {
    var address = receiptsProducer.content[index];
    updateProducer(dbo, address)
}

function receiptsCreate(receiptsCreate) {
    var symbol = receiptsCreate.content[0];
    updateToken(dbo, symbol)
}

function receiptsIssue(receiptsCreate) {
    var content = receiptsCreate.content;
    if (Utils.isAddress(content[1])) {
        UpdateAddressService.setQueue(content[1], content[0])
    }

    updateToken(dbo, content[0])
}

function receiptsStake(receiptsStake) {
    var content = receiptsStake.content;
    updateStake(dbo, parseInt(content[2]), content[0])
}

function receiptsTransferFreeze(receiptsEM) {
    var content = receiptsEM.content
    if (content[0] !== 'em') {
        return;
    }

    if (Utils.isAddress(content[2])) {
        UpdateAddressService.setQueue(content[2])
    }
}

function receiptsUsername(receiptsUsername) {
    var content = receiptsUsername.content;
    if (Utils.isAddress(content[0])) {
        UpdateAddressService.setQueue(content[0], false, false)
    }
}

init()