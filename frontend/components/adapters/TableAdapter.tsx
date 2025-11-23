'use client';

import { Table } from '@/components/core/Table';
import type { ComponentProps } from '../types';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export function TableAdapter({ data, config }: ComponentProps) {
  const rows = (data as Record<string, unknown>[]) || [];
  const columns = Array.isArray(config.columns) 
    ? (config.columns as TableColumn[]) 
    : [];

  return (
    <Table
      columns={columns}
      data={rows}
    />
  );
}

