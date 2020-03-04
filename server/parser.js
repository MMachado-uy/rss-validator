const Parser = require('rss-parser');
const rssParser = new Parser();
const axios = require('axios');
const fs = require('fs');
const mi = require('mediainfo-wrapper');
const _get = require('lodash').get;
const path = require('path');

const DOWNLOAD_FOLDER = 'downloads';

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
    width: '',
    height: '',
    resolution: ''
}
const videoMetadata = {
    url: '',
    width: '',
    height: '',
    codec: '',
    fileSize: '',
    extension: '',
    duration: '',
    aspectRatio: '',
    frameRate: '',
    rawMetadata: {},
    readErrors: ''
}

const parser = async feed => {
    try {
        const parsed = await rssParser.parseURL(feed);

        const summary = feedSummary;
        summary.description = parsed.description;
        summary.image = parsed.image.url;
        summary.title = parsed.title;

        while (!!parsed.items.length) {
            console.log('#################################################');
            const item = parsed.items.pop();
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
                        currItem.video = await _getVideoData(currItem.video);
                    }
                    if (typeof element === 'string' && element.match(/.(pn|jp(e)?)g/g)) {
                        currItem.hasImage = true;
                        currItem.image = Object.assign({}, imageMetadata);
                    }
                }
            }
            currItem.rawItem = Object.assign({}, item);

            summary.items.push(currItem);
        }

        return summary;
    } catch (error) {
        console.log("TCL: fetchUrl -> error", error);
        return error;
    }
};

const _getVideoData = async videoItem => {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(DOWNLOAD_FOLDER)) fs.mkdirSync(DOWNLOAD_FOLDER);

        const { url } = videoItem;
        const filename = url.split('/')[url.split('/').length -1];

        const stream = fs.createWriteStream(path.join(DOWNLOAD_FOLDER, filename));

        const video = await axios.get(url, {responseType: 'stream'});
        video.data.pipe(stream);

        stream.on('finish', async () => {
            const data = await mi(path.join(DOWNLOAD_FOLDER, filename));
            
            try {
                for (let i in data) {
                    const metadata = data[i];

                    videoItem.url = url;
                    videoItem.width = _get(metadata, 'video.sampled_width', '');
                    videoItem.height = _get(metadata, 'video.sampled_height', '');
                    videoItem.codec = _get(metadata, 'video.internet_media_type', '');
                    videoItem.fileSize = _get(metadata, 'general.stream_size', '');
                    videoItem.extension = _get(metadata, 'general.file_extension', '');
                    videoItem.duration = _get(metadata, 'general.duration', '');
                    videoItem.aspectRatio = _get(metadata, 'video.display_aspect_ratio', '');
                    videoItem.frameRate = _get(metadata, 'video.frame_rate', '');
                    videoItem.rawMetadata = metadata;
                }
            } catch (e) {
                videoItem.readErrors = e;
            } finally {
                _cleanDownloads(DOWNLOAD_FOLDER);
                resolve(videoItem);
            }
        });
        stream.on('error', (e) => {
            videoItem.readErrors = e;
            reject(videoItem);
        });
    })
}

const _cleanDownloads = (folder) => {
    const files = fs.readdirSync(folder);
    
    for (const file of files) {
        fs.unlinkSync(path.join(folder, file));
    }
}

module.exports = {
    parser
}