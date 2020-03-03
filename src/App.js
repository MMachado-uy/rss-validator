import React from 'react';
import Buscador from '../src/components/Buscador';

import './App.scss';

import RSSParser from 'rss-parser';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            checkUrl: ''
        }
    }

    setUrl(url) {
        this.setState({
            checkUrl: url
        });
    }

    async checkUrl() {
        const { checkUrl } = this.state;
        let feed;

        try {

            const parser = new RSSParser();
            feed = await parser.parseURL(checkUrl)

            console.dir(feed);

            // const config = {
            //     headers: {'Access-Control-Allow-Origin': '*'}
            // };
            // feed = await axios.get(checkUrl, config);
        } catch (error) {
            console.log("TCL: App -> checkUrl -> error", error)
        }

        // try {
        //     const parsed = await parseString.parseStringPromise(feed);
        //     console.log('Done');
            
        // } catch (error) {
        //     console.log("TCL: App -> checkUrl -> error", error);
        // }
    }

    render() {
        const { checkUrl : url } = this.state;

        return (
            <div className="App" >
                <Buscador 
                    setUrl={url => this.setUrl(url)} 
                    url={url} 
                    checkUrl={() => this.checkUrl()}
                /> 
            </div>
        );
    }
}

export default App;
