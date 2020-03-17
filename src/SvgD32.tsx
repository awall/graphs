import React, {useContext, useEffect, useRef, useState} from 'react';
import {AppState, Point} from "./AppState";

import {AcBottomAxis, AcChart, AcLeftAxis, AcPlot, AcRightAxis, AcSeries} from "./AcChart"

interface SvgD3Props {
    appState: AppState,
    onDrag: (timeInMs: number) => void,
}

export default (props: SvgD3Props) => {
    const appState = props.appState;
    const streams = appState.streams;

    const y2k = new Date('2000-01-01');
    const timeRange = {
        min: new Date(y2k.getUTCFullYear() - 2, 1, 1),
        max: new Date(y2k.getUTCFullYear() + 2 + appState.yearSpan, 1, 1),
    };
    
    const oil = {
        title: `${streams.oil.name} (${streams.oil.unit})`,
        points: streams.oil.points, 
        x: timeRange,
        y: {min: 0, max: 1100},
    };

    const gas = {
        title: `${streams.gas.name} (${streams.gas.unit})`,
        points: streams.gas.points,
        x: timeRange,
        y: {min: 0, max: 11000},
    };

    const water = {
        title: `${streams.water.name} (${streams.water.unit})`,
        points: streams.water.points,
        x: timeRange,
        y: {min: 0, max: 11},
    };

    const downtime = {
        title: `${streams.downtime.name} (${streams.downtime.unit})`,
        points: streams.downtime.points,
        x: timeRange,
        y: {min: 0, max: 0.6},
    };
    
    return (
        <div style={{ textAlign: "center", width: "100wh" }}>
            <br/><br/>
            
            <AcChart height={1200} width={1000} rows={[1,2,0]} cols={[0,1,0,0]}>
                <AcPlot r={0} c={1}>
                    <AcSeries color="gray" points={downtime.points} x={downtime.x} y={downtime.y} interpolation={"step"} dashArray={6} />
                </AcPlot>
                <AcPlot r={1} c={1}>
                    <AcSeries color="green" points={oil.points} x={oil.x} y={oil.y} />
                    <AcSeries color="red" points={gas.points} x={gas.x} y={gas.y} />
                    <AcSeries color="blue" points={water.points} x={water.x} y={water.y} />
                </AcPlot>

                <AcLeftAxis r={0} c={0} title={downtime.title} y={downtime.y}
                            ticks={[0.1, 0.2, 0.3, 0.4, 0.5]} />
                <AcLeftAxis r={1} c={0} title={oil.title} y={oil.y}
                            ticks={[200, 400, 600, 800, 1000]} />
                <AcRightAxis r={1} c={2} title={gas.title} y={gas.y}
                            formatter={(x => `${x*0.001}k`)}              
                            ticks={[2000, 4000, 6000, 8000, 10000]} />
                <AcRightAxis r={1} c={3} title={water.title} y={water.y}
                            ticks={[2, 4, 6, 8, 10]} />
                <AcBottomAxis r={2} c={1} x={timeRange} 
                            formatter={(x => `${x.getUTCFullYear()}`)}
                            ticks={[
                                new Date('2000-01-01'),
                                new Date('2010-01-01'),
                                new Date('2020-01-01'),
                                new Date('2030-01-01'),
                                new Date('2040-01-01'),
                                new Date('2050-12-01')]} />
            </AcChart>
            
        </div>
    );
}