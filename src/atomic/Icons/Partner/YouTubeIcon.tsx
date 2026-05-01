// packages/components/src/atomic/Icons/Partner/YouTubeIcon.tsx

/**
 * @fileoverview YouTube Icon Component
 * @description React component for rendering the YouTube icon. SVG-based icon component for authentication providers.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * YouTube icon component
 * Renders the YouTube logo as an SVG.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name to apply to the SVG element.
 * @returns {React.ReactElement} The YouTube icon SVG component.
 */
const YouTubeIcon: React.ComponentType<{ className?: string }> = ({
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
    {/* YouTube logo - official red */}
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
    />
  </svg>
);

export default YouTubeIcon;
