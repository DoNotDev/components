// packages/components/src/advanced/ImageGallery/lightboxGestures.ts

/**
 * @fileoverview Lightbox gestures
 * @description The gestures of the lightbox that CSS cannot express: swipe up/down to
 * close, zoom (pinch, double-tap, click, ctrl+wheel), pan while zoomed, background tap
 * to close. Paging is not here: it is the native scroll-snap strip.
 *
 * Plain DOM, no React. Per-frame work during a gesture is one requestAnimationFrame
 * writing compositor-only properties (`transform`, `translate`, `opacity`). Geometry is
 * measured once when a gesture starts. Settles are CSS transitions, switched on by the
 * `data-settle` attribute.
 *
 * Attributes set on the root (styled in ImageGallery.css):
 * - `data-closing`: the current slide is / was dragged vertically
 * - `data-zoomed`: the image is zoomed (the strip stops paging)
 * - `data-settle`: the next write animates (`momentum`: the pan glide after a fling)
 *
 * Pan and pinch are elastic past the image edges and zoom limits (rubber band), then
 * settle back. A flung pan glides on: the end point is projected from the release
 * velocity and reached by a CSS transition, so the glide costs no JS frames.
 *
 * @version 0.1.0
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

/** Movement (px) before a press becomes a drag; below it, a release is a tap. */
const DRAG_SLOP = 8;
/** Fraction of the viewer height a vertical drag must cover to close. */
const CLOSE_DISTANCE_RATIO = 0.15;
/** Release speed (px/ms) that closes regardless of distance. */
const FLICK_VELOCITY = 0.4;
/** Drag distance, as a fraction of the viewer height, at which the backdrop is fully faded. */
const BACKDROP_FADE_RATIO = 0.5;
/** Max delay (ms) and distance (px) between the two taps of a double-tap. */
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 24;
/** Zoom level of a double-tap / click (capped at the max zoom). */
const TAP_ZOOM = 2.5;
/** The max zoom never goes below this, even for an image displayed at native size. */
const MIN_MAX_ZOOM = 2;
/** ctrl+wheel (trackpad pinch) zoom sensitivity. */
const WHEEL_ZOOM_SPEED = 0.01;
/** Share of a drag past an edge / zoom limit that moves the image (rubber band). */
const RUBBER = 0.35;
/** Release speed (px/ms) under which a pan stops dead instead of gliding. */
const GLIDE_MIN_VELOCITY = 0.05;
/** A pointer still for this long (ms) before release has no fling velocity. */
const FLING_STALE_MS = 60;
/**
 * Glide distance per unit of release velocity (ms). The glide is the
 * `data-settle='momentum'` transition: `--dur-slow` (500ms) on `--ease-heavy`
 * (cubic-bezier(0.22, 1, 0.36, 1), initial slope 1 / 0.22). Distance = velocity x 500 x 0.22,
 * so the glide starts at the finger's speed. Keep in step with those tokens.
 */
const GLIDE_MS = 110;

interface Point {
  x: number;
  y: number;
}

/**
 * - `press`: one pointer down, not moved yet (a release is a tap)
 * - `close`: vertical drag of the unzoomed slide
 * - `pan`: one-pointer drag of the zoomed image
 * - `pinch`: two pointers
 * - `idle`: nothing of ours (no pointer, or a horizontal drag: the strip's business)
 */
type Mode = 'idle' | 'press' | 'close' | 'pan' | 'pinch';

/** Elements and callback of {@link attachLightboxGestures}. */
export interface LightboxGestureTargets {
  /** The viewer: receives the pointer and wheel events and the state attributes */
  root: HTMLElement;
  /** Opaque layer behind the slides, faded by the close drag */
  backdrop: HTMLElement;
  /** The current slide, moved by the close drag */
  slide: HTMLElement;
  /** Box of the current image (exactly the image once sized): zoomed, panned, hit-tested */
  frame: HTMLElement;
  /** The current full-size image: its resolution caps the zoom */
  img: HTMLImageElement;
  /** Called when a gesture closes the viewer (swipe up/down, background tap) */
  onClose: () => void;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Like clamp, but past a limit only a share of the overshoot is kept (rubber band). */
const rubber = (value: number, min: number, max: number): number =>
  value < min
    ? min - (min - value) * RUBBER
    : value > max
      ? max + (value - max) * RUBBER
      : value;

/**
 * Attaches the close / zoom / pan gestures of the lightbox to its current slide.
 * Call it again with the new slide after a page turn.
 *
 * Known limitation: a pinch that starts once a one-finger horizontal scroll is under way
 * is not seen (the browser took the touch for scrolling and cancelled its pointer).
 * Lifting the finger and pinching again works.
 *
 * @param targets - The viewer elements and the close callback
 * @returns Detach function: removes the listeners and resets zoom and drag
 */
export function attachLightboxGestures({
  root,
  backdrop,
  slide,
  frame,
  img,
  onClose,
}: LightboxGestureTargets): () => void {
  /** View: zoom, pan (px from the viewer centre) and close-drag offset. */
  let scale = 1;
  let x = 0;
  let y = 0;
  let dragY = 0;

  /** Geometry, measured when a gesture starts. */
  let centerX = 0;
  let centerY = 0;
  let width = 0;
  let height = 0;
  let imgWidth = 0;
  let imgHeight = 0;
  let maxScale = MIN_MAX_ZOOM;

  /** Gesture. */
  const pointers = new Map<number, Point>();
  let mode: Mode = 'idle';
  let pressedImage = false;
  /** Reference point and view the running gesture is computed from. */
  let anchor: Point = { x: 0, y: 0 };
  let from = { scale, x, y };
  let pinchSpread = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let lastTap: (Point & { time: number }) | undefined;
  let frameId = 0;

  const measure = (): void => {
    const rect = root.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    width = rect.width;
    height = rect.height;
    imgWidth = frame.offsetWidth;
    imgHeight = frame.offsetHeight;
    maxScale =
      imgWidth > 0 && img.naturalWidth > 0
        ? Math.max(MIN_MAX_ZOOM, img.naturalWidth / imgWidth)
        : MIN_MAX_ZOOM;
  };

  /** Writes the view. Compositor-only properties; at rest, no inline style at all. */
  const render = (): void => {
    frameId = 0;
    frame.style.transform =
      scale === 1 && x === 0 && y === 0
        ? ''
        : `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    slide.style.translate = dragY === 0 ? '' : `0 ${dragY}px`;
    // GOTCHA: fade the backdrop with `opacity` on its own element, never by animating
    // its colour (background-color, color-mix, a custom property): a colour change
    // repaints the full screen every frame, opacity is composited.
    backdrop.style.opacity =
      dragY === 0
        ? ''
        : String(1 - Math.min(Math.abs(dragY) / (height * BACKDROP_FADE_RATIO), 1));
    root.toggleAttribute('data-zoomed', scale > 1);
  };

  /** At most one write per frame while a gesture runs. */
  const schedule = (): void => {
    frameId ||= requestAnimationFrame(render);
  };

  /** Writes now, as the target of a CSS transition when `animated` (`'momentum'`: glide). */
  const commit = (animated: boolean | 'momentum'): void => {
    cancelAnimationFrame(frameId);
    if (animated === false) root.removeAttribute('data-settle');
    else root.setAttribute('data-settle', animated === true ? '' : animated);
    render();
  };

  /**
   * Stops a running settle where it is on screen: reads the in-flight transform and
   * translate once (only while a settle may run), so a new gesture or wheel picks the
   * image up mid-glide instead of jumping to the settle's end.
   */
  const stopSettle = (): void => {
    if (!root.hasAttribute('data-settle')) return;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(frame).transform);
    scale = matrix.a;
    x = matrix.e;
    y = matrix.f;
    const translate = getComputedStyle(slide).translate;
    dragY =
      translate === 'none' ? 0 : parseFloat(translate.split(' ')[1] ?? '0');
    commit(false);
  };

  /** Pan limits at a zoom: the image edges never come inside the viewer edges. */
  const panLimits = (atScale: number): Point => ({
    x: Math.max(0, (imgWidth * atScale - width) / 2),
    y: Math.max(0, (imgHeight * atScale - height) / 2),
  });

  /**
   * Zooms the `from` view to `next`, moving the content under client point (px, py) to
   * client point (qx, qy). Hard limits for taps and wheel; `elastic` (live pinch / pan)
   * lets the image stretch past them, {@link settle} brings it back.
   */
  const zoomAbout = (
    next: number,
    px: number,
    py: number,
    qx = px,
    qy = py,
    elastic = false
  ): void => {
    const limit = elastic ? rubber : clamp;
    scale = limit(next, 1, maxScale);
    const ratio = scale / from.scale;
    const max = panLimits(scale);
    x = limit(qx - centerX - (px - centerX - from.x) * ratio, -max.x, max.x);
    y = limit(qy - centerY - (py - centerY - from.y) * ratio, -max.y, max.y);
  };

  /**
   * End of a pan / pinch: back inside the limits, or, after a fling of an image inside
   * them, a glide along the release velocity (projected end point, CSS transition).
   */
  const settle = (fling: boolean): void => {
    const target = clamp(scale, 1, maxScale);
    if (target !== scale) {
      // Back from an over- / under-pinch, about the viewer centre.
      const ratio = target / scale;
      x *= ratio;
      y *= ratio;
      scale = target;
    }
    const max = panLimits(scale);
    const inside = Math.abs(x) <= max.x && Math.abs(y) <= max.y;
    const glide =
      fling && inside && Math.hypot(velocityX, velocityY) > GLIDE_MIN_VELOCITY;
    x = clamp(glide ? x + velocityX * GLIDE_MS : x, -max.x, max.x);
    y = clamp(glide ? y + velocityY * GLIDE_MS : y, -max.y, max.y);
    commit(glide ? 'momentum' : true);
  };

  /** Drags the zoomed image by the pointer's offset from `anchor`, elastic past the edges. */
  const panTo = (point: Point): void => {
    const max = panLimits(scale);
    x = rubber(from.x + point.x - anchor.x, -max.x, max.x);
    y = rubber(from.y + point.y - anchor.y, -max.y, max.y);
  };

  /** Smoothed pointer velocity (px/ms), for flings. */
  const track = (e: PointerEvent): void => {
    const dt = e.timeStamp - lastTime;
    if (dt <= 0) return;
    velocityX = 0.8 * ((e.clientX - lastX) / dt) + 0.2 * velocityX;
    velocityY = 0.8 * ((e.clientY - lastY) / dt) + 0.2 * velocityY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = e.timeStamp;
  };

  const snapshot = (): void => {
    from = { scale, x, y };
  };

  const toggleZoom = (px: number, py: number): void => {
    snapshot();
    zoomAbout(scale > 1 ? 1 : Math.min(TAP_ZOOM, maxScale), px, py);
    commit(true);
  };

  /** Two (first) pointers: distance and midpoint. */
  const pinch = (): { spread: number; mid: Point } => {
    const [a, b] = [...pointers.values()];
    if (!a || !b) return { spread: 0, mid: anchor };
    return {
      spread: Math.hypot(b.x - a.x, b.y - a.y),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  // GOTCHA: the strip is `touch-action: pan-x`, so the browser owns a one-finger
  // horizontal drag and cancels its pointer the moment it scrolls. A second finger
  // landing after that never makes a pinch here (one pointer only). Do not "fix" it
  // with `touch-action: none` + JS paging: that trades native scrolling for this edge.
  const startPinch = (): void => {
    const { spread, mid } = pinch();
    mode = 'pinch';
    pinchSpread = spread;
    anchor = mid;
    dragY = 0;
    snapshot();
  };

  const onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest('button')) return;
    root.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    stopSettle();
    if (pointers.size > 1) {
      startPinch();
      commit(false);
      return;
    }
    measure();
    mode = 'press';
    pressedImage = e.target instanceof Node && frame.contains(e.target);
    anchor = { x: e.clientX, y: e.clientY };
    snapshot();
    velocityX = 0;
    velocityY = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = e.timeStamp;
  };

  const onPointerMove = (e: PointerEvent): void => {
    const point = pointers.get(e.pointerId);
    if (!point) return;
    point.x = e.clientX;
    point.y = e.clientY;

    if (mode === 'pinch') {
      const { spread, mid } = pinch();
      zoomAbout(
        (from.scale * spread) / pinchSpread,
        anchor.x,
        anchor.y,
        mid.x,
        mid.y,
        true
      );
      schedule();
      return;
    }

    const dx = point.x - anchor.x;
    const dy = point.y - anchor.y;
    if (mode === 'press') {
      if (Math.hypot(dx, dy) < DRAG_SLOP) return;
      if (scale > 1) {
        mode = 'pan';
      } else if (Math.abs(dy) > Math.abs(dx)) {
        mode = 'close';
        root.toggleAttribute('data-closing', true);
      } else {
        mode = 'idle';
      }
    }
    if (mode === 'pan') {
      track(e);
      panTo(point);
    } else if (mode === 'close') {
      track(e);
      dragY = dy;
    } else {
      return;
    }
    schedule();
  };

  const onTap = (e: PointerEvent): void => {
    if (!pressedImage) {
      onClose();
      return;
    }
    // Mouse: a click zooms in / out. Touch and pen: a double-tap does.
    if (e.pointerType === 'mouse') {
      toggleZoom(e.clientX, e.clientY);
      return;
    }
    const double =
      lastTap !== undefined &&
      e.timeStamp - lastTap.time < DOUBLE_TAP_MS &&
      Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < DOUBLE_TAP_SLOP;
    lastTap = double
      ? undefined
      : { x: e.clientX, y: e.clientY, time: e.timeStamp };
    if (double) toggleZoom(e.clientX, e.clientY);
  };

  /** pointerup and pointercancel. */
  const onPointerEnd = (e: PointerEvent): void => {
    if (!pointers.delete(e.pointerId)) return;
    const [remaining, other] = [...pointers.values()];
    if (remaining && other) {
      startPinch();
      return;
    }
    if (remaining) {
      // One finger of a pinch stays down: it pans on from where the pinch left the image.
      anchor = { ...remaining };
      velocityX = 0;
      velocityY = 0;
      lastX = remaining.x;
      lastY = remaining.y;
      lastTime = e.timeStamp;
      snapshot();
      if (scale > 1) {
        mode = 'pan';
      } else {
        // Pinched below fit: back to fit; the remaining finger does nothing.
        mode = 'idle';
        settle(false);
      }
      return;
    }

    const ended = mode;
    mode = 'idle';
    const released = e.type === 'pointerup';

    if (ended === 'close') {
      const flick =
        Math.abs(velocityY) > FLICK_VELOCITY &&
        Math.sign(velocityY) === Math.sign(dragY);
      if (
        released &&
        (Math.abs(dragY) > height * CLOSE_DISTANCE_RATIO || flick)
      ) {
        commit(false);
        onClose();
        return;
      }
      dragY = 0;
      commit(true);
      return;
    }
    if (ended === 'pan' || ended === 'pinch') {
      settle(
        ended === 'pan' && released && e.timeStamp - lastTime < FLING_STALE_MS
      );
      return;
    }
    commit(false);
    if (ended === 'press' && released) onTap(e);
  };

  const onWheel = (e: WheelEvent): void => {
    // ctrl+wheel = trackpad pinch (and ctrl + mouse wheel): zoom about the cursor.
    // A plain wheel pans the zoomed image and is left alone otherwise (strip paging).
    if (!e.ctrlKey && scale === 1) return;
    e.preventDefault();
    stopSettle();
    if (scale === 1) measure();
    snapshot();
    if (e.ctrlKey) {
      zoomAbout(
        scale * Math.exp(-e.deltaY * WHEEL_ZOOM_SPEED),
        e.clientX,
        e.clientY
      );
    } else {
      zoomAbout(scale, 0, 0, -e.deltaX, -e.deltaY);
    }
    schedule();
  };

  /** Back to the unzoomed, undragged view, without animation. */
  const reset = (): void => {
    scale = 1;
    x = 0;
    y = 0;
    dragY = 0;
    commit(false);
  };

  const listeners = new AbortController();
  const { signal } = listeners;
  root.addEventListener('pointerdown', onPointerDown, { signal });
  root.addEventListener('pointermove', onPointerMove, { signal });
  root.addEventListener('pointerup', onPointerEnd, { signal });
  root.addEventListener('pointercancel', onPointerEnd, { signal });
  // Non-passive: ctrl+wheel must cancel the browser's page zoom.
  root.addEventListener('wheel', onWheel, { signal, passive: false });
  // The measured geometry is void after a resize / rotation.
  window.addEventListener('resize', reset, { signal });

  return () => {
    listeners.abort();
    reset();
    root.removeAttribute('data-closing');
  };
}
