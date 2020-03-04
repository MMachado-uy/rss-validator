import React from 'react';

import './Buscador.scss';

const Buscador = (props) => {
    const { url } = props;
    
    const inputHandler = evt => {
        props.setUrl(evt.target.value);
    }

    return (
        <div className="Buscador">
            <input 
                type="text" 
                value={url} 
                onChange={evt => inputHandler(evt)}
            />
            <input 
                type="button" 
                value="Check url!" 
                onClick={() => props.checkUrl()}
            />
        </div>
    )
}

export default Buscador;