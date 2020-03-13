import React, {useContext, useState} from 'react';
import {path} from 'd3-path';
import {scaleLinear} from 'd3-scale';
import {useMousePosition} from './Util';
import {AppState, Point} from "./AppState";

const ClientSize = React.createContext({width: 900, height: 500});

const Series = (props: any) => {
    const size = useContext(ClientSize);

    const [head, ...tail] = props.points;
    
    const x = scaleLinear()
        .domain([new Date('2000-01-01'), new Date('2050-12-01')])
        .range([0, size.width]);
    
    const maxDatum = 12000; 
    const y = scaleLinear()
        .domain([0, maxDatum])
        .range([size.height, 0]);
    
    const pat = path();
    
    pat.moveTo(x(head.x), y(head.y));
    tail.forEach((v: Point) => pat.lineTo(x(v.x), y(v.y)));
    
    return <path d={pat.toString()} fill="none" stroke="black" strokeWidth="2" />;
};

const ChartSvg = (props: any) => {
    const size = useContext(ClientSize);
    return <svg width={size.width} height={size.height}>
        {props.children}
    </svg>;
};

const Chart = (props: any) => {
    const [div, setDiv] = useState(null);
    const captureDiv = (node: any) => setDiv(node);
    
    
    return <div ref={captureDiv} {...props}>
            <ClientSize.Provider value={{
                // @ts-ignore
                width: div == null ? 0 : div.getBoundingClientRect().width,
                // @ts-ignore
                height: div == null ? 0 : div.getBoundingClientRect().height,
            }}>
                <ChartSvg host={div}>
                    {props.children}
                </ChartSvg>
        </ClientSize.Provider>
    </div>;
};
    
interface SvgD3Props {
    appState: AppState
}

export default (props: SvgD3Props) => {
    
    const pos = useMousePosition();
    const transform = `translate(${pos.x} ${pos.y})`;
    const streams = props.appState.streams;
    
    return (
        <Chart style={
          { width: "100%"
          , height: "90vh"
        }}>
            <Series points={streams.oil.points} />
            <Series points={streams.gas.points} />
            <Series points={streams.water.points} />
            <g transform={transform}>
                <Series points={streams.oil.points} />
            </g>
        </Chart>
    );
}