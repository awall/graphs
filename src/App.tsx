import React from 'react';
import {
  BrowserRouter as Router
, Switch
, Route
, Link
} from "react-router-dom";

import './App.css';
import {generateState} from "./AppState";
import BizCharts from "./BizCharts";
import SvgD3 from "./SvgD3";
import ReactVis from "./react-vis/vis-graph"
import VegaGraph from "./vega/vega-graph"
import RumbleChartsGraph from "./RumbleCharts/rumbleGraph";
import PlotlyGraph from "./plotly/plotlyGraph";
import {HighChartsGraph} from "./highcharts-react/HighChartsPrototype";
import {EchartsProtoType} from "./echartsForReact/EChartsProtoType"
import DraggablePoints from "./echartsForReact/DraggablePoints";
import SvgD32 from "./SvgD32";

const appState = generateState(20);

export default () => 
  (<Router>
    <header>
      <Link to="/bizcharts">BizCharts</Link>
      <Link to="/plottable">Plottable</Link>
      <Link to="/react-svg-d3">React SVG + D3</Link>
        <Link to="/react-vis">React-Vis</Link>
        <Link to="/vega">Vega</Link>
        <Link to="/RumbleCharts">Rumble Charts</Link>
        <Link to="/Plotly">Plotly</Link>
        <Link to="/HighCharts">High Charts</Link>
        <Link to="/Echarts">Echarts</Link>
        <Link to="/Drag">Draggable Echarts</Link>
    </header>

    <Switch>
      <Route path="/bizcharts">
          <BizCharts />
      </Route>
        <Route path="/react-svg-d3">
            <SvgD32 appState={appState}></SvgD32>
        </Route>
      <Route path="/plottable">
          <div />
      </Route>
        <Route path="/react-vis">
            <ReactVis />
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
            <HighChartsGraph appState={appState}/>
        </Route>
        <Route path="/Echarts">
            <EchartsProtoType appState={appState}/>
        </Route>
        <Route path="/Drag">
            <DraggablePoints/>
        </Route>
    </Switch>
      
  </Router>)
