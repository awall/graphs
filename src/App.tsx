import React from 'react';
import {
  BrowserRouter as Router
, Switch
, Route
, Link
} from "react-router-dom";

import './App.css';
import BizCharts from "./BizCharts";
import SvgD3 from "./SvgD3";
import ReactVis from "./react-vis/vis-graph"
import VegaGraph from "./vega/vega-graph"
import RumbleChartsGraph from "./RumbleCharts/rumbleGraph";
export default () => 
  (<Router>
    <header>
      <Link to="/bizcharts">BizCharts</Link>
      <Link to="/plottable">Plottable</Link>
      <Link to="/react-svg-d3">React SVG + D3</Link>
        <Link to="/react-vis">React-Vis</Link>
        <Link to="/vega">Vega</Link>
        <Link to="/RumbleCharts">Rumble Charts</Link>
    </header>

    <Switch>
      <Route path="/bizcharts">
          <BizCharts />
      </Route>
      <Route path="/plottable">
          <div />
      </Route>
      <Route path="/react-svg-d3">
          <SvgD3 />
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
    </Switch>
      
  </Router>)