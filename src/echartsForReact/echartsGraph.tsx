import React from 'react';
import ReactEcharts from 'echarts-for-react';
// @ts-ignore
import echarts from 'echarts';

echarts.registerTheme('my_theme', {
    backgroundColor: '#f4cccc'
});

const data = [820, 932, 901, 934, 1290, 1330, 1320];

const init = {
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: data,
        type: 'line',
    }],
    graphic: echarts.util.map(data, (item : any, dataIndex: any) => {
        return {
            type : 'circle',
            draggable: 'true'
        }
    })
};

export const EchartsGraph = () => {
    
   const [option, setOption] = React.useState(init); 
   
   const events = {
       'click' : onClick,
   };
   
   function onClick(params : any, echarts : any){
       let newOption = option;
       newOption['series'] =  [{
           data: [50, 932, 901, 934, 1290, 1330, 1320],
           type: 'line'
       }];
       setOption(newOption)
   }
   
   return <ReactEcharts option={option} onEvents={events} opts={{renderer:'svg'}}/>
};