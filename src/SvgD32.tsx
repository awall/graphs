import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {AppState, Point, Series} from "./AppState";

import {AcBottomAxis, AcChart, AcLayout, AcLeftAxis, AcPlot, AcRightAxis, AcSeries, useAcPosition} from "./AcChart"
import {scaleTime} from "d3-scale";

interface SvgD3Props {
    appState: AppState,
}

interface LineStyle {
    color: string,
    dashArray?: string | number;
    width: number;
}

interface SeriesDef {
    name: string,
    title: string,
    points: Point[],
    x: {min: Date, max: Date},
    y: {min: number, max: number},
    lineStyle: LineStyle,
}

interface Range {
    min: number,
    max: number,
}

interface Extents {
    min: Date,
    max: Date,
}

interface Extensions {
    tracker: number|null,
    zoom: Range|null,
    extents: Extents,
}

export default (props: SvgD3Props) => {
    const [hoveredSeries, setHoveredSeries] = useState<string|null>(null);
    
    const appState = props.appState;
    const streams = appState.streams;

    const y2k = new Date('2000-01-01');
    const fullTimeRange = {
        min: new Date(y2k.getUTCFullYear() - 1, 1, 1),
        max: new Date(y2k.getUTCFullYear() + 1 + appState.yearSpan, 1, 1),
    };

    const [extensions, setExtensions] = useState<Extensions>({
        tracker: null,
        zoom: null,
        extents: fullTimeRange,
    });

    const timeRange = extensions.extents;
    
    const common = (stream: Series) : SeriesDef => ({
        name: stream.name,
        title: `${stream.name} (${stream.unit})`,
        points: stream.points,
        x: timeRange,
        y: {min: 0, max: 0},
        lineStyle: {
            color: "unknown",
            dashArray: 0,
            width: hoveredSeries == stream.name ? 2 : 1,
        },
    });
    
    let oil = common(streams.oil);
    oil.y =  {min: 0, max: 1100};
    oil.lineStyle.color = "green";

    let gas = common(streams.gas);
    gas.y =  {min: 0, max: 11000};
    gas.lineStyle.color = "red";

    let water = common(streams.water);
    water.y =  {min: 0, max: 11};
    water.lineStyle.color = "blue";

    let downtime = common(streams.downtime);
    downtime.y =  {min: 0, max: 0.6};
    downtime.lineStyle.color = "gray";
    downtime.lineStyle.dashArray = 6;
    
    const ExtTracker = () => {
        const pos = useAcPosition();

        const xaxis = scaleTime().domain([timeRange.min, timeRange.max]).range([0, pos.width]);

        const onMouseDown = (e: any) => {
            const x = e.clientX - pos.left - pos.chart.left;
            setExtensions(e => ({
                ...e,
                zoom: { min: x, max: x },
                tracker: null, 
            }));
        };

        const onMouseUp = (e: any) => {
            setExtensions(e => ({
                ...e,
                extents: e.zoom && (e.zoom.max - e.zoom.min > 10) ? { min: xaxis.invert(e.zoom.min), max: xaxis.invert(e.zoom.max) } : e.extents,
                zoom: null,
            }));
        };

        const onMouseLeave = (e: any) => {
            setExtensions(e => ({
                ...e,
                tracker: null,
                zoom: null,
            }));
        };

        const onMouseMove = (e: any) => {
            const x = e.clientX - pos.left - pos.chart.left;
            
            setExtensions(e => ({
                ...e,
                zoom: e.zoom ? { min: e.zoom.min, max: x } : null,
                tracker: e.zoom ? null : x,
            }));
        };
        
        return <>
            { extensions.tracker
                ? <line 
                    x1={extensions.tracker}
                    x2={extensions.tracker}
                    y1={0}
                    y2={pos.height}
                    stroke="black" strokeWidth={1} opacity={0.3} />
                : null }
            { extensions.zoom
                ? <rect
                    x={extensions.zoom.min}
                    width={extensions.zoom.max - extensions.zoom.min}
                    height={pos.height}
                    fill="green" stroke="none" opacity={0.3} />
                : null }                
            <rect width={pos.width} height={pos.height} fill="black" stroke="black" opacity={0.0}
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
            />
        </>
    };
    
    return (
        <div style={{ textAlign: "center", width: "100wh" }}>
            <br/><br/>
            
            <AcChart height={1200} width={1000} rows={[1,2,0]} cols={[0,1,0,0]}>
                <AcPlot r={0} c={1}>
                    <AcSeries {...downtime.lineStyle} points={downtime.points} x={downtime.x} y={downtime.y} interpolation={"step"} />
                    <ExtTracker />
                </AcPlot>
                <AcPlot r={1} c={1}>
                    <AcSeries {...oil.lineStyle} points={oil.points} x={oil.x} y={oil.y} />
                    <AcSeries {...gas.lineStyle} points={gas.points} x={gas.x} y={gas.y} />
                    <AcSeries {...water.lineStyle} points={water.points} x={water.x} y={water.y} />
                    <ExtTracker />
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
                                new Date('2050-01-01')]} />
                                
                <AcLayout r={0} c={2}>                                
                    <ExtLegend 
                        onHover={s => setHoveredSeries(s)}
                        items={[
                        { ...downtime.lineStyle, title: downtime.name },
                        { ...oil.lineStyle,      title: oil.name },
                        { ...gas.lineStyle,      title: gas.name },
                        { ...water.lineStyle,    title: water.name },
                    ]} />
                </AcLayout>
            </AcChart>
            
        </div>
    );
}

interface ExtLegendProps {
    items: ExtLegendItem[],
    onHover: (title: string|null) => void
}

interface ExtLegendItem extends LineStyle {
    title: string,
}

const ExtLegend = (props: ExtLegendProps) => {
    return <>{ props.items.map((c, i) => 
        
        <g transform={`translate (20 ${12 + i * 20})`}>
            <line x1={0} x2={35} y1={1} y2={1} stroke={c.color} strokeWidth={c.width * 2} strokeDasharray={c.dashArray} />
            <text x={40} dominantBaseline="central">{c.title}</text>
            <rect width={120} height={20} y={-10} fill="black" stroke="black" opacity={0.0} 
                  onMouseEnter={_ => props.onHover(c.title)}
                  onMouseLeave={_ => props.onHover(null)} />
        </g>
        
    )} </>;
};
