// packages/components/src/atomic/Icons/Partner/AppleIcon.tsx

/**
 * @fileoverview Apple Icon Component
 * @description React component for rendering the Apple icon. SVG-based icon component for authentication providers.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Apple icon component
 *
 * Renders the Apple logo as an SVG icon.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Apple icon component
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
const AppleIcon: React.ComponentType<{ className?: string }> = ({
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
    {/* Apple logo */}
    <path
      fill="#000000"
      d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.38 4.38 0 0 0-3 1.52 4.09 4.09 0 0 0-1 3.09 3.6 3.6 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.93 12.45 4.24 17 6 19.47c.8 1.36 1.8 2.86 3.11 2.8s1.69-.88 3.17-.88 1.9.88 3.19.85 2.18-1.29 3-2.65a11.29 11.29 0 0 0 1.35-2.85 4.4 4.1 0 0 1-2.36-3.11z"
    />
  </svg>
);

/**
 * Default export of Apple icon component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export default AppleIcon;
