// packages/components/src/atomic/Icons/Partner/MastodonIcon.tsx

/**
 * @fileoverview Mastodon Icon Component
 * @description React component for rendering the Mastodon icon. SVG-based icon component for authentication providers.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Mastodon icon component
 * Renders the Mastodon logo as an SVG.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name to apply to the SVG element.
 * @returns {React.ReactElement} The Mastodon icon SVG component.
 */
const MastodonIcon: React.ComponentType<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    {/* White background circle for visibility */}
    <circle cx="12" cy="12" r="12" fill="white" />
    {/* Mastodon logo - official purple */}
    <path
      fill="#6364FF"
      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"
    />
  </svg>
);

export default MastodonIcon;
