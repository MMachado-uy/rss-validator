import React from 'react';
import Buscador from '../src/components/Buscador';

import './App.scss';

import axios from 'axios';

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

            feed = await axios.post('http://localhost:8081/parsefeed', {feed: checkUrl});
            feed = feed.data;

            console.dir(feed);
        } catch (error) {
            console.log("TCL: App -> checkUrl -> error", error)
        }
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
