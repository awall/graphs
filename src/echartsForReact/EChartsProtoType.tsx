import * as React from 'react';
import ReactEcharts from 'echarts-for-react';

// @ts-ignore
import echarts from 'echarts';
import {AppState} from "../AppState";
import {useEffect} from "react";

interface Props {
    appState: AppState
}

export const EchartsProtoType = (props: Props) => {

    const echartsRef = React.useRef(null);

    const init = {
        animation: false,
        grid: [
            {
                left: '10%',
                right: '8%',
                bottom: '20%',
                height: '30%'
            },
            {
                left: '10%',
                right: '8%',
                height: '30%'
            }
        ],
        xAxis: [
            {
                type: 'time',
                gridIndex: 0,
                axisPointer: {
                    label: {
                        formatter: function (params: any) {
                            var seriesValue = (params.seriesData[0] || {}).value;
                            return params.value
                                + (seriesValue !== null
                                        ? '\n' + echarts.format.addCommas(seriesValue)
                                        : ''
                                );
                        }
                    }
                }
            },
            {
                type: 'time',
                gridIndex: 1,
                axisTick: {show: true,},
                axisLabel: {show: true},
            }
        ],
        yAxis: [
            {
                id: props.appState.streams.oil.name,
                type: 'value',
                name: props.appState.streams.oil.unit,
                position: 'left',
                axisLine: {
                    lineStyle: {
                        color: 'Green'
                    }
                },
                gridIndex: 0,
            },
            {
                type: 'value',
                name: props.appState.streams.gas.unit,
                position: 'left',
                axisLine: {
                    lineStyle: {
                        show: false,
                        color: 'Red'
                    }
                },
                offset: 80,
                splitLine: {
                    show: false,
                },

                gridIndex: 0,

            },
            {
                type: 'value',
                name: props.appState.streams.water.unit,
                position: 'right',
                axisLine: {
                    lineStyle: {
                        color: 'Blue'
                    }
                },
                splitLine: {
                    show: false,
                },
                gridIndex: 0,
                offset: 45,
            },
            {
                type: 'value',
                name: props.appState.streams.downtime.unit,
                position: 'right',
                axisLine: {
                    lineStyle: {
                        color: 'Black'
                    }
                },
                splitLine: {
                    show: false,
                },
                offset: 45,
                gridIndex: 1,
            },
        ],
        legend: {
            show: true,
            left: '1%',
            top: '15.0%',
            orient: 'vertical',
            data: ['gas', 'water', 'oil', 'downtime']
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                animation: false,
                label: {
                    backgroundColor: '#ccc',
                    borderColor: '#aaa',
                    borderWidth: 1,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,

                    color: '#222'
                },
            },
        },
        axisPointer: {
            link: {xAxisIndex: 'all'},

        },
        toolbox: {
            feature: {
                dataZoom: {
                    show: true,
                    title: 'Box Zoom'
                }
            }
        },
        series: [
            {
                id: props.appState.streams.gas.name,
                type: 'line',
                data: props.appState.streams.gas.points.map(function (item) { //must be in a [[x,y],....] format 
                    return [item.x, item.y]
                }),
                name: props.appState.streams.gas.name,
                color: 'Red',
                symbolSize: 6,
                hoverAnimation: false,
                showSymbol: false,
                xAxisIndex: 0,
                yAxisIndex: 1,
            },
            {
                id: props.appState.streams.water.name,
                type: 'line',
                data: props.appState.streams.water.points.map(function (item) { //must be in a [[x,y],....] format 
                    return [item.x, item.y]
                }),
                name: props.appState.streams.water.name,
                color: 'Blue',
                symbolSize: 6,
                hoverAnimation: false,
                showSymbol: false,
                xAxisIndex: 0,
                yAxisIndex: 2,
            },
            {
                id: props.appState.streams.oil.name,
                type: 'line',
                data: props.appState.streams.oil.points.map(function (item) { //must be in a [[x,y],....] format 
                    return [item.x, item.y]
                }),
                name: props.appState.streams.oil.name,
                color: 'Green',
                symbolSize: 6,
                hoverAnimation: false,
                showSymbol: false,
                yAxisIndex: 0,
                xAxisIndex: 0,

                tooltip: {
                    formatter: function (param: any) {
                        param = param[0];
                        return [
                            'GAS ' + param.data[0] + '<br/>',
                            'WATER: ' + param.data[1] + '<br/>',
                            'OIL: ' + param.data[2] + '<br/>',
                            'DOWNTIME: ' + param.data[3] + '<br/>'
                        ].join('');
                    }
                }
            },
            {
                id: props.appState.streams.downtime.name,
                type: 'line',
                data: props.appState.streams.downtime.points.map(function (item) { //must be in a [[x,y],....] format 
                    return [item.x, item.y]
                }),
                name: props.appState.streams.downtime.name,
                color: 'Black',
                symbolSize: 6,
                hoverAnimation: false,
                showSymbol: false,
                yAxisIndex: 3,
                xAxisIndex: 1,
                step: true,
                markPoint: {symbolSize: 100},
            },
        ],
    };

    const [movementMode, setMovementMode] = React.useState(false);
    const [oldX, setOldX] = React.useState(0);

    React.useEffect(() => {

        // @ts-ignore This how we have to get the echarts instance
        const echartsInstance = echartsRef?.current?.getEchartsInstance();

        if (echartsInstance !== null && echartsInstance !== undefined) {

            echartsInstance.on('mousedown', {seriesIndex: 3}, (params: any) => {

                let options = echartsInstance.getOption();
                let symbol = options?.series[params.seriesIndex]?.showSymbol;

                echartsInstance.setOption({
                    series: {
                        id: props.appState.streams.downtime.name,
                        name: props.appState.streams.downtime.name,
                        showSymbol: !symbol,
                    }
                });

                setMovementMode(!symbol);
            });

            echartsInstance.on('mousemove', 'graph', (params: any) => {


                console.log(params);
                console.log(movementMode);

                let oldXVal = echartsInstance.convertFromPixel(props.appState.streams.downtime.name, ([oldX, params.event.offsetY]));
                let newXVal = echartsInstance.convertFromPixel(props.appState.streams.downtime.name, ([params.event.offsetX, params.event.offsetY]));

                if (movementMode) {
                }
            });
            

        }

    }, []);

    return <div>
        <ReactEcharts style={{width: 1200, height: 800}} option={init} ref={echartsRef}/>
    </div>
};

