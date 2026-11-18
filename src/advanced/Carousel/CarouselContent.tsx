// packages/components/src/advanced/Carousel/CarouselContent.tsx

/**
 * @fileoverview Carousel Component
 * @description Premium carousel component with advanced features including autoplay, transitions, and accessibility
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type TouchEvent,
  type KeyboardEvent,
  type ReactElement,
  memo,
} from 'react';

import Stack from '../../atomic/Stack';
import { addEventListener } from '../../utils/eventListener';
import { cn } from '../../utils/helpers';
import { observeElement } from '../../utils/intersectionObserver';
import { isRTLLanguage } from '../../utils/rtl';
import { withCssVars } from '../../utils/cssVars';

import './Carousel.css';

/**
 * Carousel props interface
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface CarouselProps<T = unknown> {
  /** Array of data items to render */
  items: T[];

  /** Function to render each item */
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;

  /** Optional className for the container */
  className?: string;

  /** Optional className for individual slides */
  slideClassName?: string;

  /** Whether to show navigation arrows */
  showArrows?: boolean;

  /** Whether to show scroll indicators (dots) */
  showDots?: boolean;

  /** Whether to show progress bar */
  showProgress?: boolean;

  /**
   * Whether to enable autoplay. Stops while the pointer or keyboard focus is inside,
   * and never runs under `prefers-reduced-motion: reduce`.
   * @default false
   */
  autoplay?: boolean;

  /** Autoplay interval in milliseconds */
  autoplayInterval?: number;

  /** Transition type */
  transition?: 'slide' | 'fade' | 'scale' | 'parallax';

  /**
   * Whether to loop infinitely (clones the edge slides; they come first in the server HTML).
   * @default false
   */
  infinite?: boolean;

  /**
   * Slides visible at once — static or responsive per breakpoint:
   * - number: fixed count at all breakpoints
   * - [number x4]: [mobile, tablet, laptop, desktop]
   * @default 1
   * @example 3 - always 3 slides
   * @example [1, 2, 3, 4] - responsive
   */
  slidesToShow?: number | [number, number, number, number];

  /** Gap between slides
   * @default 'none'
   */
  gap?: 'none' | 'tight' | 'medium' | 'large';

  /** Whether to enable swipe gestures */
  swipeable?: boolean;

  /** Whether to enable momentum scrolling */
  momentum?: boolean;

  /** Callback when active slide changes */
  onActiveChange?: (index: number) => void;

  /** Callback when slide is clicked */
  onSlideClick?: (item: T, index: number) => void;

  /** Optional unique key extractor */
  keyExtractor?: (item: T, index: number) => string | number;

  /**
   * Accessible name of the carousel region (WAI-ARIA carousel pattern).
   * @default 'Carousel'
   */
  'aria-label'?: string;

  /** Accessible name of the previous button @default 'Previous slide' */
  previousLabel?: string;

  /** Accessible name of the next button @default 'Next slide' */
  nextLabel?: string;

  /** Accessible name of the play button @default 'Play carousel' */
  playLabel?: string;

  /** Accessible name of the pause button @default 'Pause carousel' */
  pauseLabel?: string;

  /**
   * Slide name, also announced on slide change (1-based).
   * @default (current, total) => `Slide ${current} of ${total}`
   */
  slideLabel?: (current: number, total: number) => string;

  /**
   * Accessible name of a dot (1-based).
   * @default (index) => `Go to slide ${index}`
   */
  goToSlideLabel?: (index: number) => string;

  /** Text shown when `items` is empty @default 'No items to display' */
  emptyLabel?: string;

  /** Accessible name of the loading placeholder @default 'Loading carousel' */
  loadingLabel?: string;

  /** Whether to pause autoplay on hover */
  pauseOnHover?: boolean;

  /** Whether to pause autoplay when not visible */
  pauseOnInvisible?: boolean;

  /** Whether to show play/pause button (only when autoplay is enabled) */
  showPlayPause?: boolean;

  /** Whether to enable lazy loading */
  lazy?: boolean;

  /** Preload distance for lazy loading */
  preloadDistance?: number;
}

/** Imperative handle for controlling the Carousel programmatically. */
export interface CarouselRef {
  goToSlide: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  play: () => void;
  pause: () => void;
  getCurrentIndex: () => number;
}

const defaultSlideLabel = (current: number, total: number) =>
  `Slide ${current} of ${total}`;
const defaultGoToSlideLabel = (index: number) => `Go to slide ${index}`;

/** Controls are hidden until hovered; keyboard focus reveals them too (WCAG 2.4.7). */
const revealControl = (e: { currentTarget: HTMLElement }) => {
  e.currentTarget.style.opacity = '1';
};

function CarouselComponent<T = unknown>({
  items,
  renderItem,
  className,
  slideClassName,
  showArrows = true,
  showDots = false,
  showProgress = true,
  autoplay = false,
  autoplayInterval = 5000,
  transition = 'slide',
  infinite = false,
  slidesToShow = 1,
  gap = 'none',
  swipeable = true,
  momentum = true,
  onActiveChange,
  onSlideClick,
  keyExtractor,
  'aria-label': ariaLabel = 'Carousel',
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  playLabel = 'Play carousel',
  pauseLabel = 'Pause carousel',
  slideLabel = defaultSlideLabel,
  goToSlideLabel = defaultGoToSlideLabel,
  emptyLabel = 'No items to display',
  pauseOnHover = true,
  pauseOnInvisible = true,
  showPlayPause = true,
  lazy = false,
  preloadDistance = 1,
}: CarouselProps<T>) {
  // Normalize responsive slides — same pattern as Grid cols
  const slidesPerBreakpoint: [number, number, number, number] = Array.isArray(
    slidesToShow
  )
    ? slidesToShow
    : [slidesToShow, slidesToShow, slidesToShow, slidesToShow];
  const [mobileSlides, tabletSlides, laptopSlides, desktopSlides] =
    slidesPerBreakpoint;
  const maxSlides = Math.max(...slidesPerBreakpoint);
  // Infinite looping needs clones; with every item visible at once there is nothing to loop
  const loop = infinite && items.length > maxSlides;
  const cloneCount = loop ? Math.max(maxSlides, 2) : 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isPaused, setIsPaused] = useState(false);
  // Keyboard focus inside stops autoplay (WAI-ARIA carousel pattern)
  const [hasFocus, setHasFocus] = useState(false);
  // Off-screen slides become inert after hydration only: the server cannot know the breakpoint
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [isVisible, setIsVisible] = useState(true);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    currentX: 0,
    startTime: 0,
    velocity: 0,
  });
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State Machine (SSR safe, performant)
  const [state, setState] = useState<'idle' | 'transitioning'>('idle');

  // Check for reduced motion preference (SSR-safe)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    return addEventListener<MediaQueryListEvent>(
      mediaQuery,
      'change',
      handleChange
    );
  }, []);

  // Track current breakpoint for JS calculations (translateX, parallax, inert slides).
  // Starts at the mobile value on server AND client so hydration matches; the layout
  // effect below resolves the real breakpoint before the browser paints. Slide widths
  // come from CSS (Carousel.css), so the server HTML is already laid out correctly.
  const [currentSlides, setCurrentSlides] = useState(mobileSlides);

  useLayoutEffect(() => {

    const queries = [
      { mq: window.matchMedia('(min-width: 1440px)'), value: desktopSlides },
      { mq: window.matchMedia('(min-width: 1024px)'), value: laptopSlides },
      { mq: window.matchMedia('(min-width: 768px)'), value: tabletSlides },
    ];

    const resolve = () => {
      for (const { mq, value } of queries) {
        if (mq.matches) {
          setCurrentSlides(value);
          return;
        }
      }
      setCurrentSlides(mobileSlides);
    };

    resolve();
    const cleanups = queries.map(({ mq }) => {
      const handler = () => resolve();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [mobileSlides, tabletSlides, laptopSlides, desktopSlides]);

  // Spring physics for momentum scrolling
  const springConfig = useMemo(
    () => ({
      tension: 0.3,
      friction: 0.8,
      mass: 1.0,
    }),
    []
  );

  // Enhanced infinite loop with true circular DOM structure
  // Clone count uses maxSlides to ensure enough clones at every breakpoint
  const circularItems = useMemo(() => {
    if (!loop) return items;

    const beforeClones = items.slice(-cloneCount);
    const afterClones = items.slice(0, cloneCount);

    return [...beforeClones, ...items, ...afterClones];
  }, [items, loop, cloneCount]);

  // JS slide width for translateX calculations — synced with CSS via matchMedia
  const slideWidth = useMemo(() => {
    return 100 / currentSlides;
  }, [currentSlides]);

  // Active slide = center of visible slides, not leftmost
  // ceil(N/2)-1: 1→0, 2→0, 3→1, 4→1
  const activeOffset = Math.ceil(currentSlides / 2) - 1;

  // Last logical index that still fills the view (no blank space after the last slide)
  const maxIndex = Math.max(0, items.length - currentSlides);

  /** Track position of a logical index: after the clones when looping, else clamped to a full view. */
  const trackPosition = useCallback(
    (index: number) =>
      loop ? index + cloneCount : Math.max(0, Math.min(index, maxIndex)),
    [loop, cloneCount, maxIndex]
  );

  // Mount and breakpoint change: place the track on the current slide (first real
  // item when looping), re-clamped to a full view for the new slide count.
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const index = loop
      ? currentIndexRef.current
      : Math.min(currentIndexRef.current, maxIndex);
    if (index !== currentIndexRef.current) setCurrentIndex(index);
    track.style.transition = 'none';
    track.style.transform = `translateX(-${trackPosition(index) * slideWidth}%)`;
  }, [loop, maxIndex, trackPosition, slideWidth]);

  // Get the real index (accounting for clones)
  const getRealIndex = useCallback(
    (index: number) => {
      if (!loop) return index;
      return (
        (((index - cloneCount) % items.length) + items.length) % items.length
      );
    },
    [loop, items.length, cloneCount]
  );

  // Spring-based momentum animation
  const isVisibleRef = useRef(isVisible);
  isVisibleRef.current = isVisible;

  const animateWithSpring = useCallback(
    (track: HTMLDivElement, targetTranslateX: number, velocity: number = 0) => {
      if (!momentum) return;

      let currentTranslateX =
        parseFloat(
          track.style.transform.replace('translateX(', '').replace('%)', '')
        ) || 0;
      let currentVelocity = velocity;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const deltaTime = elapsed / 1000;

        const displacement = currentTranslateX - targetTranslateX;
        const springForce = -springConfig.tension * displacement;
        const dampingForce = -springConfig.friction * currentVelocity;
        const totalForce = springForce + dampingForce;

        const acceleration = totalForce / springConfig.mass;
        currentVelocity += acceleration * deltaTime;
        currentTranslateX += currentVelocity * deltaTime;

        track.style.transform = `translateX(${currentTranslateX}%)`;

        if (!isVisibleRef.current) {
          // Off-screen: snap to target, stop loop
          track.style.transform = `translateX(${targetTranslateX}%)`;
          track.style.transition = 'none';
          rafRef.current = null;
        } else if (
          Math.abs(displacement) > 0.1 ||
          Math.abs(currentVelocity) > 0.1
        ) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          track.style.transform = `translateX(${targetTranslateX}%)`;
          track.style.transition = 'none';
          rafRef.current = null;
        }
      };

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    },
    [momentum, springConfig]
  );

  // Apply transition effects based on transition type
  const applyTransitionEffect = useCallback(
    (track: HTMLDivElement, translateX: number, duration: string) => {
      switch (transition) {
        case 'fade': {
          track.style.transition = `opacity ${duration} ease-in-out`;
          track.style.opacity = '0';
          const fadeDuration = parseInt(duration, 10) || 300;
          if (transitionTimerRef.current)
            clearTimeout(transitionTimerRef.current);
          transitionTimerRef.current = setTimeout(() => {
            transitionTimerRef.current = null;
            track.style.transform = `translateX(${translateX}%)`;
            track.style.opacity = '1';
          }, fadeDuration / 2);
          break;
        }

        case 'scale': {
          track.style.transition = `transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          track.style.transform = `translateX(${translateX}%) scale(0.95)`;
          const scaleDuration = parseInt(duration, 10) || 300;
          if (transitionTimerRef.current)
            clearTimeout(transitionTimerRef.current);
          transitionTimerRef.current = setTimeout(() => {
            transitionTimerRef.current = null;
            track.style.transform = `translateX(${translateX}%) scale(1)`;
          }, scaleDuration / 2);
          break;
        }

        case 'parallax':
          track.style.transition = `transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          track.style.transform = `translateX(${translateX}%)`;
          const slides = track.querySelectorAll('[role="group"]');
          slides.forEach((slide, index) => {
            const slideElement = slide as HTMLElement;
            const parallaxOffset =
              (index - Math.abs(translateX) / slideWidth) * 0.1;
            slideElement.style.transform = `translateX(${parallaxOffset}%)`;
          });
          break;

        default:
          track.style.transition = `transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          track.style.transform = `translateX(${translateX}%)`;
          break;
      }
    },
    [transition, slideWidth]
  );

  // Smooth transition to index with proper circular handling
  // Infinite: slides to clone position, transitionEnd resets to real equivalent
  const goToSlide = useCallback(
    (targetIndex: number, immediate = false) => {
      if (state !== 'idle' && !immediate) return;
      // Skip animation when off-screen (save GPU)
      if (!isVisible && !immediate) return;

      const track = trackRef.current;
      if (!track) return;

      // Looping: offset into the real section — don't wrap, let it slide to clones.
      // Otherwise: clamped so the last view is full.
      const actualIndex = trackPosition(targetIndex);
      // Already there: nothing moves, so no transitionend would ever reset the state
      if (!loop && actualIndex === currentIndex && !immediate) return;

      const translateX = -(actualIndex * slideWidth);
      const duration = immediate || prefersReducedMotion ? '0ms' : '300ms';

      if (!immediate) setState('transitioning');

      applyTransitionEffect(track, translateX, duration);

      // Update logical index (wrap to valid range)
      const newIndex = loop
        ? ((targetIndex % items.length) + items.length) % items.length
        : actualIndex;
      setCurrentIndex(newIndex);
      onActiveChange?.(newIndex);

      // Schedule reset if we landed on a clone
      if (loop) {
        const isOnBeforeClone = actualIndex < cloneCount;
        const isOnAfterClone = actualIndex >= items.length + cloneCount;

        if (isOnBeforeClone || isOnAfterClone) {
          // Equivalent real position: shift by one full items.length
          const resetTarget = isOnBeforeClone
            ? actualIndex + items.length
            : actualIndex - items.length;
          track.dataset.needsReset = 'true';
          track.dataset.resetIndex = resetTarget.toString();
        }

        // For immediate transitions (0ms), transitionEnd won't fire — reset manually
        if (immediate && track.dataset.needsReset === 'true') {
          const resetIndex = parseInt(track.dataset.resetIndex || '0');
          track.style.transition = 'none';
          track.style.transform = `translateX(-${resetIndex * slideWidth}%)`;
          delete track.dataset.needsReset;
          delete track.dataset.resetIndex;
        }
      }
    },
    [
      loop,
      trackPosition,
      currentIndex,
      items.length,
      slideWidth,
      onActiveChange,
      prefersReducedMotion,
      state,
      isVisible,
      applyTransitionEffect,
    ]
  );

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (
      !isPlaying ||
      isPaused ||
      hasFocus ||
      prefersReducedMotion ||
      !isVisible ||
      items.length <= 1
    )
      return;

    autoplayRef.current = setTimeout(() => {
      goToNext();
    }, autoplayInterval);

    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, [
    isPlaying,
    isPaused,
    hasFocus,
    prefersReducedMotion,
    isVisible,
    currentIndex,
    goToNext,
    autoplayInterval,
    items.length,
  ]);

  // Visibility observer — always active, freezes all activity when off-screen
  useEffect(() => {
    if (!containerRef.current) return;

    const cleanup = observeElement(
      containerRef.current,
      (entry) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    return cleanup;
  }, []);

  // Cleanup rAF and transition timers on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (transitionTimerRef.current !== null) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, []);

  // Lazy loading logic
  const shouldLoadSlide = useCallback(
    (index: number) => {
      if (!lazy) return true;
      const distance = Math.abs(index - currentIndex);
      return distance <= preloadDistance;
    },
    [lazy, currentIndex, preloadDistance]
  );

  // Touch/swipe handling with momentum
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!swipeable || state !== 'idle') return;

      const touch = e.touches[0];
      if (!touch) return;

      setDragState({
        isDragging: true,
        startX: touch.clientX,
        currentX: touch.clientX,
        startTime: Date.now(),
        velocity: 0,
      });
    },
    [swipeable, state]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragState.isDragging) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - dragState.startX;
      const deltaTime = Date.now() - dragState.startTime;
      const velocity = deltaTime > 0 ? deltaX / deltaTime : 0;

      const track = trackRef.current;

      if (track && Math.abs(deltaX) > 10) {
        e.preventDefault();
        const currentTranslate = -(trackPosition(currentIndex) * slideWidth);
        const dragPercent =
          (deltaX / (containerRef.current?.clientWidth || 1)) * 100;

        const resistance = Math.min(Math.abs(deltaX) / 200, 0.8);
        const adjustedDragPercent = dragPercent * (1 - resistance);

        track.style.transition = 'none';
        track.style.transform = `translateX(${currentTranslate + adjustedDragPercent}%)`;
      }

      setDragState((prev) => ({
        ...prev,
        currentX: touch.clientX,
        velocity,
      }));
    },
    [
      dragState.isDragging,
      dragState.startX,
      dragState.startTime,
      currentIndex,
      slideWidth,
      trackPosition,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    const deltaX = dragState.currentX - dragState.startX;
    const velocity = dragState.velocity;
    const threshold = 50;

    if (momentum && Math.abs(velocity) > 0.5) {
      const track = trackRef.current;
      if (track) {
        const targetIndex = velocity > 0 ? currentIndex - 1 : currentIndex + 1;
        const targetTranslateX = -(trackPosition(targetIndex) * slideWidth);
        animateWithSpring(track, targetTranslateX, velocity * 100);
        goToSlide(targetIndex, true);
      }
    } else if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    } else {
      const track = trackRef.current;
      if (track && momentum) {
        const targetTranslateX = -(trackPosition(currentIndex) * slideWidth);
        animateWithSpring(track, targetTranslateX, velocity * 100);
      } else {
        goToSlide(currentIndex, true);
      }
    }

    setDragState({
      isDragging: false,
      startX: 0,
      currentX: 0,
      startTime: 0,
      velocity: 0,
    });
  }, [
    dragState,
    momentum,
    goToNext,
    goToPrevious,
    goToSlide,
    currentIndex,
    animateWithSpring,
    slideWidth,
    trackPosition,
  ]);

  // Transition Events (SSR safe, performant)
  const handleTransitionEnd = useCallback(() => {
    setState('idle');

    const track = trackRef.current;
    if (track?.dataset.needsReset === 'true') {
      const resetIndex = parseInt(track.dataset.resetIndex || '0');
      track.style.transition = 'none';
      track.style.transform = `translateX(-${resetIndex * slideWidth}%)`;

      delete track.dataset.needsReset;
      delete track.dataset.resetIndex;
    }
  }, [slideWidth]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Keys typed in slide content (links, buttons, inputs) keep their own behaviour
      if (e.target !== e.currentTarget) return;
      const isRTL = isRTLLanguage();

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          isRTL ? goToNext() : goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          isRTL ? goToPrevious() : goToNext();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(items.length - 1);
          break;
        case ' ':
          if (!autoplay) return;
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
      }
    },
    [
      goToNext,
      goToPrevious,
      goToSlide,
      items.length,
      isPlaying,
      play,
      pause,
      autoplay,
    ]
  );

  // Track position of the first visible slide (clones come first in infinite mode)
  const firstVisible = trackPosition(currentIndex);
  const autoplayRunning = isPlaying && !isPaused && !hasFocus;

  // Early return for empty items — placed after all hooks to satisfy Rules of Hooks
  if (!items || items.length === 0) {
    return (
      <Stack
        align="center"
        justify="center"
        className={cn('dndev-relative', className)}
      >
        <div style={{ color: 'var(--muted-foreground)' }}>
          {emptyLabel}
        </div>
      </Stack>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('dndev-relative dndev-overflow-hidden', className)}
      style={withCssVars({
        outline: 'none',
        '--carousel-slides-mobile': mobileSlides,
        '--carousel-slides-tablet': tabletSlides,
        '--carousel-slides-laptop': laptopSlides,
        '--carousel-slides-desktop': desktopSlides,
      })}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setHasFocus(false);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      {/* Main carousel track */}
      <div className="dndev-overflow-hidden">
        <div
          ref={trackRef}
          className={cn(
            'dndev-flex',
            dragState.isDragging && 'dndev-pointer-events-none',
            state === 'transitioning' && 'dndev-pointer-events-none'
          )}
          style={{
            cursor: dragState.isDragging ? 'grabbing' : undefined,
          }}
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {circularItems.map((item, index) => {
            const realIndex = getRealIndex(index);
            // Off-screen slides (and clones) are not focusable nor announced (WCAG 2.4.11)
            const offscreen =
              mounted &&
              items.length > currentSlides &&
              (index < firstVisible || index >= firstVisible + currentSlides);
            const isActive =
              realIndex === (currentIndex + activeOffset) % items.length;
            const shouldLoad = shouldLoadSlide(realIndex);

            return (
              <div
                key={
                  keyExtractor
                    ? keyExtractor(item, realIndex)
                    : `${realIndex}-${index}`
                }
                className={cn('dndev-carousel-slide', slideClassName)}
                data-gap={gap !== 'none' ? gap : undefined}
                style={{
                  opacity: shouldLoad ? 1 : 0,
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={slideLabel(realIndex + 1, items.length)}
                inert={offscreen || undefined}
                onClick={() => onSlideClick?.(item, realIndex)}
              >
                {shouldLoad && renderItem(item, realIndex, isActive)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            className="dndev-absolute dndev-z-breadcrumbs dndev-flex dndev-items-center dndev-justify-center"
            style={{
              insetInlineStart: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2.5rem',
              height: '2.5rem',
              opacity: 0,
              transition: 'opacity var(--dur-normal)',
              borderRadius: '9999px',
              backgroundColor: 'rgb(from var(--background) r g b / 0.8)',
              border: '1px solid var(--border)',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgb(from var(--background) r g b / 0.9)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgb(from var(--background) r g b / 0.8)';
            }}
            onFocus={revealControl}
            onClick={goToPrevious}
            type="button"
            aria-label={previousLabel}
          >
            <ChevronLeft
              style={{
                width: 'var(--icon-md)',
                height: 'var(--icon-md)',
                color: 'var(--foreground)',
              }}
            />
          </button>
          <button
            className="dndev-absolute dndev-z-breadcrumbs dndev-flex dndev-items-center dndev-justify-center"
            style={{
              insetInlineEnd: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2.5rem',
              height: '2.5rem',
              opacity: 0,
              transition: 'opacity var(--dur-normal)',
              borderRadius: '9999px',
              backgroundColor: 'rgb(from var(--background) r g b / 0.8)',
              border: '1px solid var(--border)',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgb(from var(--background) r g b / 0.9)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgb(from var(--background) r g b / 0.8)';
            }}
            onFocus={revealControl}
            onClick={goToNext}
            type="button"
            aria-label={nextLabel}
          >
            <ChevronRight
              style={{
                width: 'var(--icon-md)',
                height: 'var(--icon-md)',
                color: 'var(--foreground)',
              }}
            />
          </button>
        </>
      )}

      {/* Play/Pause button */}
      {autoplay && showPlayPause && (
        <button
          className="dndev-absolute dndev-z-breadcrumbs dndev-flex dndev-items-center dndev-justify-center"
          style={{
            insetBlockStart: 'var(--gap-md)',
            insetInlineEnd: 'var(--gap-md)',
            width: '2rem',
            height: '2rem',
            opacity: 0,
            transition: 'opacity var(--dur-normal)',
            borderRadius: '9999px',
            backgroundColor: 'rgb(from var(--background) r g b / 0.8)',
            border: '1px solid var(--border)',
            outline: 'none',
          }}
          type="button"
          onFocus={revealControl}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'rgb(from var(--background) r g b / 0.9)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              'rgb(from var(--background) r g b / 0.8)';
          }}
          onClick={() => (isPlaying ? pause() : play())}
          aria-label={isPlaying ? pauseLabel : playLabel}
        >
          {isPlaying ? (
            <Pause
              style={{
                width: 'var(--icon-md)',
                height: 'var(--icon-md)',
                color: 'var(--foreground)',
              }}
            />
          ) : (
            <Play
              style={{
                width: 'var(--icon-md)',
                height: 'var(--icon-md)',
                color: 'var(--foreground)',
              }}
            />
          )}
        </button>
      )}

      {/* Dots indicator */}
      {showDots && items.length > 1 && (
        <div
          className="dndev-absolute dndev-flex dndev-gap-sm dndev-z-breadcrumbs"
          style={{
            bottom: '1rem',
            insetInlineStart: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-current={index === currentIndex || undefined}
              style={{
                width: index === currentIndex ? '1.5rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '9999px',
                transition: 'all 0.3s',
                outline: 'none',
                backgroundColor:
                  index === currentIndex
                    ? 'var(--foreground)'
                    : 'rgb(from var(--foreground) r g b / 0.3)',
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.backgroundColor =
                    'rgb(from var(--foreground) r g b / 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.backgroundColor =
                    'rgb(from var(--foreground) r g b / 0.3)';
                }
              }}
              onClick={() => goToSlide(index)}
              aria-label={goToSlideLabel(index + 1)}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {showProgress && autoplay && (
        <div
          className="dndev-absolute"
          style={{
            bottom: 0,
            insetInlineStart: 0,
            insetInlineEnd: 0,
            height: '0.25rem',
            backgroundColor: 'rgb(from var(--foreground) r g b / 0.2)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((currentIndex + 1) / items.length) * 100}%`,
              backgroundColor: 'var(--foreground)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      )}

      {/* Screen reader announcements: silent while autoplay rotates (WAI-ARIA carousel pattern) */}
      <div
        className="dndev-sr-only"
        aria-live={autoplayRunning ? 'off' : 'polite'}
        aria-atomic="true"
      >
        {slideLabel(currentIndex + 1, items.length)}
      </div>
    </div>
  );
}

// Create typed generic component with display name
const MemoCarousel = memo(CarouselComponent);
MemoCarousel.displayName = 'Carousel';
// why: memo() erases the generic T; re-assert the generic call signature
const Carousel = MemoCarousel as <T = unknown>(
  props: CarouselProps<T>
) => ReactElement;

export default Carousel;
