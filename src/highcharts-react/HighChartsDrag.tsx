import React, {useEffect, useRef, useState} from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

require("highcharts/modules/draggable-points")(Highcharts);
require("highcharts/modules/accessibility")(Highcharts);
require("highcharts/modules/boost")(Highcharts);
require("highcharts/modules/data")(Highcharts);
require('highcharts-more')(Highcharts);


interface props {
    highChartProps? : HighchartsReact.Props
}

export const DraggableGraph = (props : props) =>{
  
    const initialData = [{x : 10, y: 20},{x : 45, y: 75},{x : 100, y: 20}];
    const [graphData, setGraphData] = useState(initialData);
    const graphRef = useRef<any>(null);
    
    const options = {

        chart: {
            animation: false,
        },

        credits: {
            enabled: false
        },

        title: {
            text: 'Highcharts Prototype'
        },

        xAxis: {
            type: 'value',
            min: 0,
            max: 300,
        },

        boost: {
            //useGPUTranslations: true
        },
        
        yAxis: {
            min: 0,
            max: 150,
            type: 'value'
        },
        
   
        
        series : [
            {
                type: 'spline',
                data: graphData,
                dragDrop: {
                    draggableY: false,
                    draggableX: false,
                },
                marker: {
                    enabled : false,
                },
                color: 'red'
            },
            {
                type: 'line',
                data : [{x : 10, y: 20},{x : 45, y: 140},{x : 100, y: 20}],
                dragDrop: {
                    draggableX: true,
                    draggableY: true,
                },
                
                color: 'black',
            }
        ],

        tooltip: {
            enabled: false,
        },
        
        plotOptions: {
            series : {
                animation: false,
                //boostThreshold : 1,
                //turboThreshold : 1000000,
                cursor: 'move',
                threshold : null,
                states:{
                    inactive: {
                        opacity:1,
                    }
                },
            },
            spline: {
                enableMouseTracking : false,
            },
        },
    };


    const [currX, setCurrX] = React.useState<number>(0);
    const [currY, setCurrY] = React.useState<number>(0);
    const [mouseDown, setMouseDown] = React.useState<boolean>(false);
    
    const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        
    };

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setMouseDown(true);
        setCurrX(event.screenX);
        setCurrY(event.screenY);
    };

    const onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setMouseDown(false);
    };
   
    useEffect(() => {
       
        let chart = graphRef.current.chart as Highcharts.Chart;

        chart.series[0].points[1].update({
            dragDrop : {
                draggableX : false,
                draggableY : false,
            }
        });

        chart.series[1].points[1].update({
            events: {
                drag: function (e : any){
                    
                    let newPoint = e.newPoint;

                    let x1 = 2*(newPoint.x) - (10/2) - (100/2);
                    let y1 = 2*(newPoint.y) - (20/2) - (20/2);

                    let chart = graphRef.current.chart as Highcharts.Chart;

                    chart.series[0].points[1].update({
                        x : x1,
                        y: y1,
                    }, false, false);
                    
                }   
            }
        });
    });
    
    const graphDataString = () => {
        
        let str = "";
        
        for(let i = 0; i < graphData.length; i++){
            str += "{ X : " + graphData[i].x + " Y : " + graphData[i].y + "},";
        }
        
        return str;
    };
    
    return <div onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
        <HighchartsReact ref={graphRef} highcharts={Highcharts} options={options} {...props.highChartProps} allowChartUpdate={false} oneToOne = {true}>
        </HighchartsReact>
        <div>{graphDataString()}</div>
    </div>
};