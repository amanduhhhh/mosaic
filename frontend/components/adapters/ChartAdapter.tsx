'use client';

import { LineChart, BarChart } from '@/components/core';
import type { ComponentProps } from '../types';

interface ChartItem {
  [key: string]: string | number | undefined;
}

export function ChartAdapter({ data, config, onInteraction }: ComponentProps) {
  const items = (data as ChartItem[]) || [];
  
  const xField = config.template?.x || config.template?.label || 'label';
  const yField = config.template?.y || config.template?.value || 'value';

  const points = items.map(item => ({
    label: String(item[xField] ?? ''),
    value: Number(item[yField] ?? 0),
    original: item,
  }));
  
  const chartType = config.layout === 'bar' ? 'bar' : 'line';
  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;

  return (
    <div onClick={(e) => {
      const target = e.target as HTMLElement;
      const pointIndex = target.getAttribute('data-point-index');
      if (pointIndex !== null && onInteraction) {
        const index = parseInt(pointIndex, 10);
        onInteraction({ clickedData: points[index].original });
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

