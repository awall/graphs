import React from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

require("highcharts/modules/draggable-points")(Highcharts);

export const HighChartsGraph = (props : HighchartsReact.Props) => {
    
    //const [data, setData] = React.useState([1,2,3]);
    
    const options = {
        chart: {
            animation: false
        },

        title: {
            text: 'Highcharts draggable points demo'
        },

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                'Sep', 'Oct', 'Nov', 'Dec'],
        },

        yAxis: [{
            softMin: -200,
            softMax: 400
        }],

        plotOptions: {
            series: {
                stickyTracking: false,
                dragDrop: {
                    draggableY: true
                }
            },
            line: {
                cursor: 'ns-resize'
            }
        },

        tooltip: {
            valueDecimals: 2
        },

        series: [{
            data: [0, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1,
                95.6, 54.4]
        }],
    };
    
    return <div>
            <HighchartsReact highcharts={Highcharts} options={options} {...props}>
            </HighchartsReact>
        </div>
};
    


