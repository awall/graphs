import * as rumble from 'rumble-charts'
import React from "react";

const series = [{
    data: [1, 3, 2]
}, {
    data: [5, 11, 7]
}, {
    data: [13, 19, null]
}];



export default class RumbleChartsGraph extends React.Component{

    test(){
        let chart = new rumble.Chart();
        
        chart.axisRight = {}
    }
 
    render(){
        return<rumble.Chart width={600} height={250} minX={0} minY={0}  scaleX={{paddingStart: 5, paddingEnd: 5}}
                            scaleY={{paddingTop: 100}}>
            <rumble.Layer series={series}>
                <rumble.Ticks axis='y'  lineLength='100%'
                              lineVisible={true}
                              lineStyle={{stroke:'lightgray'}}/>
                <rumble.Ticks axis='x'  lineLength='100%'
                              lineVisible={true}
                              lineStyle={{stroke:'lightgray'}}/>
                <rumble.Lines lineStyle={{enableDots: true, lineWidth: 45}} series={series}/>
            </rumble.Layer>
        </rumble.Chart>
    }
}

