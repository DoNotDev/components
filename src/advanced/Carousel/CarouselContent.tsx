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

  /** Whether to enable autoplay */
  autoplay?: boolean;

  /** Autoplay interval in milliseconds */
  autoplayInterval?: number;

  /** Transition type */
  transition?: 'slide' | 'fade' | 'scale' | 'parallax';

  /** Whether to enable infinite loop */
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

  /** Accessibility label */
  'aria-label'?: string;

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

function CarouselComponent<T = unknown>({
  items,
  renderItem,
  className,
  slideClassName,
  showArrows = true,
  showDots = false,
  showProgress = true,
  autoplay = true,
  autoplayInterval = 5000,
  transition = 'slide',
  infinite = true,
  slidesToShow = 1,
  gap = 'none',
  swipeable = true,
  momentum = true,
  onActiveChange,
  onSlideClick,
  keyExtractor,
  'aria-label': ariaLabel = 'Premium carousel',
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

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isPaused, setIsPaused] = useState(false);
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

  // Track current breakpoint for JS calculations (translateX, parallax)
  // Synchronous initial value — matchMedia is sync, avoids first-paint mismatch with CSS
  const [currentSlides, setCurrentSlides] = useState(() => {
    if (typeof window === 'undefined') return mobileSlides;
    if (window.matchMedia('(min-width: 1440px)').matches) return desktopSlides;
    if (window.matchMedia('(min-width: 1024px)').matches) return laptopSlides;
    if (window.matchMedia('(min-width: 768px)').matches) return tabletSlides;
    return mobileSlides;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    // Only listen for changes — initial value is already correct
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
    if (!infinite || items.length <= maxSlides) return items;

    const cloneCount = Math.max(maxSlides, 2);
    const beforeClones = items.slice(-cloneCount);
    const afterClones = items.slice(0, cloneCount);

    return [...beforeClones, ...items, ...afterClones];
  }, [items, infinite, maxSlides]);

  // JS slide width for translateX calculations — synced with CSS via matchMedia
  const slideWidth = useMemo(() => {
    return 100 / currentSlides;
  }, [currentSlides]);

  // Active slide = center of visible slides, not leftmost
  // ceil(N/2)-1: 1→0, 2→0, 3→1, 4→1
  const activeOffset = Math.ceil(currentSlides / 2) - 1;

  // Mount: position track at clone offset so first real item is visible (no flash)
  const mountedRef = useRef(false);
  useLayoutEffect(() => {
    if (
      mountedRef.current ||
      !infinite ||
      !trackRef.current ||
      items.length <= maxSlides
    )
      return;
    mountedRef.current = true;
    const cloneCount = Math.max(maxSlides, 2);
    trackRef.current.style.transform = `translateX(-${cloneCount * slideWidth}%)`;
  }, [infinite, maxSlides, slideWidth, items.length]);

  // Get the real index (accounting for clones)
  const getRealIndex = useCallback(
    (index: number) => {
      if (!infinite) return index;
      const cloneCount = Math.max(maxSlides, 2);
      return (
        (((index - cloneCount) % items.length) + items.length) % items.length
      );
    },
    [infinite, items.length, maxSlides]
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

      let actualIndex = targetIndex;

      if (infinite) {
        const cloneCount = Math.max(maxSlides, 2);
        // Offset into the real section — don't wrap, let it slide to clones
        actualIndex = targetIndex + cloneCount;
      } else {
        // Non-infinite: clamp to valid range
        actualIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
      }

      const translateX = -(actualIndex * slideWidth);
      const duration = immediate || prefersReducedMotion ? '0ms' : '300ms';

      if (!immediate) setState('transitioning');

      applyTransitionEffect(track, translateX, duration);

      // Update logical index (wrap to valid range)
      const newIndex = infinite
        ? ((targetIndex % items.length) + items.length) % items.length
        : actualIndex;
      setCurrentIndex(newIndex);
      onActiveChange?.(newIndex);

      // Schedule reset if we landed on a clone
      if (infinite) {
        const cloneCount = Math.max(maxSlides, 2);
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
      infinite,
      items.length,
      slideWidth,
      maxSlides,
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
    if (!isPlaying || isPaused || !isVisible || items.length <= 1) return;

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
        const cloneOffset = infinite ? Math.max(maxSlides, 2) : 0;
        const currentTranslate = -((currentIndex + cloneOffset) * slideWidth);
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
      infinite,
      maxSlides,
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
        const targetTranslateX = -(targetIndex * slideWidth);
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
        const targetTranslateX = -(currentIndex * slideWidth);
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
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
      }
    },
    [goToNext, goToPrevious, goToSlide, items.length, isPlaying, play, pause]
  );

  // Early return for empty items — placed after all hooks to satisfy Rules of Hooks
  if (!items || items.length === 0) {
    return (
      <Stack
        align="center"
        justify="center"
        className={cn('dndev-relative', className)}
      >
        <div style={{ color: 'var(--muted-foreground)' }}>
          No items to display
        </div>
      </Stack>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('dndev-relative dndev-overflow-hidden', className)}
      style={
        {
          outline: 'none',
          '--carousel-slides-mobile': mobileSlides,
          '--carousel-slides-tablet': tabletSlides,
          '--carousel-slides-laptop': laptopSlides,
          '--carousel-slides-desktop': desktopSlides,
        } as React.CSSProperties
      }
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      aria-live="polite"
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
                aria-label={`Slide ${realIndex + 1} of ${items.length}`}
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
            onClick={goToPrevious}
            aria-label="Previous slide"
            tabIndex={-1}
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
            onClick={goToNext}
            aria-label="Next slide"
            tabIndex={-1}
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
          tabIndex={-1}
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
          aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
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
              tabIndex={-1}
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
              aria-label={`Go to slide ${index + 1}`}
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

      {/* Screen reader announcements */}
      <div className="dndev-sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {items.length}
      </div>
    </div>
  );
}

// Create typed generic component with display name
const Carousel = memo(CarouselComponent) as <T = unknown>(
  props: CarouselProps<T>
) => ReactElement;
(Carousel as any).displayName = 'Carousel';

export default Carousel;
