import React, { useEffect, useRef} from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import {AppState, Point} from '../AppState'
import data from 'highcharts/modules/data'

require("highcharts/modules/draggable-points")(Highcharts);
require("highcharts/modules/accessibility")(Highcharts);
require("highcharts/modules/boost")(Highcharts);
require("highcharts/modules/data");

interface props {
    appState : AppState,
    highChartProps? : HighchartsReact.Props
}

interface dispPoint {
    x : any,
    y : any,
}

interface pointEventArgs{
    target : Highcharts.Point,
    type: string,
}

export const HighChartsGraph = (props : props) => {

    const [highChartsProps] = React.useState(props.highChartProps);
    const downTimeRef = useRef<any>(null);
    
    const [shadow, setShadow] = React.useState<Point[]>(() => {
        
        let newPoints : Point[] = new Array<Point>();
        
        for(let i =0 ; i < props.appState.streams.downtime.points.length; i++){
            let oldVal = props.appState.streams.downtime.points[i];
            newPoints.push({x : oldVal.x, y: oldVal.y});
        }
        
        return newPoints;}
   );
    
    
    //You could make this modular, and compose the object instead of making it 1 large statement.
    const graph1Options = {
        
        chart: {   
            type: 'line',
            animation: false,
            zoomType: 'xy',
        },
        
        title: {
            text:"",
        },

        xAxis: {

            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%e %b %y',
                month: '%b %y'
            },
            
            tickAmount : props.appState.yearSpan,
        },

        yAxis: [
        { 
            labels: {  
                style: {
                    color: 'green',
                }
            },
            title: { 
                text: props.appState.streams.oil.unit,
                style: {
                    color: 'green',
                },
            }
        },
        { 
            labels: {  
                style: {
                    color: 'red',
                }
            },
            title: { 
                text: props.appState.streams.gas.unit,
                style: {
                    color: 'red',
                },
            },
          
        },
        { 
            labels: {  
                style: {
                    color: 'blue',
                }
            },
            title: { 
                text: props.appState.streams.water.unit,
                style: {
                    color: 'blue',
                },
            },
            opposite: true,
        }],
        
        legend : {
            align : 'right',
            verticalAlign: 'top',
            layout: 'horizontal',
        },

        plotOptions: {
            series : {
                tooltip: {
                    followPointer: true,
                    stickOnContact: true,
                },
                
                states:{
                    
                }
            },
            
        },

        tooltip: {
            shared: true,
            crosshairs: true,
        },
        
        series: [
        {
            id:'Oil',
            name: props.appState.streams.oil.name,
            data:  props.appState.streams.oil.points.map(i => {return {x : i.x.getTime(), y : i.y}}),
            color: 'green',
            yAxis : 0, //index of the axis ,
        }, 
        {
            id:'Gas',
            name: props.appState.streams.gas.name,
            data:  props.appState.streams.gas.points.map(i => {return {x : i.x.getTime(), y : i.y}}),
            color: 'red',
            yAxis : 1,
        },  
        {
            id:'Water',
            name: props.appState.streams.water.name,
            data: props.appState.streams.water.points.map(i => {return {x : i.x.getTime(), y : i.y}}),
            color: 'blue',
            yAxis : 2,
        }]
    };

    const graph2Options = {
        
        chart: {       
            marginLeft: 151,
            marginRight: 40,
            animation: false,
        },

        credits: {
            enabled: false
        },

        title: {
            text: 'Highcharts Prototype'
        },

        xAxis: {
            type: 'datetime',
            min : Date.UTC(2000, 0, 0),
            max : Date.UTC(2005, 0, 0),
        },

        yAxis: [
        { 
            labels: {  
                style: {
                    color: 'black',
                }
            },
            title: { 
                text: props.appState.streams.downtime.unit,
                style: {
                    color: 'black',
                },
            },

        },],

        plotOptions: {
            series: {
                marker: {
                    enabled : false,
                },
                animation: false,
                stickyTracking: false,          
            },
            line: {
                
                cursor: 'ns-resize'
            }
        },
        
        legend : {
            align : 'right',
            verticalAlign: 'top',
            layout: 'horizontal',
        },

        series: [
        {
            id:'DownTime',
            name: props.appState.streams.downtime.name,
            type: 'line',
            step: 'center',
            data: props.appState.streams.downtime.points,
            color: 'black',
            yAxis : 0, //index of the axis 
            dashStyle: 'black'
        },
            {
                id:'Shadow',
                name: 'Shadow',
                type: 'line',
                step: 'center',
                data: shadow,
                color: 'black',
                yAxis : 0, //index of the axis,
                opacity: 100,
                dashStyle: 'ShortDot',
                showInLegend: false,
            },]
    };
    
    const [currX, setCurrX] = React.useState<number>(0);
    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    
    const onMouseDown = (event : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setMouseDown(true);
        setCurrX(event.screenX);
    };
    
    const onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        
        setMouseDown(false);
        
        let chart = downTimeRef.current.chart as Highcharts.Chart;
        
        props.appState.streams.downtime.points = shadow.map(x => {return {x : x.x, y : x.y}});
        chart.series[1].update({
            id:'Shadow',
            name: 'Shadow',
            type: 'line',
            step: 'center',
            color: 'black',
            yAxis : 0, //index of the axis,
            animation: false,
        });
        
    };

    const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

        if(mouseDown){

            let chart = downTimeRef.current.chart as Highcharts.Chart;
            
            let oldXVal = chart.xAxis[0].toValue(currX);
            let newValue = chart.xAxis[0].toValue(event.screenX);
            setCurrX(event.screenX);
            
            let diff = newValue - oldXVal;
            
            let newShadow = shadow.map(x => x);

            for(let i = 0; i < newShadow.length; i++){
                newShadow[i].x = new Date(newShadow[i].x.getTime() + diff);
            }

            setShadow(newShadow);
            
            chart.series[1].update({
                id:'Shadow',
                name: 'Shadow',
                type: 'line',
                step: 'center',
                color: 'black',
                yAxis : 0, //index of the axis,
                dashStyle: 'ShortDot',
                animation: false,
            });
        }
        else {

            for (let i = 0; i < Highcharts.charts.length; i = i + 1) {
                
                let chart = Highcharts.charts[i];
                
                // Get the hovered point
                // @ts-ignore
                let point = chart.series[0].searchPoint(true);
            }
        }
    };

    React.useEffect(() => {

        ['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
            downTimeRef.current.container.current.addEventListener(
                eventType,
                function (e : any) {
                    var chart,
                        point,
                        i,
                        event;

                    for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                        let chart : any = Highcharts.charts[i];
                        // Find coordinates within the chart
                        let event : any = chart.pointer.normalize(e);
                        // Get the hovered point
                        let point : any = chart.series[0].searchPoint(event, true);

                        if (point) {
                            point.highlight(e);
                        }
                    }
                }
            );
        });
        
    }, []);
    
    
    return <div>
        <div id='graph2' onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
            <HighchartsReact ref={downTimeRef} highcharts={Highcharts} options={graph2Options} {...highChartsProps} allowChartUpdate={true}>
            </HighchartsReact>
        </div> 
        <div id='graph1'>
            <HighchartsReact highcharts={Highcharts} options={graph1Options} {...highChartsProps} allowChartUpdate={true}>
            </HighchartsReact>
        </div>
    </div>
};



//Need to implement this. Might have to expose the ref again.
//https://www.highcharts.com/demo/synchronized-charts
    


