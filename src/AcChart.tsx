import React, {FunctionComponent, MutableRefObject, ReactElement, useContext, useEffect, useRef, useState} from 'react';
import {scaleLinear, scaleTime} from 'd3-scale';
import {path} from "d3-path";

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
    dashArray?: string | number,
    dashOffset?: string | number,
    width?: number,
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

export interface AcLayoutProps extends AcPositioned {
}

export interface AcChartProps {
    width: number,
    height: number,
    rows: number[],
    cols: number[],
}

interface Position {
    top: number,
    left: number,
    width: number,
    height: number,
}

const PositionContext = React.createContext({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
});

const SvgRefContext = React.createContext({
    current: null,
});

export const useAcPosition = () => {
    const pos = useContext(PositionContext);
    const ref = useContext(SvgRefContext);
    
    let rect = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    }; 
      
    if (ref.current) {
        // @ts-ignore
        rect = ref.current.getBoundingClientRect();
    }
    
    return {
        ...pos,
        chart: rect,
    };
};

export function AcSeries<X, Y>(props: AcSeriesProps<X, Y>) {
    const pos = useAcPosition();
    
    // Fix this in the real code.
    // @ts-ignore
    const xaxis = scaleTime().domain([props.x.min, props.x.max]).range([0, pos.width]);
    // @ts-ignore
    const yaxis = scaleLinear().domain([props.y.min, props.y.max]).range([pos.height, 0]);
    
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
    return <path d={pat.toString()} fill="none" stroke={props.color} strokeWidth={props.width || 1} strokeDasharray={dashes} strokeDashoffset={offset} />;
}

export function AcLeftAxis<X>(props: AcLeftAxisProps<X>) {
    const ticks = props.ticks;
    const title = props.title;

    const pos = positionHack(props.r, props.c);
    const height = pos.height;
    
    // Fix this in the real code.
    // @ts-ignore
    const axis = scaleLinear().domain([props.y.min, props.y.max]).range([height, 0]);
    const formatter = props.formatter || (x => `${x}`);

    // <line x1="0" y1="0" x2="0" y2={height} stroke="black" />
    return <g transform={`translate(${pos.left + pos.width} ${pos.top})`}>
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
    const height = pos.height;
    
    // Fix this in the real code.
    // @ts-ignore
    const axis = scaleLinear().domain([props.y.min, props.y.max]).range([height, 0]);
    const formatter = props.formatter || (x => `${x}`);
    
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
    const width = pos.width;

    // Fix this in the real code.
    // @ts-ignore
    const axis = scaleTime().domain([props.x.min, props.x.max]).range([0, width]);
    const formatter = props.formatter || (x => `${x}`);

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

export const AcPlot: FunctionComponent<AcPlotProps> = (props) => {
    const pos = positionHack(props.r, props.c);
    const clipPathId = `clipPath${props.r}+${props.c}`;    
    
    return <AcLayout {...props}>
        <g>
            <defs>
                <clipPath id={clipPathId}>
                    <rect width={pos.width} height={pos.height} />
                </clipPath>
            </defs>
        
            <rect x={0} width={pos.width} y={0} height={pos.height} stroke="black" fill="none" strokeWidth={1} />
            <g clipPath={`url(#${clipPathId})`}>
                { props.children }
            </g>
        </g>
    </ AcLayout>;
};

export const AcLayout: FunctionComponent<AcLayoutProps> = ({
   r,
   c,
   children
}) => {
    const pos = positionHack(r, c);

    return <PositionContext.Provider value={pos}>
        <g transform={`translate(${pos.left} ${pos.top})`}>
            { React.Children.toArray(children) }
        </g>
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

    const ref = useRef(null);
    
    const pos = positionHack(2,3);
    return <svg ref={ref} width={pos.left + pos.width} height={pos.top + pos.height}>
        <SvgRefContext.Provider value={ref}>
        { React.Children.toArray(children) }
        </SvgRefContext.Provider>
    </svg>;
};

//function isPositioned(props: any): props is AcPositioned {
  //  return (props as AcPositioned).r !== undefined;
//}

function positionHack(r: number, c: number): Position {
    const axis = 85;
    
    let pos = {
        top: 10, 
        left: 0,
        width: 0,
        height: 0,
    };

    if (r >= 0) {
        pos.height = 200;
    }
    if (r >= 1) {
        pos.top += pos.height + 21;
        pos.height = 400;
    }
    if (r >= 2) {
        pos.top += pos.height + 1;
        pos.height = axis;
    }
    
    if (c >= 0) {
        pos.width = axis;
    }
    if (c >= 1) {
        pos.left += pos.width + 1;
        pos.width = 900;
    }
    if (c >= 2) {
        pos.left += pos.width + 1;
        pos.width = axis;
    }
    if (c >= 3) {
        pos.left += pos.width + 1;
        pos.width = axis;
    }
    return pos;
}


