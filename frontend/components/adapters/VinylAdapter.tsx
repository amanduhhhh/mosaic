'use client';

import { VinylCard } from '@/components/core/VinylCard';
import type { ComponentProps } from '../types';

export function VinylAdapter({ data, config, onInteraction }: ComponentProps) {
    const vinylData = (data as Record<string, unknown>) || {};
    const template = config.template || {};

    const title = template.primary
        ? vinylData[template.primary]
        : vinylData.title;
    const artist = template.secondary
        ? vinylData[template.secondary]
        : vinylData.artist;
    const image = vinylData.image as string | undefined;
    const label = config.layout || 'Most Played';

    return (
        <VinylCard
            title={title ? String(title) : 'Unknown'}
            artist={artist ? String(artist) : 'Unknown Artist'}
            image={image}
            label={label}
            onClick={() => onInteraction('click', { data: vinylData })}
        />
    );
}

