import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartRendererProps {
  type: string;
  data: any[];
  config?: {
    xKey?: string;
    yKey?: string;
    title?: string;
  };
}

export function ChartRenderer({ type, data, config }: ChartRendererProps) {
  const xKey = config?.xKey || 'x';
  const yKey = config?.yKey || 'y';

  const getOption = () => {
    const baseOption = {
      backgroundColor: 'transparent',
      title: {
        text: config?.title || '',
        textStyle: { color: '#fff', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d[xKey]),
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#333' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#333' } },
        splitLine: { lineStyle: { color: '#1a1a1a' } }
      },
      series: [
        {
          data: data.map(d => d[yKey]),
          type: type === 'area' ? 'line' : type,
          areaStyle: type === 'area' ? {} : undefined,
          smooth: true,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 }
        }
      ]
    };

    // Special handling for specific chart types
    if (type === 'pie') {
      return {
        ...baseOption,
        xAxis: undefined,
        yAxis: undefined,
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#000',
              borderWidth: 2
            },
            label: { show: false },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold',
                color: '#fff'
              }
            },
            data: data.map(d => ({ value: d[yKey], name: d[xKey] }))
          }
        ]
      };
    }

    if (type === 'radar') {
      return {
        ...baseOption,
        radar: {
          indicator: data.map(d => ({ name: d[xKey], max: Math.max(...data.map(i => i[yKey])) * 1.2 })),
          axisName: { color: '#666' },
          splitArea: { show: false },
          splitLine: { lineStyle: { color: '#333' } }
        },
        xAxis: undefined,
        yAxis: undefined,
        series: [
          {
            type: 'radar',
            data: [{ value: data.map(d => d[yKey]), name: 'Data' }],
            itemStyle: { color: '#10b981' },
            areaStyle: { opacity: 0.3 }
          }
        ]
      };
    }

    return baseOption;
  };

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: '100%', width: '100%' }}
      theme="dark"
    />
  );
}
