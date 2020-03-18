import React, { useEffect, useRef} from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import {AppState, Point} from '../AppState'
import { number } from 'prop-types';
import { toNumber } from 'vega';

require("highcharts/modules/draggable-points")(Highcharts);
require("highcharts/modules/accessibility")(Highcharts);
require("highcharts/modules/boost")(Highcharts);

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

    const [highChartsProps, updateHighcharts] = React.useState(props.highChartProps);
    const [currentHoverPoint, updateHoverPoint] = React.useState<dispPoint>({x : 0, y : 0});
    
    const downTimeRef = useRef<any>(null);
    const [shadow, setShadow] = React.useState<Point[]>(() => {
        
        let newPoints : Point[] = new Array<Point>();
        
        for(let i =0 ; i < props.appState.streams.downtime.points.length; i++){
            let oldVal = props.appState.streams.downtime.points[i];
            newPoints.push({x : oldVal.x, y: oldVal.y});
        }
        
        return newPoints;}
   );
    
    function onPointed(event : Event){
        
        //@ts-ignore
        const point : Highcharts.Point = this;

        //@ts-ignore
        point.update({
            marker : { 
                enabled : true,
                radius : 40
            },
        })
    
         
        //window.alert("off");
    
    }
    const onPoint = (args : pointEventArgs) => {
       
        const point = args.target;
        updateHoverPoint({x : point.x, y : point.y});  
        

        //window.alert("on");
    } ;

    function offPoint(event : Event){
       
          //@ts-ignore
          const point : Highcharts.Point = this;

         point.update({
             marker : { 
                 enabled : false,
             }
         })

         point.series.chart.redraw();
    } 
    
    //You could make this modular, and compose the object instead of making it 1 large statement.
    const graph1Options = {
        
        chart: {             
            animation: false,
            zoomType: 'xy',
        },

        credits: {
            enabled: false
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

        plotOptions: {
            series: {
                allowPointSelect: false,
                marker: {
                    enabled : false,
                },
                animation: false,
                stickyTracking: false,
            },
            line: {
                cursor: 'ns-resize'
            },
    
        },

        tooltip: {
            shared: true,
            crosshairs: true
        },

        legend : {
            align : 'right',
            verticalAlign: 'top',
            layout: 'horizontal',
        },

        series: [
        {
            id:'Oil',
            name: props.appState.streams.oil.name,
            type: 'line',
            data: props.appState.streams.oil.points,
            color: 'green',
            yAxis : 0, //index of the axis 
        }, 
        {
            id:'Gas',
            name: props.appState.streams.gas.name,
            type: 'line',
            data: props.appState.streams.gas.points,
            color: 'red',
            yAxis : 1,
        },  
        {
            id:'Water',
            name: props.appState.streams.water.name,
            type: 'line',
            data: props.appState.streams.water.points,
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

        tooltip: {
            valueDecimals: 2
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
            step: 'right',
            data: props.appState.streams.downtime.points,
            color: 'black',
            yAxis : 0, //index of the axis 
            dashStyle: 'black'
        },
            {
                id:'Shadow',
                name: 'Shadow',
                type: 'line',
                step: 'right',
                data: shadow,
                color: 'black',
                yAxis : 0, //index of the axis,
                opacity: 100,
                dashStyle: 'ShortDot'
            },]
    };

    const moveGraphRight = (e : any) => {

        let newShadow = shadow.map(x => x);
        
        for(let i = 0; i < newShadow.length; i++){
            newShadow[i].x = new Date(newShadow[i].x.getFullYear(), newShadow[i].x.getMonth() + 1, newShadow[i].x.getDay());
        }
        
        setShadow(newShadow);
        
        let chart = downTimeRef.current.chart as Highcharts.Chart;
        
        chart.series[1].update({
            id:'Shadow',
            name: 'Shadow',
            type: 'line',
            step: 'right',
            color: 'black',
            yAxis : 0, //index of the axis,
            opacity: 100,
            dashStyle: 'ShortDot'
        });
    };

    const [currX, setCurrX] = React.useState<number>(0);
    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    
    const onMouseDown = (event : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        
        /*if(!mouseDown) {
            
            setCurrX(event.screenX);
            setMouseDown(true);

            let chart = downTimeRef.current.chart as Highcharts.Chart;
            
            let value= shadow.map(x => {return {...x, x: new Date(x.x.getFullYear(), x.x.getMonth() +1, x.x.getDay())}});

            setShadow(value);
            
            chart.series[1].update({
                id:'shadow',
                name: 'shadow',
                type: 'line',
                color: 'black',
                yAxis : 0, //index of the axis 
                dashStyle: 'ShortDot'
            });
        }*/
    };
    
    const onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        
        if(mouseDown) {
            
            setMouseDown(false);
            /*let chart = downTimeRef.current.chart as Highcharts.Chart;
            
            if(shadow !== undefined) {
                props.appState.streams.downtime.points = shadow.map(item => {
                    return {x: new Date(item.x), y: item.y!}
                });

                chart.series[1].remove(true);
            }*/
        }
    };

    const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

        /*if(mouseDown){
            
            let chart = downTimeRef.current.chart as Highcharts.Chart;
            let newX = event.screenX;
            
            let value = chart.xAxis[0].toValue(currX);
            let value2 = chart.xAxis[0].toValue(newX);
            
            let diff = value2 - value; 
            
            if(shadow != undefined) {
                
                shadow?.forEach(item => item.x += diff);

                if(chart.series[1] != undefined) {
                    chart.series[1].update({
                        type: 'line',
                        data: shadow,
                        color: 'purple',
                    }, true);
                }
            }
        }*/
    };

    return <div>
        <div id='graph2' onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
            <HighchartsReact ref={downTimeRef} highcharts={Highcharts} options={graph2Options} {...highChartsProps} allowChartUpdate={true}>
            </HighchartsReact>
            <button onClick={moveGraphRight}>Move 1 Month Right</button>
        </div> 
        <div id='graph1'>
            <HighchartsReact highcharts={Highcharts} options={graph1Options} {...highChartsProps} allowChartUpdate={true}>
            </HighchartsReact>
        </div>
        <div>
            {"x : " + currentHoverPoint!.x}
        </div>
    </div>
};



//Need to implement this. Might have to expose the ref again.
//https://www.highcharts.com/demo/synchronized-charts
    


