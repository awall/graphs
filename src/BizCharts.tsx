import React from 'react';
import 
{ Chart
, Axis
, Tooltip
, Geom
} from "bizcharts";

const data = [
  {month: "January", temperature: 2},
  {month: "February", temperature: 3},
  {month: "March", temperature: 12},
];



export default () => (
    <Chart height={400} data={data} forceFit>
        <Axis name="month" />
        <Axis name="temperature" label={{formatter: (val: any) => `${val}°C`}} />
        <Tooltip crosshairs={{type : 'y'}} />
        <Geom type="line" position="month*temperature" size={2} color={'city'} />
        <Geom type="point" position="month*temperature" size={4} color={'city'} />
    </Chart>
)