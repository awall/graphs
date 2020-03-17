import React, {Component} from 'react';
import '../index.css';
import ReactEcharts from "echarts-for-react";
import echarts from 'echarts'

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
        
        //kind of really awkward, but it works.
        window.addEventListener('resize', this.updatePosition);
        
        this.echartsInstance.on('dataZoom', this.updatePosition);

        //I DID IT!
        let that = this;
        
        setTimeout(function () {
            
            // Add shadow circles (which is not visible) to enable drag.
            that.echartsInstance.setOption({
                graphic: echarts.util.map(data, function (item, dataIndex) {
                    return {
                        type: 'circle',
                        position: that.echartsInstance.convertToPixel('grid', item),
                        shape: {
                            cx: 0,
                            cy: 0,
                            r: symbolSize / 2
                        },
                        invisible: true,
                        draggable: true,
                        ondrag: echarts.util.curry(that.onPointDragging, dataIndex, that.echartsInstance),
                        onmousemove: echarts.util.curry(that.showTooltip, dataIndex, that.echartsInstance),
                        onmouseout: echarts.util.curry(that.hideTooltip, dataIndex, that.echartsInstance),
                        z: 100
                    };
                })
            });
        }, 0);
    }

    updatePosition() {
        this.echartsInstance.setOption({
            graphic: echarts.util.map(data, function (item, dataIndex) {
                return {
                    position: this.echartsInstance.convertToPixel('grid', item)
                };
            })
        });
    }

    showTooltip(dataIndex, instance) {
        instance.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: dataIndex
        });
    }

    hideTooltip(dataIndex, instance) {
        instance.dispatchAction({
            type: 'hideTip'
        });
    }

    onPointDragging(dataIndex, instance, dx, dy) {
        data[dataIndex] = instance.convertFromPixel('grid', this.position);

        // Update data
        instance.setOption({
            series: [{
                id: 'a',
                data: data
            }]
        });
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