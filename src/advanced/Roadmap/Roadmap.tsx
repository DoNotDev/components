// packages/components/src/advanced/Roadmap/Roadmap.tsx

/**
 * @fileoverview Roadmap Component
 * @description Timeline component with horizontal (desktop) / vertical (mobile) layout.
 * Features animated progress line, glowing nodes, and lift-on-hover cards.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import RoadmapContent from './RoadmapContent';

import type { ComponentProps } from 'react';

export type { RoadmapProps, RoadmapStep } from './RoadmapContent';

const Roadmap = function Roadmap(props: ComponentProps<typeof RoadmapContent>) {
  return <RoadmapContent {...props} />;
};

export default Roadmap;
