import React, {useContext, useEffect, useRef, useState} from 'react';
import {path} from 'd3-path';
import {ScaleContinuousNumeric, scaleLinear, scaleTime} from 'd3-scale';
import {AppState, Point} from "./AppState";

interface SvgD3Props {
    appState: AppState,
    onDrag: (timeInMs: number) => void,
}

interface Range {
    start: Date,
    end: Date,
}

export default (props: SvgD3Props) => {
    const streams = props.appState.streams;

    const width = 1200;
    const height = 500;

    const initialStart = new Date('1998-01-01');
    const initialEnd = new Date('2052-12-01');
    
    const [xStart, setXStart] = useState(initialStart);
    const [xEnd, setXEnd] = useState(initialEnd);

    const [hover, setHover] = useState(false);
    
    let xaxis = scaleTime()
        .domain([xStart, xEnd])
        .range([0, width]);
    
    function lineSeries(stroke: string, yaxis: any, points: Point[]) {
        const [head, ...tail] = points;
        const pat = path();
        pat.moveTo(xaxis(head.x), yaxis(head.y));
        tail.forEach((v: Point) => pat.lineTo(xaxis(v.x), yaxis(v.y)));
        return <path d={pat.toString()} fill="none" stroke={stroke} strokeWidth="1" />;
    }

    function stepSeries(stroke: string, yaxis: any, points: Point[]) {
        const [head, ...tail] = points;
        const pat = path();
        let prevY = yaxis(head.y);
        pat.moveTo(xaxis(head.x), prevY);
        tail.forEach((v: Point) => {
            pat.lineTo(xaxis(v.x), prevY);
            pat.lineTo(xaxis(v.x), yaxis(v.y));
            prevY = yaxis(v.y);
        });
        return <>
            <path d={pat.toString()} fill="none" stroke={stroke} strokeWidth={hover ? 4 : 1} strokeDasharray={6} />
            <path d={pat.toString()} fill="none" stroke="black" strokeWidth={10} opacity={0.0}
                onMouseEnter={() => {
                    setHover(true);
                }}
                         
                onMouseLeave={() => {
                    if (!drag) {
                        setHover(false);
                    }
                }}
            />
        </>;
    }
    
    function verticalLines(dates: Date[]) {
        return <>
            { dates.map(d =>
                <line x1={xaxis(d)} y1="0" x2={xaxis(d)} y2={height} stroke="lightgray" />
            )};
        </>;
    }


    function horizontalLines(axis: ScaleContinuousNumeric<number, number>, ticks: number[]) {
        return <>
            { ticks.map(t =>
                <line x1="0" y1={axis(t)} x2={width} y2={axis(t)} stroke="lightgray" />
            )};
        </>;
    }
    
    function bottomAxis(dates: Date[]) {
        return <>
            <line x1="0" y1="0" x2={width} y2="0" stroke="black" />
            { dates.map(d =>
                <g transform={`translate(${xaxis(d)} 0)`}>
                    <line x1="0" y1="0" x2="0" y2="8" stroke="black" />
                    <g transform={`translate(0 8)`}>
                        <text textAnchor="middle" dominantBaseline="hanging">{d.getUTCFullYear()}</text>
                    </g>
                </g>
            )};
        </>;
    }

    function leftAxis(unit: string, scale: number, axis: ScaleContinuousNumeric<number, number>, ticks: number[]) {
        return <>
            <line x1="0" y1="0" x2="0" y2={height} stroke="black" />
            { ticks.map(t =>
                <g transform={`translate(0 ${axis(t)})`}>
                    <line x1="-8" y1="0" x2="0" y2="0" stroke="black" />
                    <text x="-10" textAnchor="end" dominantBaseline="central">{t * scale}</text>
                </g>
            )};
            <g width={height} transform="rotate(-90)">
                <text textAnchor="middle" x={-height / 2} y={-55}>{unit}</text>
            </g>
        </>;
    }

    function rightAxis(unit: string, scale: number, axis: ScaleContinuousNumeric<number, number>, ticks: number[]) {
        return <>
            <line x1="0" y1="0" x2="0" y2={height} stroke="black" />
            { ticks.map(t =>
                <g transform={`translate(0 ${axis(t)})`}>
                    <line x1="0" y1="0" x2="8" y2="0" stroke="black" />
                    <text x="10" textAnchor="start" dominantBaseline="central">{t * scale}</text>
                </g>
            )};
            <g width={height} transform="rotate(-90)">
                <text textAnchor="middle" x={-height / 2} y={55}>{unit}</text>
            </g>
        </>;
    }
    
    function yaxis(max: number) {
        return scaleLinear().domain([0, max]).range([height, 0]);
    }
    
    const tickDates = [
        new Date('2000-01-01'),
        new Date('2010-01-01'),
        new Date('2020-01-01'),
        new Date('2030-01-01'),
        new Date('2040-01-01'),
        new Date('2050-12-01')];
    
    const oil = yaxis(1100);
    const gas = yaxis(11000);
    const water = yaxis(11);
    const downtime = yaxis(1.0);
    
    const vaxisWidth = 85;
    
    const [drag, setDrag] = useState<Range|undefined>();
    const [zoom, setZoom] = useState<Range|undefined>();
    
    const svgRef = useRef(null);
    
    return (
        <div style={{
            textAlign: "center",
            width: "100wh",
        }}
        ><br /><br />
            
        <svg ref={svgRef} width={width+(vaxisWidth*3)} height={height * 2 + 300}

             onMouseDown={
                 (e) => {

                     
                     // @ts-ignore
                     const rect = svgRef.current.getBoundingClientRect();
                     // @ts-ignore
                     let x = e.clientX - rect.left - vaxisWidth;
                     if (x < 0) {
                         x = 0;
                     }
                     if (x > width) {
                         x = width;
                     }

                     if (hover) {
                         setDrag({start: xaxis.invert(x), end: xaxis.invert(x)});
                     } else {
                         setZoom({start: xaxis.invert(x), end: xaxis.invert(x)});
                     }
                 }
             }
             
            onMouseMove={
                (e) => {
                    // @ts-ignore
                    const rect = svgRef.current.getBoundingClientRect();
                    // @ts-ignore
                    let x = e.clientX - rect.left - vaxisWidth;
                    if (x < 0) {
                        x = 0;
                    }
                    if (x > width) {
                        x = width;
                    }
                    
                    if (zoom) {
                        setZoom(z => ({start: z!.start, end: xaxis.invert(x)}));
                    }
                    if (drag) {
                        setDrag(d => ({start: d!.start, end: xaxis.invert(x)}));
                    }
                }
            }

             onMouseUp={
                 (e) => {
                     if (zoom) {
                         setXStart(zoom.start);
                         setXEnd(zoom.end);
                     }
                     
                     if (drag) {
                         props.onDrag(drag.end.getTime() - drag.start.getTime());
                     }
                     
                     setDrag(undefined);
                     setZoom(undefined);
                     setHover(false);
                 }
             }
             
             onDoubleClick={
                 () => {
                     setXStart(initialStart);
                     setXEnd(initialEnd);
                 }
             }
        >
            <defs>
                <clipPath id="region">
                    <rect width={width} height={height} />
                </clipPath>
            </defs>
            
            <g transform={`translate (${vaxisWidth} 100)`}>
                
                { zoom  
                ? <rect x={xaxis(zoom.start)} y="0" width={xaxis(zoom.end) - xaxis(zoom.start)} height={height * 2} fill="green" stroke="none" fillOpacity={0.15} />
                : <></> }
                

                { leftAxis('Downtime (%)', 100, downtime, [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) }
                <g transform={`translate (0 0)`} clipPath="url(#region)">
                    { verticalLines(tickDates) }
                    { stepSeries("gray", downtime, streams.downtime.points) }
                    
                    { drag 
                        ? stepSeries("red", downtime, streams.downtime.points.map(p => ({x: new Date(p.x.getTime() + drag.end.getTime() - drag.start.getTime()), y: p.y})))
                        : <></> }
                </g>
                
                <g transform={`translate (0 ${height})`} clipPath="url(#region)" >
                    { verticalLines(tickDates) }
                    
                    { lineSeries("green", oil, streams.oil.points) }
                    { lineSeries("red", gas, streams.gas.points) }
                    { lineSeries("blue", water, streams.water.points) }
                </g>
    
                <g transform={`translate (0 ${height*2})`}>
                    { bottomAxis(tickDates) }
                </g>

                <g transform={`translate (0 ${height})`}>
                    { leftAxis('Oil Production (bbl/d)', 1, oil, [200, 400, 600, 800, 1000]) }
                    { horizontalLines(oil, [200, 400, 600, 800, 1000]) }
                </g>
                <g transform={`translate (${width} ${height})`}>
                    { rightAxis('Gas Production (mmcf/d)', 0.001, gas, [2000, 4000, 6000, 8000, 10000]) }
                </g>
                <g transform={`translate (${width+vaxisWidth} ${height})`}>
                    { rightAxis('Water Production (T/d)', 1, water, [2, 4, 6, 8, 10]) }
                </g>
            </g>
            
        </svg>
        </div>
    );
}