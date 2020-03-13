export interface Point {
    x: Date,
    y: number,
}

export interface SelectedPoint extends Point {
    series: string,
}

export interface Series {
    name: string,
    unit: string,
    points: Point[],
}

export interface AppState {
    streams: {
        oil: Series,
        gas: Series,
        water: Series,
        downtime: Series,
    },
    selections: SelectedPoint[],
    yearSpan: number
}

export function generateState(yearSpan: number): AppState {
    function harmonic(qi: number, D: number, t: number) {
        return qi / (1 + D*t);
    }

    function monthlySeries(startYear: number, span: number): Point[] {
        return Array.from(Array(span * 12).keys())
            .map(i => ({
                x: new Date(startYear + (i / 12), (i % 12) + 1, 1),
                y: i,
            }));
    }

    function harmonize(qi: number, D: number, values: Point[]): Point[] {
        return values.map(i => ({x: i.x, y: harmonic(qi, D, i.y)}));
    }

    function randomize(values: Point[]): Point[] {
        return values.map(i => ({x: i.x, y: (0.9 + Math.random() * 0.2) * i.y }));
    }

    function evensOdds(even: number, odd: number, values: Point[]): Point[] {
        return values.map(i => ({x: i.x, y: i.y % 2 === 0 ? even : odd }));
    }

    return {
        streams: {
            oil: { name: "oil", unit: "bbl/d", points: randomize(harmonize(1000, 0.01, monthlySeries(2000, yearSpan)))},
            gas: { name: "gas", unit: "mcf/d", points: randomize(harmonize(8000, 0.008, monthlySeries(2000, yearSpan)))},
            water: { name: "water", unit: "T/d", points: randomize(harmonize(10, 0.009, monthlySeries(2002, yearSpan - 2)))},
            downtime: { name: "downtime", unit: "%", points: randomize(evensOdds(0.1, 0.3, monthlySeries(2000, yearSpan)))},
        },
        selections: [],
        yearSpan: yearSpan
    };
}