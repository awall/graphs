import React, {Component} from 'react';
import '../index.css';
import ReactEcharts from "echarts-for-react";

var symbolSize = 20;
var data = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];

class App extends Component {
    
    constructor(props, context) {
        super(props, context);

        this.state = {
            graphOption:  {
                title: {
                    text: 'Click to Add Points'
                },
                tooltip: {
                    formatter: function (params) {
                        var data = params.data || [0, 0];
                        return data[0].toFixed(2) + ', ' + data[1].toFixed(2);
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    min: -60,
                    max: 20,
                    type: 'value',
                    axisLine: {onZero: false}
                },
                yAxis: {
                    min: 0,
                    max: 40,
                    type: 'value',
                    axisLine: {onZero: false}
                },
                series: [
                    {
                        id: 'a',
                        type: 'line',
                        smooth: true,
                        symbolSize: symbolSize,
                        data: data
                    }
                ]
            }
        }
    }

    componentDidMount() {
        this.echartsInstance = this.echartsReactRef.getEchartsInstance(); //What a stupid call....
        this.zr = this.echartsInstance.getZr();

        this.zr.on('click', this.onChartClick);
        this.zr.on('mouseMove', this.onMouseMove);
    }

    onMouseMove = (params) => {
        let pointInPixel = [params.offsetX, params.offsetY];
        this.zr.setCursorStyle(this.echartsInstance.containPixel('grid', pointInPixel) ? 'copy' : 'default');
    };
    
    onChartClick = (params) => {
        
        let pointInPixel = [params.offsetX, params.offsetY];
        let pointInGrid = this.echartsInstance.convertFromPixel('grid', pointInPixel);

        if (this.echartsInstance.containPixel('grid', pointInPixel)) {
            data.push(pointInGrid);

            this.echartsInstance.setOption({
                series: [{
                    id: 'a',
                    data: data
                }]
            });
        }
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">

                    <ReactEcharts
                        style={{height: '100vh', width: '100vw'}}
                        ref={(e) => {this.echartsReactRef = e;}}
                        option={this.state.graphOption}
                    />
                </header>
            </div>
        );
    }
}

export default App;