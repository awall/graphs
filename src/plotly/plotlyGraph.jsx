import React from "react";
import Plot from 'react-plotly.js'

export default class PlotlyGraph extends React.Component{
    
    render() {
        return <Plot style={{display: "none !important"}} 
            data={[
                {
                    x: [1, 2, 3],
                    y: [2, 6, 3],
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                },
                {type: 'bar', 
                    x: [1, 2, 3], 
                    y: [2, 5, 3]
                },
                {type: 'line',
                    x: [1, 5, 8],
                    y: [2, 10, 12]
                }
            ]}
            layout={ {width: 640, height: 480, title: 'A Fancy Plot'} }
        />
    }
}