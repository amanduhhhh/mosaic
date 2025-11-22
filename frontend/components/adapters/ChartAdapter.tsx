'use client';

import { LineChart, BarChart } from '@/components/core';
import type { ComponentProps, ChartDataPoint } from '../types';

export function ChartAdapter({ data, config, onInteraction }: ComponentProps) {
  const points = (data as ChartDataPoint[]) || [];
  
  const chartType = config.layout === 'bar' ? 'bar' : 'line';
  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;

  return (
    <div onClick={(e) => {
      const target = e.target as HTMLElement;
      const pointIndex = target.getAttribute('data-point-index');
      if (pointIndex !== null) {
        const index = parseInt(pointIndex, 10);
        onInteraction('select', { point: points[index], index });
      }
    }}>
      <ChartComponent
        data={points}
        label={config.template?.primary}
        height={300}
      />
    </div>
  );
}

