require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const { parser } = require('./parser');

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

const app = express();

app.use(compression());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.post('/parsefeed', async (req, res) => {
    const { feed } = req.body;
    console.log("parser", parser);
    const parsefeed = await parser(feed);

    console.log(req.body);

    res.send(parsefeed);
})

const REST_PORT = 8081;// process.env.REST_PORT;
app.listen(REST_PORT, () => console.log("Ready listening on port " + REST_PORT));