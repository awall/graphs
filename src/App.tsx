import './App.css';

import React, { useRef, useState, useContext, useEffect, useMemo, useCallback  } from 'react';
import * as d3 from 'd3';
import { within } from '@testing-library/react';

interface Point {
    x: Date,
    y: number,
}

const defaultData = (years: number) => {
    let points = [];
    for (let i = 0; i < years; ++i) {
        for (let m = 0; m < 12; ++m) {
            const year = 2000 + i;
            points.push({
                x: new Date(year, m, 1),
                y: 10 - (i * 0.2),
            })
        }
    }
    return points;
}

type MultiplierCallback = (date: Date) => number;
const identity = (date: Date) =>{ 
    return 1.0;
};

const applyMultiplier = function(pts: Point[], multiplier: MultiplierCallback): Point[] {
    return pts.map(p => ({
        x: p.x,
        y: multiplier(p.x) * p.y,
    }));
}

export default () => {
    const [[allPoints, multiplier], setAllPoints] = useState<[Point[], MultiplierCallback]>([defaultData(40), identity]);
    const [zoom, setZoom] = useState<[Date, Date]|null>(null);

    const margin = 10;
    const timeDomain = zoom ?? [d3.min(allPoints, p => p.x)!, d3.max(allPoints, p => p.x)!];
    const xScale = d3.scaleTime()
        .domain(timeDomain)
        .nice();

    const points = applyMultiplier(cullPoints(allPoints, timeDomain), multiplier);
    const cumPoints = useMemo(() => cumulative(points), [allPoints, zoom, multiplier]);

    const rateScale = d3.scaleLinear()
        .domain([0, d3.max(points, p => p.y)! * 1.5])
        .nice();

    const cumScale = d3.scaleLinear()
        .domain([d3.min(cumPoints, p => p.y)!, d3.max(cumPoints, p => p.y)!])
        .nice();

    const onZoom = (zoomStart: Date, zoomEnd: Date) => {
        const first = zoomStart.getTime() < zoomEnd.getTime() ? zoomStart : zoomEnd;
        const second = zoomStart.getTime() < zoomEnd.getTime() ? zoomEnd : zoomStart;
        setZoom([first, second]);
    };

    const doMultiply = (newm: MultiplierCallback|null) => {
        setAllPoints(([pts, m]) => [
            newm ? pts : applyMultiplier(pts, m),
            newm ?? identity,
        ]);
    };

    return <div className="App" style={{
      marginLeft: `${margin}px`,
      marginTop: `${margin}px`,
      marginRight: `${margin}px`,
      marginBottom: `${margin}px`,
      height: `calc(100vh - ${margin * 2}px)`,
    }}>
        <svg id="svg" width="100%" height="100%">
            <AcTable margin={20} layout={[
                ["topy",    "toparea"   ],
                [null,      "topx"      ],
                ["bottomy", "bottomarea"],
                [null,      "bottomx"   ],
            ]}>
                <AcChart cell="toparea">
                    <AcSeries points={points} xScale={xScale} yScale={rateScale} />
                </AcChart>
                <AcAxis cell="topy" location="left" scale={rateScale} title="Production Rate (bbl/d)" />
                <AcAxis cell="topx" location="bottom" scale={xScale} />
                <ExtAxisZoom cell="topx" location="bottom" scale={xScale} onZoom={onZoom} />
                <ExtBezierMultiplier cell="toparea" scale={xScale} doMultiply={doMultiply} />

                <AcChart cell="bottomarea">
                    <AcSeries points={cumPoints}  xScale={xScale} yScale={cumScale}/>
                </AcChart>
                <AcAxis cell="bottomy" location="left" scale={cumScale} title="Total Production (bbl)"/>
                <AcAxis cell="bottomx" location="bottom" scale={xScale} />
                <ExtAxisZoom cell="bottomx" location="bottom" scale={xScale} onZoom={onZoom} />

            </AcTable>
            
        </svg>
    </div>
};

////////////////////////////////////////////////////////////////////////////////
//
// Utilities
//
////////////////////////////////////////////////////////////////////////////////

const daysBetween = (firstDate: Date, secondDate: Date) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
}

const cumulative = (points: Point[]) => {
    let current = 0;
    let prevRate = 0;
    let prevDate: Date|null = null;
    const result = new Array();

    points.forEach(p => {
        let cum = 0;
        if (prevDate) {
            let days = daysBetween(prevDate, p.x);
            const avgRate = (prevRate + p.y) * 0.5;
            cum = avgRate * days;
        }

        current += cum;
        result.push({
            x: p.x,
            y: current,
        });
        prevRate = p.y;
        prevDate = p.x;
    });

    return result;
}

const cullPoints = (points: Point[], [start, end]:[Date, Date]) => {
    let s = 0;
    for (; s < points.length; ++s) {
        if (points[s].x.getTime() >= start.getTime()) {
            break;
        }
    }

    let e = 0;
    for (e = points.length; e > 0; --e) {
        if (points[e - 1].x.getTime() <= end.getTime()) {
            break;
        }
    }

    return points.slice(Math.max(0, s-1), Math.min(points.length, e+1));
}

////////////////////////////////////////////////////////////////////////////////
//
// Extensions 
//
////////////////////////////////////////////////////////////////////////////////

interface ExtAxisZoomProps extends AcCellProps {
    scale: d3.ScaleTime<any, any>,
    location: AcAxisLocation,
    onZoom: (zoomStart: Date, zoomEnd: Date) => void,
}

const ExtAxisZoom: React.FC<ExtAxisZoomProps> = (props) => {
    const halfTrack = 15;
    const halfTracker = 2;
    const rect = useCellRect();
    const [hoverTrack, setHoverTrack] = useState<number|null>(null);
    const [[dragStart, dragTrack], setDrag] = useState<(number|null)[]>([null, null]);

    const scale = props.scale.copy();
    const isBottom = props.location === "bottom";
    if (isBottom)
        scale.range([0, rect.width]);
    else
        scale.range([rect.height, 0]);

    const dt = (e: {clientX: number, clientY: number}) => {
        return isBottom
            ? e.clientX - rect.left - rect.rootLeft
            : e.clientY - rect.top - rect.rootTop;    
    }

    const mouseMove = (e: MouseEvent) => {
        const where = dt(e);
        setDrag(([s, _]) => [s, where]);
    };

    const mouseUp = (e: MouseEvent) => {
        setDrag(([s, t]) => {
            props.onZoom(scale.invert(s!), scale.invert(t!));
            return [null, null];
        });
        window.removeEventListener("mousemove", mouseMove);
        window.removeEventListener("mouseup", mouseUp);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        const where = dt(e);
        setDrag(([_, t]) => [where, where]);
        window.addEventListener("mouseup", mouseUp);
        window.addEventListener("mousemove", mouseMove);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        setHoverTrack(dt(e));
    };

    const onMouseLeave = (e: React.MouseEvent) => {
        setHoverTrack(null);
    };

    return <>
        {dragTrack != null
            ? <rect opacity="0.5"
                y={-halfTrack} 
                height={halfTrack * 2}
                width={Math.abs(dragTrack - dragStart!)}
                x={Math.min(dragTrack, dragStart!)}
                fill={"red"}
              />
            : null
        }
        { hoverTrack !== null || dragTrack != null
            ? <rect opacity="1.0"
                y={-halfTrack} 
                height={halfTrack * 2}
                width={halfTracker * 2}
                x={(dragTrack ?? hoverTrack)! - halfTracker}
                fill={"gray"}
              />
            : null
        }
        <rect opacity="0.0"
            y={-halfTrack}
            height={halfTrack * 2}
            width={rect.width}
            fill="black" 
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        />
    </>;
};

interface ExtBezierMultiplierProps extends AcCellProps {
    scale: d3.ScaleTime<any, any>,
    doMultiply: (getRatio: MultiplierCallback|null) => void,
}

interface ExtBezierMultiplierPoint {
    x: number,
    y: number,
}

interface ExtBezierMultiplierPoints {
    start: ExtBezierMultiplierPoint,
    middle: ExtBezierMultiplierPoint,
    end: ExtBezierMultiplierPoint,
}

const ExtBezierMultiplier: React.FC<ExtBezierMultiplierProps> = (props) => {
    const rect = useCellRect();
    const [drag, setDrag] = useState<ExtBezierMultiplierPoints|null>(null);

    const scale = props.scale.copy();
    scale.range([0, rect.width]);

    const dxy = (e: {clientX: number, clientY: number}) => ({
        x: e.clientX - rect.left - rect.rootLeft,
        y: e.clientY - rect.top - rect.rootTop,
    });

    const midpoint = (p1: ExtBezierMultiplierPoint, p2: ExtBezierMultiplierPoint) => ({
        x: 0.5 * (p1.x + p2.x),
        y: 0.5 * (p1.y + p2.y),
    });

    const xwithin = (n: ExtBezierMultiplierPoint, [min, max]: [number, number]) => ({
        x: Math.min(max, Math.max(min, n.x)),
        y: n.y,
    });

    const getRatio = (pts: ExtBezierMultiplierPoints) => {
        const start = pts.start.x < pts.end.x ? pts.start : pts.end;
        const end   = pts.start.x < pts.end.x ? pts.end : pts.start;
        const middle = pts.middle;

        return (date: Date) => {
            const x = scale(date);
            if (x >= start.x && x < middle.x) { // first half
                const extent = (middle.y - start.y) / -start.y;
                const mine = (start.x - x) / (start.x - middle.x);
                return 1.0 + (extent * (Math.pow(Math.abs(mine), 1.3)));
            }
            if (x <= pts.end.x && x >= middle.x) { // second half
                const extent = (middle.y - end.y) / -end.y;
                const mine = (x - end.x) / (middle.x - end.x);
                return 1.0 + (extent * (Math.pow(Math.abs(mine), 1.3)));
            }
            return 1.0
        };
    };

    const mouseMoveMiddle = (e: MouseEvent) => {
        const where = dxy(e);
        setDrag(old => {
            props.doMultiply(getRatio(old!));
            return {
                ...old!,
                middle: xwithin(where, [old!.start.x, old!.end.x])
            };
        });
    };

    const mouseMoveEnd = (e: MouseEvent) => {
        const where = dxy(e);
        setDrag(old => ({ ...old!,
                    middle: midpoint(old!.start, where),
                    end: where }));
    };

    const mouseDownMiddle = (e: MouseEvent) => {
        setDrag(old => {
            window.removeEventListener("mousemove", mouseMoveMiddle);
            window.removeEventListener("mousedown", mouseDownMiddle);
            props.doMultiply(null);
            return null;
        });
    };

    const mouseUpEnd = (e: MouseEvent) => {
        setDrag(old => {
            window.removeEventListener("mousemove", mouseMoveEnd);
            window.removeEventListener("mouseup", mouseUpEnd);
            window.addEventListener("mousedown", mouseDownMiddle);
            window.addEventListener("mousemove", mouseMoveMiddle);
            return { ...old! };
        });
    };

    const onMouseDown = (e: React.MouseEvent) => {
        const where = dxy(e);
        setDrag(old => {
            if (old != null) {
                return old;
            }

            window.addEventListener("mouseup", mouseUpEnd);
            window.addEventListener("mousemove", mouseMoveEnd);
            return {
                start: where,
                middle: where,
                end: where,
                mode: "end",
            };
        });
    };

    return <>
        {drag != null
            ? <>
                <line
                    x1={drag.start.x}
                    y1={drag.start.y}
                    x2={drag.middle.x}
                    y2={drag.middle.y}
                    stroke={"gray"}
                    strokeWidth={1} />
                <line
                    x1={drag.middle.x}
                    y1={drag.middle.y}
                    x2={drag.end.x}
                    y2={drag.end.y}
                    stroke={"gray"}
                    strokeWidth={1} />
                
                <path d={`M ${drag.start.x} ${drag.start.y} 
                            C ${0.5 * (drag.start.x + drag.middle.x)} ${0.5 * (drag.start.y + drag.middle.y)}, ${drag.start.x} ${drag.middle.y}, ${drag.middle.x} ${drag.middle.y}
                          M ${drag.end.x} ${drag.end.y}
                            C ${0.5 * (drag.end.x + drag.middle.x)} ${0.5 * (drag.end.y + drag.middle.y)}, ${drag.end.x} ${drag.middle.y}, ${drag.middle.x} ${drag.middle.y}
                        `} stroke="black" strokeWidth={2} fill="none"/>
              </>
            : null
        }
        <rect opacity="0.0"
            height={rect.height}
            width={rect.width}
            fill="black" 
            onMouseDown={onMouseDown}
        />
    </>;
};

////////////////////////////////////////////////////////////////////////////////
//
// AcChart
//
////////////////////////////////////////////////////////////////////////////////
interface AcRect
{
    rootTop: number,
    rootLeft: number,
    top: number,
    left: number,
    bottom: number,
    right: number,
    width: number,
    height: number,
}

interface AcSizing
{
    min: number,
    extra: number,
}

interface AcPosition
{
    r: number,
    c: number,
}

interface AcCellProps
{
    cell: string
}

const zeroRect = {rootTop: 0, rootLeft: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0};

const sizing = (el: any) => {
    if (el.type == AcChart)
        return [{min: 0, extra: 1.0}, {min: 0, extra: 1.0}];
    if (el.type == AcAxis) {
        if (el.props.location === "bottom")
            return [{min: 0, extra: 0.0}, {min: 45, extra: 0.0}];
        else
            return [{min: 65, extra: 0.0}, {min: 0, extra: 0.0}];
    }
        
    return [{min: 0, extra: 0.0}, {min: 0, extra: 0.0}];
}

const extractCell = (el: any) => {
    return el.props.cell;
}

const AcCellRect = React.createContext(zeroRect);

const useCellRect = () => useContext(AcCellRect);

interface AcTableProps
{
    layout: (string|null)[][],
    margin?: number,
}

const AcTable: React.FC<AcTableProps> = React.memo((props) => {
    const [rect, setRect] = useState<AcRect>(zeroRect);
    const margin = props.margin ?? 0;
    const ref = useRef(null);

    useEffect(() => {
        const onResize = () => {
            const dom: HTMLElement = ref.current!;
            const domRect = dom.parentElement!.getBoundingClientRect();
            setRect({
                rootTop: domRect.top,
                rootLeft: domRect.left,
                top: domRect.top,
                left: domRect.left,
                right: domRect.right,
                bottom: domRect.bottom,
                width: domRect.right - domRect.left,
                height: domRect.bottom - domRect.top,
            });
        };
        window.addEventListener("resize", onResize);
        onResize();
        return () => window.removeEventListener("resize", onResize);
    }, [ref]);

    const children = React.Children.toArray(props.children);
    const [rowMins, colMins, rowExtras, colExtras, extraX, extraY] = useMemo(() => {
        const rowMins = new Map<number, number>();
        const colMins = new Map<number, number>();
        const rowExtras = new Map<number, number>();
        const colExtras = new Map<number, number>();
    
        const locateCell = (cell: string) => {
            for (let r = 0; r < props.layout.length; ++r) {
                let row = props.layout[r];
                for (let c = 0; c < row.length; ++c) {
                    if (row[c] == cell) {
                        return [r, c];
                    }
                }
            }
        };
    
        children.forEach(child => {
            const cell = extractCell(child);
            const [r,c] = locateCell(cell)!;
    
            const [x, y] = sizing(child);
            colMins.set(c, Math.max(colMins.get(c) ?? 0, x.min));
            rowMins.set(r, Math.max(rowMins.get(r) ?? 0, y.min));
    
            colExtras.set(c, Math.max(colExtras.get(c) ?? 0, x.extra));
            rowExtras.set(r, Math.max(rowExtras.get(r) ?? 0, y.extra));
        });
    
        let extraX = 0;
        let extraY = 0;
        colExtras.forEach(val => extraX += val);
        rowExtras.forEach(val => extraY += val);
        return [rowMins, colMins, rowExtras, colExtras, extraX, extraY];
    }, [props.layout, props.children]);

    let leftOverX = rect.width - (margin * 2);
    let leftOverY = rect.height - (margin * 2);
    colMins.forEach(val => leftOverX -= val);
    rowMins.forEach(val => leftOverY -= val);

    const cellRects = new Map<string, AcRect>();
    let top = margin;
    props.layout.forEach((row, r) => { 
        let left = margin;
        const height = (rowMins.get(r) ?? 0) + (extraY == 0 ? 0 : (leftOverY * ((rowExtras.get(r) ?? 0) / extraY)));
        row.forEach((cell, c) => {
            const width = (colMins.get(c) ?? 0) + (extraX == 0 ? 0 : (leftOverX * ((colExtras.get(c) ?? 0) / extraX)));
            if (cell !== null) {
                cellRects.set(cell, {
                    rootTop: rect.rootTop,
                    rootLeft: rect.rootLeft,
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    right: left + width,
                    bottom: top + height,
                });
            }

            left += width;            
        });
        top += height;
    });

    const newChildren = new Array();
    children.forEach(child => {
        const cell = extractCell(child);
        if (cell) {
            const r = cellRects.get(cell)!;
            newChildren.push(<g transform={`translate(${r.left} ${r.top})`}>
                <AcCellRect.Provider value={r}>
                    { child }
                </AcCellRect.Provider>
            </g>);
        } else {
            newChildren.push(child);
        }
    });

    const clipPaths = new Array();
    cellRects.forEach((val, key) => {
        clipPaths.push(
            <clipPath id={key}>
                <rect x={0} y={0} width={val.width} height={val.height} />
            </clipPath>);
        });

    return <>
        <defs>{ clipPaths }</defs>
        <g ref={ref}>{ newChildren }</g>
    </>;
});

interface AcChartProps extends AcCellProps
{
}

const AcChart: React.FC<AcChartProps> = (props) => {
    const rect = useCellRect();
    return <g clipPath={`url(#${props.cell})`}>
        { React.Children.toArray(props.children) }
    </g>;
}

type AcAxisLocation = "left" | "bottom";

interface AcAxisProps extends AcCellProps
{
    scale: d3.ScaleTime<any, any> | d3.ScaleLinear<any, any>,
    location: AcAxisLocation,
    title?: string,
}

const AcAxis: React.FC<AcAxisProps> = React.memo((props) => {
    const ref = useRef(null);
    const rect = useCellRect();
    const scale = props.scale.copy();

    if (props.location === "bottom")
        scale.range([0, rect.width]);
    else
        scale.range([rect.height, 0]);

    useEffect(() => {
        let axis: any = null;
        if (props.location === "bottom")
            axis = d3.axisBottom(scale).ticks(rect.width / 200);
        else
            axis = d3.axisLeft(scale).ticks(rect.height / 80);
        d3.select(ref.current!).call(axis);
    });

    if (props.location === "bottom")
        return <g ref={ref} className="axis" transform={`translate(0 0)`} />;
    else 
        return <>
            <g ref={ref} className="axis" transform={`translate(${rect.width} 0)`} />
            <g transform={`rotate(-90) translate(${-rect.height / 2} 0)`} className="axis">
                <text width={rect.height} textAnchor="middle">{props.title ?? ""}</text>
            </g>
        </>;
});

interface AcSeriesProps
{
    points: Point[],
    xScale: d3.ScaleTime<any, any>,
    yScale: d3.ScaleLinear<any, any>,
}

const AcSeries = (props: AcSeriesProps) => {
    const rect = useCellRect();
    const points = props.points;

    const x = props.xScale.copy()
        .range([0, rect.width]);

    const y = props.yScale.copy()
        .range([rect.height, 0]);

    const path = d3.path();
    points.forEach((p, i) => {
        if (i === 0) 
            path.moveTo(x(p.x), y(p.y));
        else
            path.lineTo(x(p.x), y(p.y));
    });

    return <path d={path.toString()} fill="none" stroke="blue" strokeWidth="1" />
}
