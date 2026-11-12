// packages/components/src/advanced/ImageGallery/protectImages.ts

/**
 * @fileoverview Image protection for the gallery and its lightbox
 * @description Gallery pictures are always protected: no context menu (right-click
 * "Copy / Save image"), no drag (`draggable={false}`), no iOS long-press callout
 * (ImageGallery.css). This stops casual copying; screenshots still work.
 *
 * @version 0.2.3
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

import type { MouseEvent } from 'react';

/**
 * `onContextMenu` handler for the gallery and lightbox roots: suppresses the
 * browser menu over every picture they contain.
 *
 * @param e - Context menu event bubbling from any element of the gallery
 */
export function blockContextMenu(e: MouseEvent): void {
  e.preventDefault();
}
