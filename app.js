require('dotenv').config();
const express = require('express')
const app = express();
const PORT = 5000

const mongodb = require('./db')

const Address = require('./routers/Address');
const Block = require('./routers/Block');
const Transaction = require('./routers/Transaction');
const AddressTransaction = require('./routers/AddressTransaction')
const Producer = require('./routers/Producer')
const Token = require('./routers/Token')
const Stake = require('./routers/Stake')

const EmpowService = require("./services/EmpowService")
const UpdateAddressService = require("./scripts/UpdateAddressService")

const bodyParser = require("body-parser");
const mkdirp = require('mkdirp');
const cors = require('cors');

mkdirp('./uploads')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.options('*', cors())

const init = async () => {
    const dbo = await mongodb.connect();
    Address.init(app, dbo);
    Block.init(app, dbo);
    Transaction.init(app, dbo);
    AddressTransaction.init(app, dbo)
    Producer.init(app, dbo)
    Token.init(app, dbo)
    Stake.init(app, dbo)

    // init services
    UpdateAddressService.init(dbo)
    EmpowService.init()

    app.get('/', (req, res) => {
        return res.send('test 13');
    });

    app.listen(PORT, () =>
        console.log(`Example app listening on port ${PORT}!`),
    );
}

init()