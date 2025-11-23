import type { ComponentRegistry } from './types';
import {
  CardAdapter,
  ListAdapter,
  ChartAdapter,
  TimelineAdapter,
  GridAdapter,
  TableAdapter,
  VinylAdapter,
  CalendarAdapter,
} from './adapters';
import { ClickablePrimitive } from './primitives';

export const WIDGET_MAP: ComponentRegistry = {
  List: ListAdapter,
  Card: CardAdapter,
  Chart: ChartAdapter,
  Grid: GridAdapter,
  Timeline: TimelineAdapter,
  Table: TableAdapter,
  Vinyl: VinylAdapter,
  Calendar: CalendarAdapter,
  Clickable: ClickablePrimitive,
};

// export const COMPONENT_REGISTRY: ComponentRegistry = {
//   List: ListPlaceholder,
//   Card: CardPlaceholder,
//   Chart: ChartPlaceholder,
//   Grid: GridPlaceholder,
//   Timeline: TimelinePlaceholder,
//   Table: TablePlaceholder,
//   Clickable: ClickablePlaceholder,
// };

