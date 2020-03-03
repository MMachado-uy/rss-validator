const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

const Parser = require('rss-parser');
const rssParser = new Parser();

const axios = require('axios');


const fetchUrl = async (checkUrl) => {
    let feed;

    // try {
    //     feed = await axios.get(checkUrl);
    // } catch (error) {
    //     console.log("TCL: App -> checkUrl -> error", error)
    // }

    // try {
    //     console.log('XML2JS=====================================================');
    //     const parsed = await parser.parseStringPromise(feed.data);
    //     console.log(JSON.stringify(parsed, null, 4));
        
    // } catch (error) {
    //     console.log("TCL: fetchUrl -> error", error)
    // }

    try {
        console.log('PARSER=====================================================');
        const parsed = await rssParser.parseURL(checkUrl);

        parsed.items.forEach(item => {
            console.log('>>>');
            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    const element = item[key];
                    console.log(`    >>> ${key}:` , element)
                }
            }
            console.log('>>>');
        });
    } catch (error) {
        console.log("TCL: fetchUrl -> error", error);
    }
}

fetchUrl('http://urbana.uy/feed/podcast/');