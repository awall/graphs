import React, {FunctionComponent, ReactElement, useContext, useEffect, useRef, useState} from 'react';
import {scaleLinear, scaleTime} from 'd3-scale';
import {path} from "d3-path";
import {Point} from "./AppState";

export interface AcPoint<X,Y> { x: X, y: Y }

export interface AcDomainDef<T> { min: T, max: T }

type Interpolation = "step" | "line";

export interface AcSeriesProps<X, Y>
{
    color: string,
    points: AcPoint<X, Y>[],
    x: AcDomainDef<X>,
    y: AcDomainDef<Y>,
    interpolation?: Interpolation,
    dashArray?: string | number;
    dashOffset?: string | number;
}

interface AcPositioned {
    r: number,
    c: number,
}

interface AcAxisProps extends AcPositioned {
    title?: string,
}

interface AcVerticalAxisProps<T> extends AcAxisProps {
    y: AcDomainDef<T>,
    ticks: T[],
    formatter?: (value: T) => string,
}

interface AcHorizontalAxisProps<T> extends AcAxisProps {
    x: AcDomainDef<T>,
    ticks: T[],
    formatter?: (value: T) => string,
}

export interface AcLeftAxisProps<T> extends AcVerticalAxisProps<T> {
}

export interface AcRightAxisProps<T> extends AcVerticalAxisProps<T> {
}

export interface AcBottomAxisProps<T> extends AcHorizontalAxisProps<T> {
}

export interface AcPlotProps extends AcPositioned {
}

export interface AcChartProps {
    width: number,
    height: number,
    rows: number[],
    cols: number[],
}

interface Position {
    top: number,
    bottom: number,
    left: number,
    right: number,
}

const PositionContext = React.createContext({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
});

export function AcSeries<X, Y>(props: AcSeriesProps<X, Y>) {
    const pos = useContext(PositionContext);
    
    // Fix this in the real code.
    // @ts-ignore
    const xaxis = scaleTime().domain([props.x.min, props.x.max]).range([pos.left, pos.right]);
    // @ts-ignore
    const yaxis = scaleLinear().domain([props.y.min, props.y.max]).range([pos.bottom, pos.top]);
    
    const [head, ...tail] = props.points;
    const pat = path();
    
    let prevY = yaxis(head.y);
    pat.moveTo(xaxis(head.x), prevY);
    
    const interpolation: Interpolation = props.interpolation || "line";
    if (interpolation == "line") {
        tail.forEach(v => {
            pat.lineTo(xaxis(v.x), yaxis(v.y));
        });
    } else if (props.interpolation == "step") {
        tail.forEach(v => {
            pat.lineTo(xaxis(v.x), prevY);
            pat.lineTo(xaxis(v.x), yaxis(v.y));
            prevY = yaxis(v.y);
        });
    }

    const dashes = props.dashArray || 0;
    const offset = props.dashOffset || 0;
    return <path d={pat.toString()} fill="none" stroke={props.color} strokeWidth="1" strokeDasharray={dashes} strokeDashoffset={offset} />;
}

export function AcLeftAxis<X>(props: AcLeftAxisProps<X>) {
    const ticks = props.ticks;
    const title = props.title;

    const pos = positionHack(props.r, props.c);
    const height = pos.bottom - pos.top;
    
    // Fix this in the real code.
    // @ts-ignore
    const axis = scaleLinear().domain([props.y.min, props.y.max]).range([height, 0]);
    // @ts-ignore
    const formatter = props.formatter || ((x: X) => x.toString());
    
    // <line x1="0" y1="0" x2="0" y2={height} stroke="black" />
    return <g transform={`translate(${pos.right} ${pos.top})`}>
        { ticks.map(t =>
            <g transform={`translate(0 ${axis(t)})`}>
                <line x1="-8" y1="0" x2="0" y2="0" stroke="black" />
                <text x="-10" textAnchor="end" dominantBaseline="central">{formatter(t)}</text>
            </g>
        )};
        <g width={height} transform="rotate(-90)">
            <text textAnchor="middle" x={-height / 2} y={-55}>{title}</text>
        </g>
    </g>;
}

export function AcRightAxis<X>(props: AcRightAxisProps<X>) {
    const ticks = props.ticks;
    const title = props.title;

    const pos = positionHack(props.r, props.c);
    const height = pos.bottom - pos.top;

    // Fix this in the real code.
    // @ts-ignore
    const axis = scaleLinear().domain([props.y.min, props.y.max]).range([height, 0]);
    // @ts-ignore
    const formatter = props.formatter || ((x: X) => x.toString());
    
    // <line x1="0" y1="0" x2="0" y2={height} stroke="black" />
    return <g transform={`translate(${pos.left} ${pos.top})`}>
        { ticks.map(t =>
            <g transform={`translate(0 ${axis(t)})`}>
                <line x1="0" y1="0" x2="8" y2="0" stroke="black" />
                <text x="10" textAnchor="start" dominantBaseline="central">{formatter(t)}</text>
            </g>
        )};
        <g width={height} transform="rotate(-90)">
            <text textAnchor="middle" x={-height / 2} y={55}>{title}</text>
        </g>
    </g>;
}

export function AcBottomAxis<X>(props: AcBottomAxisProps<X>) {
    const ticks = props.ticks;
    const title = props.title;

    const pos = positionHack(props.r, props.c);
    const width = pos.right - pos.left;

    // Fix this in the real code.
    // @ts-ignore
    const axis = scaleTime().domain([props.x.min, props.x.max]).range([0, width]);
    // @ts-ignore
    const formatter = props.formatter || ((x: X) => x.toString());

    //<line x1="0" y1="0" x2={width} y2="0" stroke="black" />
    return <g transform={`translate(${pos.left} ${pos.top})`}>
        { ticks.map(d =>
            // @ts-ignore
            <g transform={`translate(${axis(d)} 0)`}>
                <line x1="0" y1="0" x2="0" y2="8" stroke="black" />
                <g transform={`translate(0 8)`}>
                    <text textAnchor="middle" dominantBaseline="hanging">{formatter(d)}</text>
                </g>
            </g>
        )};
    </g>;
}

export const AcPlot: FunctionComponent<AcPlotProps> = ({
    r,
    c,
    children
}) => {
    const pos = positionHack(r, c);
        
    return <PositionContext.Provider value={pos}>
        <rect x={pos.left} width={pos.right - pos.left} y={pos.top} height={pos.bottom - pos.top} stroke="black" fill="none" strokeWidth={1} />
        { React.Children.toArray(children) }
    </ PositionContext.Provider>;
};

export const AcChart: FunctionComponent<AcChartProps> = ({
    width,
    height,
    children
}) => {
    
    //React.Children.forEach(children, x => {
    //    const props = x?["props"];
    //    if (isPositioned(props)) {
    //        const r = props.r;
    //        const c = props.c;
    //    }
    //});
    
    const pos = positionHack(2,3);
    return <svg width={pos.right} height={pos.bottom}>
        { React.Children.toArray(children) }
    </svg>;
};

//function isPositioned(props: any): props is AcPositioned {
  //  return (props as AcPositioned).r !== undefined;
//}

function positionHack(r: number, c: number): Position {
    const axis = 85;
    
    let pos = {
        top: 10, 
        bottom: 10,
        left: 10,
        right: 10,
    };

    if (r >= 0) {
        pos.bottom = pos.top + 300;
    }
    if (r >= 1) {
        pos.top = pos.bottom + 21;
        pos.bottom = pos.top + 600;
    }
    if (r >= 2) {
        pos.top = pos.bottom + 1;
        pos.bottom = pos.top + axis;
    }
    if (c >= 0) {
        pos.right = pos.left + axis;
    }
    if (c >= 1) {
        pos.left = pos.right + 1;
        pos.right = pos.left + 900;
    }
    if (c >= 2) {
        pos.left = pos.right + 1;
        pos.right = pos.left + axis;
    }
    if (c >= 3) {
        pos.left = pos.right + 1;
        pos.right = pos.left + axis;
    }
    return pos;
}


