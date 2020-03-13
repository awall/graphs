import React, {Component} from 'react';
import '../index.css';
import ReactEcharts from "echarts-for-react";

var symbolSize = 20;
var data = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];

class DraggablePoints extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            graphOption:  {
                title: {
                    text: 'Try Dragging these Points'
                },
                tooltip: {
                    triggerOn: 'none',
                    formatter: function (params) {
                        return 'X: ' + params.data[0].toFixed(2) + '<br>Y: ' + params.data[1].toFixed(2);
                    }
                },
                grid: {
                },
                xAxis: {
                    min: -100,
                    max: 80,
                    type: 'value',
                    axisLine: {onZero: false}
                },
                yAxis: {
                    min: -30,
                    max: 60,
                    type: 'value',
                    axisLine: {onZero: false}
                },
                dataZoom: [
                    {
                        type: 'slider',
                        xAxisIndex: 0,
                        filterMode: 'empty'
                    },
                    {
                        type: 'slider',
                        yAxisIndex: 0,
                        filterMode: 'empty'
                    },
                    {
                        type: 'inside',
                        xAxisIndex: 0,
                        filterMode: 'empty'
                    },
                    {
                        type: 'inside',
                        yAxisIndex: 0,
                        filterMode: 'empty'
                    }
                ],
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

export default DraggablePoints;