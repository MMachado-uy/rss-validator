const Parser = require('rss-parser');
const rssParser = new Parser();
const axios = require('axios');
const fs = require('fs');

const feedSummary = {
    image: '',
    title: '',
    description: '',
    items: []
}
const itemSummary = {
    title: '',
    hasTitle: false,
    content: '',
    hasContent: false,
    image: {},
    hasImage: false,
    video: {},
    hasVideo: false,
    rawItem: {}
}
const imageMetadata = {
    url: '',
    alt: '',
    xSize: '',
    ySize: '',
    resolution: ''
}
const videoMetadata = {
    url: '',
    xSize: '',
    ySize: ''
}

const parser = async feed => {
    try {
        const parsed = await rssParser.parseURL(feed);

        const summary = feedSummary;
        summary.description = parsed.description;
        summary.image = parsed.image.url;
        summary.title = parsed.title;

        parsed.items.forEach(item => {
            const currItem = Object.assign({}, itemSummary);

            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    const element = item[key];
                    
                    if (key === 'title') {
                        currItem.hasTitle = true;
                        currItem.title = element;
                    }
                    if (key === 'content') {
                        currItem.hasContent = true;
                        currItem.content = element;
                    }
                    if (typeof element === 'string' && element.match(/.mp4/g)) {
                        currItem.hasVideo = true;
                        currItem.video = Object.assign({}, videoMetadata);
                        currItem.video.url = element;
                        currItem.video = _getVideoData(currItem.video);
                    }
                    if (typeof element === 'string' && element.match(/.(pn|jp(e)?)g/g)) {
                        currItem.hasImage = true;
                        currItem.image = Object.assign({}, imageMetadata);
                    }
                }
            }
            currItem.rawItem = Object.assign({}, item);

            summary.items.push(currItem);
        });

        return summary;
    } catch (error) {
        console.log("TCL: fetchUrl -> error", error);
    }
};

const _getVideoData = async videoItem => {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync('./downloads')) fs.mkdirSync('./downloads');

        const { url } = videoItem;
        const filename = url.split('/')[url.split('/').length -1];

        const stream = fs.createWriteStream(filename);

        const response = await axios.get(url, {responseType: 'stream'});
        response.data.pipe(stream);

        stream.on('finish', () => {
            
            resolve(episodePath)
        });
        stream.on('error', reject('downloadEpisode', `Unable to download episode\nEpisode url: ${episodeUrl}`));
    })
    //return videoItem;
}

module.exports = {
    parser
}