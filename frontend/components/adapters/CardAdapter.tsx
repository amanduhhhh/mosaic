'use client';

import { Card } from '@/components/core/Card';
import type { ComponentProps, CardData } from '../types';

export function CardAdapter({ data, config, onInteraction }: ComponentProps) {
  const cardData = (data as CardData) || {};
  const template = config.template || {};

  const title = template.primary
    ? cardData[template.primary]
    : cardData.title;
  const description = template.secondary
    ? cardData[template.secondary]
    : cardData.description;

  const variant = config.layout === 'metric' ? 'metric' : 
                  config.layout === 'stat' ? 'stat' : 
                  cardData.image ? 'image' :
                  'default';

  return (
    <Card
      variant={variant}
      title={title ? String(title) : undefined}
      subtitle={description ? String(description) : undefined}
      image={cardData.image ? String(cardData.image) : undefined}
      onClick={() => onInteraction('click', { data: cardData })}
    />
  );
}

