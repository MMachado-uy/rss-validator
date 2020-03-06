import React from 'react';
import Buscador from '../src/components/Buscador';

import './App.scss';

import axios from './util/axios-instance';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            checkUrl: '',
            ticket: '',
            timer: '',
            parsedFeed: {}
        }
    }

    setUrl(url) {
        this.setState({
            checkUrl: url
        });
    }

    startAsking() {
        const { ticket } = this.state;

        if (!!ticket) {
            let timer = setInterval(async () => {
                console.log('...asking for news');

                const res = await axios.post('http://localhost:8081/anynews', {ticket});

                if (res.data !== 'pending') {
                    console.log("App -> timer -> res.data", res.data)
                    console.log('Done!');

                    const { timer } = this.state;
                    clearInterval(timer);

                    this.setState({
                        timer: '',
                        parsedFeed: res.data
                    })
                } else {
                    console.log('maybe next time');
                }
            }, 10000);

            this.setState({timer});
        }
    }

    async checkUrl() {
        const { checkUrl } = this.state;
        let ticket;

        try {

            ticket = await axios.post('http://localhost:8081/parsefeed', {feed: checkUrl});
            console.log("App -> checkUrl -> ticket", ticket)

            if (ticket.status === 200) {
                ticket = ticket.data;
    
                this.setState({
                    ticket
                }, () => this.startAsking())
                console.dir(ticket);
            }
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
