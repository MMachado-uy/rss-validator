const Parser = require('rss-parser');
const rssParser = new Parser();

const fetchUrl = async (checkUrl) => {
    try {
        console.log('PARSER=====================================================');
        const parsed = await rssParser.parseURL(checkUrl);
        console.log("fetchUrl -> parsed", parsed);

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

fetchUrl('https://feed.cnet.com/feed/podcast/all/hd.xml');