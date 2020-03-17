import React, {useReducer} from 'react';
import {
  BrowserRouter as Router
, Switch
, Route
, Link
} from "react-router-dom";

import './App.css';
import {AppState, AppStateAction, generateState} from "./AppState";
import BizCharts from "./BizCharts";
import SvgD3 from "./SvgD3";
import SvgD32 from "./SvgD32";
import ReactVis from "./react-vis/vis-graph"
import VegaGraph from "./vega/vega-graph"
import RumbleChartsGraph from "./RumbleCharts/rumbleGraph";
import PlotlyGraph from "./plotly/plotlyGraph";
import {HighChartsGraph} from "./highcharts-react/highchartsGraph";
import {EchartsProtoType} from "./echartsForReact/EChartsProtoType";

export default () => {
    function reducer(state: AppState, action: AppStateAction) {
        switch (action.type) {
            case 'moveDowntime':
                return {
                    ...state,
                    streams: {
                        ...state.streams,
                        downtime: {
                            ...state.streams.downtime,
                            points: state.streams.downtime.points.map(p => (
                                { x: new Date(p.x.getTime() + action.value),
                                  y: p.y,
                                })),
                        },
                     },
                };
            default:
                throw new Error();
        }
    }
    
    const [appState, dispatch] = useReducer(reducer, generateState(15));
    
    return <Router>
        <header>
            <Link to="/bizcharts">BizCharts</Link>
            <Link to="/plottable">Plottable</Link>
            <Link to="/react-svg-d3">React SVG + D3</Link>
            <Link to="/react-svg-d32">React SVG Components</Link>
            <Link to="/react-vis">React-Vis</Link>
            <Link to="/vega">Vega</Link>
            <Link to="/RumbleCharts">Rumble Charts</Link>
            <Link to="/Plotly">Plotly</Link>
            <Link to="/HighCharts">High Charts</Link>
            <Link to="/Echarts">Echarts</Link>
        </header>

        <Switch>
            <Route path="/bizcharts">
                <BizCharts/>
            </Route>
            <Route path="/plottable">
                <div/>
            </Route>
            <Route path="/react-svg-d3">
                <SvgD3 appState={appState} onDrag={(timeInMs: number) => dispatch({type: 'moveDowntime', value: timeInMs})} />
            </Route>
            <Route path="/react-svg-d32">
                <SvgD32 appState={appState} onDrag={(timeInMs: number) => dispatch({type: 'moveDowntime', value: timeInMs})} />
            </Route>
            <Route path="/react-vis">
                <ReactVis/>
            </Route>
            <Route path="/vega">
                <VegaGraph/>
            </Route>
            <Route path="/RumbleCharts">
                <RumbleChartsGraph/>
            </Route>
            <Route path="/Plotly">
                <PlotlyGraph/>
            </Route>
            <Route path="/HighCharts">
                <HighChartsGraph/>
            </Route>
            <Route path="/Echarts">
                <EchartsProtoType appState={appState}/>
            </Route>
        </Switch>

    </Router>
}
