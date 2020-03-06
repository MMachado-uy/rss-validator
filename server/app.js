require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const { parser } = require('./parser');

let parsedFeed = {};

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

    parsedFeed[feed] = { status: 'pending', feed: {} };
    parser(feed).then(res => {
        parsedFeed[feed].feed = res;
        parsedFeed[feed].status = 'done';
    })

    console.log("parsedFeed", parsedFeed)
    res.send(feed);
})

app.post('/anynews', async (req, res) => {
    const { ticket } = req.body;
    let response = 'pending';

    if (parsedFeed[ticket].status === 'pending') {
        response = 'pending';
    } else if (parsedFeed[ticket].status === 'done') {
        response = parsedFeed[ticket];
    }

    res.send(response);
})

const REST_PORT = 8081;// process.env.REST_PORT;
app.listen(REST_PORT, () => console.log("Ready listening on port " + REST_PORT));