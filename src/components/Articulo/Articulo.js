import React from 'react';
import Diff from '../Diff';
import { HighlightConsumer } from '../../App';

import Highlighter from "react-highlight-words";

import { COMPARADAS } from '../../comparadas';
import './Articulo.scss';

class Articulo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            comparaCon: COMPARADAS[`Art${this.props.contenido.n}`],
            comparando: false
        }
    }

    toggleCompare() {
        this.setState({
            comparando: !this.state.comparando
        })
    }

    render() {
        const { contenido } = this.props;
        const { n: numero, t: texto } = contenido;
        const { comparando, comparaCon } = this.state;

        const puedeComparar = comparaCon !== undefined;

        return (
            <div className="Articulo" >
                {comparando ?
                    <div>
                        <span className="artNum">
                            Articulo {numero}.
                            {puedeComparar && <span className="toggle" onClick={() => this.toggleCompare()}> (Atrás)</span>}
                        </span>
                        <Diff luc={texto} original={comparaCon} />
                    </div>
                    :
                    <p id={`articulo-${numero}`}>
                        <span className="artNum">
                            Articulo {numero}.
                            {puedeComparar && <span className="toggle" onClick={() => this.toggleCompare()}> (Comparar)</span>}
                        </span>
                        <HighlightConsumer>
                            {context => <Highlighter
                                highlightClassName="resaltado"
                                searchWords={[context.resaltar]}
                                autoEscape={true}
                                textToHighlight={texto}
                            />}
                        </HighlightConsumer>
                    </p>
                }
            </div>
        )
    }
}

export default Articulo;