// packages/components/src/advanced/Crawl/Crawl.tsx

/**
 * @fileoverview Crawl Component - Thin wrapper with lazy loading
 * @description Cinematic 3D text crawl. Intro renders immediately (eager),
 * heavy 3D animation loads lazily after user clicks play.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  useState,
  useMemo,
  lazy,
  Suspense,
  type ReactNode,
  type CSSProperties,
} from 'react';

import { parseHtml } from './utils/parseHtml';
import { cn } from '../../utils/helpers';

// Lazy load heavy 3D animation content
const CrawlContent = lazy(() => import('./CrawlContent'));

/** Props for the Crawl component -- Star Wars-style scrolling text with 3D perspective. */
export interface CrawlProps {
  /** Optional intro text displayed with play button overlay. Accepts ReactNode or string. */
  intro?: ReactNode | string;
  /** Optional title rendered at the start of the crawl. Accepts ReactNode or string. */
  title?: ReactNode | string;
  /** Main crawl content. Accepts ReactNode, string (auto-paragraphs), or string[]. */
  content: ReactNode | string | string[];
  /** Duration of the crawl animation in seconds. @default 26 */
  duration?: number;
  /** Height of the content area in viewport units. @default "150vh" */
  contentHeight?: string;
  /** Tilt angle for the 3D perspective effect in degrees. */
  tiltAngle?: number;
  /** Custom CSS classes applied to the container */
  className?: string;
  /** Custom inline styles applied to the container */
  style?: CSSProperties;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

/**
 * Cinematic 3D text crawl component with lazy loading.
 *
 * ## Performance
 * - Intro overlay renders IMMEDIATELY (LCP-optimized)
 * - Heavy 3D animation lazy loads after user clicks play
 * - Zero initial bundle impact for animation code
 *
 * @version 0.1.0
 * @since 0.0.1
 */
const Crawl = ({
  content,
  intro,
  title,
  duration = 36,
  contentHeight = '150vh',
  tiltAngle,
  className,
  style,
  'aria-label': ariaLabel,
}: CrawlProps) => {
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  // Parse intro immediately (lightweight)
  const resolvedIntro = useMemo(() => {
    if (intro == null) return null;
    if (typeof intro === 'string') {
      // Guard against excessively large intro strings that cause jank during parsing
      const MAX_INTRO_LENGTH = 50000;
      const safeIntro =
        intro.length > MAX_INTRO_LENGTH
          ? intro.slice(0, MAX_INTRO_LENGTH)
          : intro;

      if (
        process.env.NODE_ENV === 'development' &&
        intro.length > MAX_INTRO_LENGTH
      ) {
        console.warn(
          `[Crawl] Intro string truncated from ${intro.length} to ${MAX_INTRO_LENGTH} characters`
        );
      }

      return (
        <div className="dndev-crawl-intro-text">
          {parseHtml(safeIntro, {
            allowedTags: ['u', 'br', 'i', 'em', 'strong', 'b'],
          })}
        </div>
      );
    }
    return intro;
  }, [intro]);

  const handlePlayClick = () => {
    setShowPlayOverlay(false);
  };

  return (
    <div
      className={cn(
        'dndev-crawl-container',
        'dndev-relative dndev-overflow-hidden',
        className
      )}
      style={{ ...style, height: 'calc(100dvh - var(--header-height))' }}
      aria-label={ariaLabel || 'Animated text crawl'}
      role="region"
      aria-live="polite"
    >
      {/* EAGER: Intro overlay renders immediately */}
      {showPlayOverlay && (
        <div
          className="dndev-absolute dndev-inset-0 dndev-flex dndev-flex-col dndev-items-center dndev-justify-center"
          style={{
            zIndex: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {resolvedIntro && (
            <div
              className="dndev-w-full"
              style={{
                paddingInline: 'var(--content-padding)',
                marginBottom: '3rem',
              }}
            >
              <div className="dndev-crawl-intro-content">{resolvedIntro}</div>
            </div>
          )}

          <button
            onClick={handlePlayClick}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '4px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
              transition: 'all var(--dur-normal) var(--ease-in-out)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Start animated introduction"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="white"
              style={{ marginInlineStart: '4px' }}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* LAZY: Heavy 3D content loads only after user clicks play */}
      {!showPlayOverlay && (
        <Suspense fallback={null}>
          <CrawlContent
            title={title}
            content={content}
            duration={duration}
            contentHeight={contentHeight}
            tiltAngle={tiltAngle}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Crawl;
