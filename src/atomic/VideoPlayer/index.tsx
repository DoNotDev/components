// packages/components/src/atomic/VideoPlayer/index.tsx

/**
 * @fileoverview VideoPlayer component
 * @description Video player with modal support for YouTube/Vimeo embeds. Supports inline and modal display modes with automatic URL conversion for popular video platforms.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn } from '../../utils/helpers';
import Button, { BUTTON_VARIANT } from '../Button';
import Dialog from '../Dialog';
import Spinner from '../Spinner';

/**
 * Video configuration object for explicit URL construction
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface VideoConfig {
  /** Video platform */
  platform: 'youtube' | 'vimeo';
  /** Video ID */
  id: string;
  /**
   * Enable cookies (default: false = privacy-first nocookie URLs)
   * @default false
   */
  withCookies?: boolean;
}

/**
 * VideoPlayer component props
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface VideoPlayerProps {
  /**
   * Video URL - accepts string (used as-is) or object (framework constructs URL)
   *
   * **String URL**: Full URL used as-is. User's responsibility to provide correct embed URL.
   * - Thumbnail: Must provide `thumbnail` prop (no auto-generation)
   * - Use when you need full control over embed URL
   *
   * **VideoConfig Object**: Framework constructs privacy-first URL from parts.
   * - YouTube: Auto-generates thumbnail from `https://img.youtube.com/vi/{id}/maxresdefault.jpg`
   * - Vimeo: No auto-thumbnail (provide `thumbnail` prop)
   * - Use for automatic thumbnail generation and privacy-first URLs
   *
   * @example
   * // String URL - manual thumbnail required
   * url="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
   * thumbnail="/custom-thumb.jpg" // Required
   *
   * // VideoConfig - auto-thumbnail for YouTube
   * url={{ platform: 'youtube', id: 'dQw4w9WgXcQ' }}
   * // Thumbnail auto-generated, or override with thumbnail prop
   *
   * // VideoConfig with cookies (opt-in)
   * url={{ platform: 'youtube', id: 'dQw4w9WgXcQ', withCookies: true }}
   */
  url?: string | VideoConfig;
  /** Trigger element (button, thumbnail, etc.) - overrides default thumbnail/button */
  trigger?: ReactNode;
  /**
   * Custom thumbnail image URL
   *
   * **Priority**: Custom thumbnail > Auto-generated thumbnail (YouTube only) > Button fallback
   *
   * - If provided: Uses this thumbnail (takes priority over auto-generated)
   * - If not provided and `url` is VideoConfig with `platform: 'youtube'`: Auto-generates YouTube thumbnail
   * - If not provided and `url` is string or non-YouTube: Shows button fallback
   *
   * @example
   * // Override auto-thumbnail with custom image
   * url={{ platform: 'youtube', id: 'dQw4w9WgXcQ' }}
   * thumbnail="/custom-screenshot.jpg"
   */
  thumbnail?: string;
  /**
   * Load thumbnail image eagerly (default: false = lazy load)
   * Set to true for above-the-fold images to improve LCP
   * @default false
   */
  eager?: boolean;
  /** Video title for accessibility */
  title?: string;
  /**
   * Whether to open in modal dialog
   * @default true
   */
  modal?: boolean;
  /**
   * Video aspect ratio (e.g., '16/9', '4/3')
   * @default '16/9'
   */
  aspectRatio?: string;
  /** Custom class name */
  className?: string;
  /**
   * Autoplay video when opened
   * @default false
   */
  autoplay?: boolean;
  /**
   * Allow fullscreen mode
   * @default true
   */
  allowFullscreen?: boolean;
  /**
   * Aria label for the play button/thumbnail
   * @default 'Click to watch video'
   */
  playButtonLabel?: string;
  /**
   * Aria label for loading state
   * @default 'Loading video'
   */
  loadingLabel?: string;
}

/**
 * Constructs embed URL from VideoConfig or returns string URL as-is
 *
 * String URLs: Used as-is (user's responsibility)
 * Object config: Framework constructs privacy-first URL
 *
 * @param urlOrConfig - Video URL string or VideoConfig object
 * @param autoplay - Whether to enable autoplay
 * @returns Embed-ready URL
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
const getEmbedUrl = (
  urlOrConfig: string | VideoConfig,
  autoplay: boolean = false
): string => {
  const autoplayParam = autoplay ? '1' : '0';

  // String URL: validate scheme before passthrough
  if (typeof urlOrConfig === 'string') {
    try {
      const parsed = new URL(urlOrConfig);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return '';
      }
    } catch {
      return '';
    }
    return urlOrConfig;
  }

  // Object config: Construct URL from parts
  const { platform, id, withCookies = false } = urlOrConfig;

  if (platform === 'youtube') {
    const domain = withCookies ? 'youtube.com' : 'youtube-nocookie.com';
    return `https://www.${domain}/embed/${id}?autoplay=${autoplayParam}`;
  }

  if (platform === 'vimeo') {
    return `https://player.vimeo.com/video/${id}?autoplay=${autoplayParam}`;
  }

  // Fallback (shouldn't reach here with TypeScript)
  return '';
};

/**
 * Gets YouTube thumbnail URL from VideoConfig
 *
 * @param urlOrConfig - Video URL string or VideoConfig object
 * @returns Thumbnail URL or null if not available
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
const getThumbnailUrl = (urlOrConfig: string | VideoConfig): string | null => {
  if (typeof urlOrConfig === 'string') {
    return null;
  }

  if (urlOrConfig.platform === 'youtube') {
    return `https://img.youtube.com/vi/${urlOrConfig.id}/hqdefault.jpg`;
  }

  return null;
};

/**
 * Video player component with lazy-loading facade pattern for optimal Lighthouse scores.
 *
 * **Lazy-Loading Behavior:**
 * - Shows thumbnail facade initially (zero iframe resources)
 * - Lazy-loads iframe only on user click/interaction
 * - Works for both inline (`modal={false}`) and modal modes
 *
 * **Thumbnail Priority:**
 * 1. Custom `thumbnail` prop (if provided)
 * 2. Auto-generated YouTube thumbnail (if `url` is VideoConfig with `platform: 'youtube'`)
 * 3. Button fallback (if no thumbnail available)
 *
 * **URL Formats:**
 * - **String URL**: Full embed URL as-is. Requires manual `thumbnail` prop.
 * - **VideoConfig Object**: Framework constructs privacy-first URL. Auto-generates YouTube thumbnails.
 *
 * @component
 * @example
 * ```tsx
 * // Auto-thumbnail (YouTube VideoConfig) - recommended
 * <VideoPlayer
 *   url={{ platform: 'youtube', id: 'dQw4w9WgXcQ' }}
 *   title="Tutorial Video"
 *   modal={false}
 * />
 * // Thumbnail auto-generated from YouTube
 *
 * // Custom thumbnail override
 * <VideoPlayer
 *   url={{ platform: 'youtube', id: 'dQw4w9WgXcQ' }}
 *   thumbnail="/custom-screenshot.jpg"
 *   title="Tutorial Video"
 *   modal={false}
 * />
 * // Uses custom thumbnail instead of auto-generated
 *
 * // String URL - manual thumbnail required
 * <VideoPlayer
 *   url="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
 *   thumbnail="/custom-thumb.jpg" // Required
 *   title="Product Demo"
 *   modal={false}
 * />
 *
 * // Modal mode (lazy-loads iframe when modal opens)
 * <VideoPlayer
 *   url={{ platform: 'youtube', id: 'dQw4w9WgXcQ' }}
 *   title="Tutorial Video"
 *   modal={true} // default
 * />
 *
 * // Above-the-fold (eager load thumbnail for LCP)
 * <VideoPlayer
 *   url={{ platform: 'youtube', id: 'dQw4w9WgXcQ' }}
 *   eager={true}
 *   title="Hero Video"
 *   modal={false}
 * />
 * ```
 * @param {VideoPlayerProps} props - The props for the video player
 * @returns {JSX.Element} The rendered video player
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
/**
 * SVG placeholder for video player - zero bytes, instant render
 * Lazy-loads actual thumbnail on intersection
 */
const VideoPlaceholder = ({
  aspectRatio,
  className,
}: {
  aspectRatio: string;
  className?: string;
}) => (
  <svg
    className={cn('dndev-video-placeholder', className)}
    viewBox="0 0 16 9"
    style={{ aspectRatio, width: '100%', display: 'block' }}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <rect width="16" height="9" fill="var(--muted)" />
    <circle cx="8" cy="4.5" r="1.5" fill="var(--foreground)" opacity="0.8" />
    <path d="M7 3.5L7 5.5L9 4.5Z" fill="var(--background)" />
  </svg>
);

const VideoPlayer = ({
  url = { platform: 'youtube', id: 'dQw4w9WgXcQ' } as VideoConfig,
  trigger,
  thumbnail,
  eager = false,
  title = 'Video',
  modal = true,
  aspectRatio = '16/9',
  className,
  autoplay = false,
  allowFullscreen = true,
  playButtonLabel = 'Click to watch video',
  loadingLabel = 'Loading video',
}: VideoPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(eager);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const embedUrl = getEmbedUrl(url, autoplay);
  const autoThumbnailUrl = getThumbnailUrl(url);
  // If auto-generated thumbnail failed, fall back to custom thumbnail prop (if any)
  const thumbnailUrl = thumbnailFailed
    ? thumbnail || null
    : thumbnail || autoThumbnailUrl;

  // Lazy-load thumbnail on intersection (unless eager)
  const { ref: thumbnailRef, isIntersecting } =
    useIntersectionObserver<HTMLButtonElement>({
      threshold: 0.1,
    });

  useEffect(() => {
    if (isIntersecting && thumbnailUrl && !eager && !thumbnailLoaded) {
      setThumbnailLoaded(true);
    }
  }, [isIntersecting, thumbnailUrl, eager, thumbnailLoaded]);

  // Lazy-load iframe when modal opens
  useEffect(() => {
    if (isOpen && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isOpen, isLoaded]);

  // Reset iframe ready state when video changes
  useEffect(() => {
    setIframeReady(false);
  }, [embedUrl]);

  const videoFrame = (
    <iframe
      src={isLoaded ? embedUrl : ''}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen={allowFullscreen}
      className={cn('dndev-video-frame', className)}
      style={{ aspectRatio }}
      onLoad={() => setIframeReady(true)}
    />
  );

  // Inline video (no modal) - lazy-load on click
  if (!modal) {
    // Not clicked yet - show thumbnail or placeholder
    if (!isLoaded) {
      return (
        <button
          ref={thumbnailRef}
          type="button"
          onClick={() => setIsLoaded(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsLoaded(true);
            }
          }}
          className={cn('dndev-video-thumbnail', className)}
          style={{ aspectRatio }}
          aria-label={playButtonLabel}
        >
          {thumbnailLoaded && thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={() => setThumbnailFailed(true)}
            />
          ) : (
            <VideoPlaceholder aspectRatio={aspectRatio} />
          )}
          <div className="dndev-video-play-overlay">
            <Play className="dndev-video-play-icon" />
          </div>
        </button>
      );
    }

    // Clicked - show iframe with thumbnail overlay until iframe loads
    return (
      <div
        className={cn('dndev-video-container', className)}
        style={{ aspectRatio, position: 'relative' }}
      >
        {videoFrame}
        {/* Keep thumbnail visible until iframe loads */}
        {!iframeReady && thumbnailUrl && (
          <div
            className="dndev-video-thumbnail dndev-video-loading-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <img
              src={thumbnailUrl}
              alt={title}
              loading="eager"
              decoding="async"
              onError={() => setThumbnailFailed(true)}
            />
            <div className="dndev-video-play-overlay dndev-video-loading">
              <Spinner aria-label={loadingLabel} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Modal mode - lazy-load iframe when modal opens
  const defaultTrigger = (
    <button
      ref={thumbnailRef}
      type="button"
      className="dndev-video-thumbnail"
      style={{ aspectRatio }}
      aria-label={playButtonLabel}
    >
      {thumbnailLoaded && thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={() => setThumbnailFailed(true)}
        />
      ) : (
        <VideoPlaceholder aspectRatio={aspectRatio} />
      )}
      <div className="dndev-video-play-overlay">
        <Play className="dndev-video-play-icon" />
      </div>
    </button>
  );

  return (
    <Dialog
      trigger={trigger || defaultTrigger}
      title={title}
      open={isOpen}
      onOpenChange={setIsOpen}
      showClose={true}
      className="dndev-video-dialog"
    >
      {videoFrame}
    </Dialog>
  );
};

export default VideoPlayer;
