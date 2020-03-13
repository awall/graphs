import React, {useContext, useEffect, useRef, useState} from 'react';
import {path} from 'd3-path';
import {scaleLinear} from 'd3-scale';

const ClientSize = React.createContext({width: 900, height: 500});

const maxKey = 1000;
const data = Array.from(Array(maxKey).keys()).map(x => [x, x + (Math.random() * 5.0)]);
const maxDatum = 1005;

const Series = (props: any) => {
    const size = useContext(ClientSize);
    
    const x = scaleLinear()
        .domain([0, maxKey])
        .range([0, size.width]);
    
    const y = scaleLinear()
        .domain([0, maxDatum])
        .range([size.height, 0]);
    
    const pat = path();
    const [head, ...tail] = props.points;
    pat.moveTo(x(head[0]), y(head[1]));
    tail.forEach((v: any) => pat.lineTo(x(v[0]), y(v[1])));
    
    return <path d={pat.toString()} fill="none" stroke="black" stroke-width="2" />;
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

const useMousePosition = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const setFromEvent = (e: any) => setPosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", setFromEvent);
        return () => {
            window.removeEventListener("mousemove", setFromEvent);
        };
    }, []);
    return position;
};
    
export default () => {
   // const bars = data.map(({name, value}, i) => (
   //     <g transform={`translate(${i * barWidth}, 0)`} key={name}>
   //         <rect y={y(value)} height={height - y(value)} width={barWidth - 1} floodColor="#bbbbbb" />
    //        <text x={barWidth / 2} y={y(value) + 3} dy=".75em">
    //            {value}
    //        </text>
   ////     </g>
    //));

    const pos = useMousePosition();
    const transform = `translate(${pos.x} ${pos.y})`;
    
    return (
        <Chart style={
          { width: "100%"
          , height: "90vh"
        }}>
            <Series points={data} />
            <g transform={transform}>
                <Series points={data} />
            </g>
        </Chart>
    );
}