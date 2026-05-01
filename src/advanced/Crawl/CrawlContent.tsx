// packages/components/src/advanced/Crawl/CrawlContent.tsx

/**
 * @fileoverview CrawlContent - Heavy 3D animation content (lazy loaded)
 * @description Contains the 3D perspective animation, starfield, and text crawl.
 * Lazy loaded after user clicks play to keep initial bundle small.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  type ReactNode,
  type CSSProperties,
  isValidElement,
} from 'react';

const isClient = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

import { parseHtml } from './utils/parseHtml';

/** Props for the internal CrawlContent renderer. */
export interface CrawlContentProps {
  /** Optional title rendered at the start of the crawl */
  title?: ReactNode | string;
  /** Main crawl content */
  content: ReactNode | string | string[];
  /** Duration of the crawl animation in seconds */
  duration?: number;
  /** Height of the content area in viewport units */
  contentHeight?: string;
  /** Tilt angle for the 3D perspective effect */
  tiltAngle?: number;
  /** Callback when animation is paused */
  onPause?: () => void;
  /** Callback when animation resumes */
  onResume?: () => void;
}

/**
 * Heavy 3D crawl animation content - lazy loaded
 */
const CrawlContent = ({
  content,
  title,
  duration = 26,
  contentHeight = '150vh',
  tiltAngle,
  onPause,
  onResume,
}: CrawlContentProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Normalize title/content to ReactNodes
  const renderStringAsParagraphs = (value: string) => {
    if (!value || typeof value !== 'string') return null;
    const blocks = value
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter((block) => block.length > 0);
    return blocks.map((block, idx) => (
      <p key={`p-${idx}`}>
        {parseHtml(block, {
          allowedTags: ['u', 'br', 'i', 'em', 'strong', 'b'],
        })}
      </p>
    ));
  };

  const resolvedTitle = useMemo(() => {
    if (!title) return null;
    return typeof title === 'string' ? (
      <h2 className="dndev-crawl-title">
        {parseHtml(title, {
          allowedTags: ['u', 'br', 'i', 'em', 'strong', 'b'],
        })}
      </h2>
    ) : (
      title
    );
  }, [title]);

  const resolvedContent = useMemo(() => {
    if (isValidElement(content)) return content;
    if (Array.isArray(content)) {
      const items = (content as unknown[])
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((s) => s && s.length > 0);
      return items.map((item, idx) => (
        <p key={`c-${idx}`}>
          {parseHtml(item, {
            allowedTags: ['u', 'br', 'i', 'em', 'strong', 'b'],
          })}
        </p>
      ));
    }
    if (typeof content === 'string') {
      return renderStringAsParagraphs(content);
    }
    return content as ReactNode;
  }, [content]);

  // Animation style
  const animationStyle = useMemo(() => {
    const style: CSSProperties & { [key: string]: string } = {
      '--crawl-content-height': contentHeight,
      animationName: 'dndev-crawl-animation',
      animationDuration: `${duration}s`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      animationFillMode: 'forwards',
      animationPlayState: isPaused ? 'paused' : 'running',
    };

    if (tiltAngle !== undefined) {
      style['--crawl-tilt'] = `${tiltAngle}deg`;
    }

    return style;
  }, [isPaused, duration, contentHeight, tiltAngle]);

  // Handle reduced motion preference
  useEffect(() => {
    if (!isClient() || !textRef.current) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      if (mediaQuery.matches && textRef.current) {
        textRef.current.classList.add('dndev-crawl-reduced-motion');
      }
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle click to pause
  const handleClick = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume?.();
    } else {
      setIsPaused(true);
      onPause?.();
    }
  };

  return (
    <>
      {/* 3D Crawl Content */}
      <div className="dndev-crawl-3d-container" onClick={handleClick}>
        <div
          ref={textRef}
          className="dndev-crawl-text"
          style={{
            ...animationStyle,
            willChange: !isPaused ? 'transform' : 'auto',
          }}
        >
          <div className="dndev-crawl-content">
            {resolvedTitle}
            {resolvedContent}
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div
          className="dndev-absolute dndev-inset-0 dndev-flex dndev-items-center dndev-justify-center"
          style={{
            zIndex: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={handleClick}
        >
          <button
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
            aria-label="Resume animation"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        </div>
      )}

      {/* Starfield */}
      <div className="dndev-crawl-stars">
        <div className="dndev-crawl-stars-layer-1" />
        <div className="dndev-crawl-stars-layer-2" />
        <div className="dndev-crawl-stars-layer-3" />
      </div>
    </>
  );
};

export default CrawlContent;
