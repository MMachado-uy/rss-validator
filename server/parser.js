const Parser = require('rss-parser');
const rssParser = new Parser({
    customFields: {
        item: ['media:content', 'media:content.$'],
    }
});

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
    width: '',
    height: '',
    fileSize: '',
    extension: '',
    rawMetadata: {},
    readErrors: ''
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

const parser = feed => {
    return new Promise(async (resolve, reject) => {
        try {
            const parsed = await rssParser.parseURL(feed);
            console.log(JSON.stringify(parsed, null, 4))
    
            const summary = feedSummary;
            summary.description = _get(parsed, 'description', '');
            summary.image = _get(parsed, 'image.url', '');
            summary.title = _get(parsed, 'title', '');
    
            while (!!parsed.items.length) {
                const item = parsed.items.pop();
                let currItem = Object.assign({}, itemSummary);

                currItem = await _loopContents(item, currItem);

                currItem.rawItem = Object.assign({}, item);
    
                summary.items.push(currItem);
            }
    
            resolve(summary);
        } catch (error) {
            console.log("TCL: fetchUrl -> error", error);
            reject(error);
        }
    })
};

const _loopContents = async (item, currItem) => {
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
            if (typeof element === 'string' && element.match(/.(bmp|pn|jp(e)?)g?/gi)) {
                currItem.hasImage = true;
                currItem.image = Object.assign({}, imageMetadata);
                currItem.image.url = element;
                currItem.image = await _getImageData(currItem.image);
            }
        }
    }

    return currItem;
}

const _checkContents = async (item)

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
                    videoItem.width = _get(metadata, 'video[0].sampled_width', '');
                    videoItem.height = _get(metadata, 'video[0].sampled_height', '');
                    videoItem.codec = _get(metadata, 'video[0].internet_media_type', '');
                    videoItem.fileSize = _get(metadata, 'general.stream_size', '');
                    videoItem.extension = _get(metadata, 'general.file_extension', '');
                    videoItem.duration = _get(metadata, 'general.duration', '');
                    videoItem.aspectRatio = _get(metadata, 'video[0].display_aspect_ratio', '');
                    videoItem.frameRate = _get(metadata, 'video[0].frame_rate', '');
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

const _getImageData = async imageItem => {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(DOWNLOAD_FOLDER)) fs.mkdirSync(DOWNLOAD_FOLDER);

        const { url } = imageItem;
        const filename = url.split('/')[url.split('/').length -1];

        const stream = fs.createWriteStream(path.join(DOWNLOAD_FOLDER, filename));

        const video = await axios.get(url, {responseType: 'stream'});
        video.data.pipe(stream);

        stream.on('finish', async () => {
            const data = await mi(path.join(DOWNLOAD_FOLDER, filename));
       
            try {
                for (let i in data) {
                    const metadata = data[i];

                    imageItem.url = url;
                    imageItem.width = _get(metadata, 'other[0].sampled_width', '');
                    imageItem.height = _get(metadata, 'other[0].sampled_height', '');
                    imageItem.fileSize = _get(metadata, 'general.stream_size', '');
                    imageItem.extension = _get(metadata, 'general.file_extension', '');
                    imageItem.rawMetadata = metadata;
                }
            } catch (e) {
                imageItem.readErrors = e;
            } finally {
                _cleanDownloads(DOWNLOAD_FOLDER);
                resolve(imageItem);
            }
        });
        stream.on('error', (e) => {
            imageItem.readErrors = e;
            reject(imageItem);
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