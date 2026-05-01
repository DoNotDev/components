// packages/components/src/atomic/Icons/Partner/MicrosoftIcon.tsx

/**
 * @fileoverview Microsoft Icon Component
 * @description React component for rendering the Microsoft icon. SVG-based icon component for authentication providers.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Microsoft icon component
 */
const MicrosoftIcon: React.ComponentType<{ className?: string }> = ({
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
    {/* Microsoft logo colors */}
    <path fill="#F25022" d="M0 0h11.5v11.5H0z" />
    <path fill="#00A4EF" d="M0 12.5h11.5V24H0z" />
    <path fill="#7FBA00" d="M12.5 0H24v11.5H12.5z" />
    <path fill="#FFB900" d="M12.5 12.5H24V24H12.5z" />
  </svg>
);

export default MicrosoftIcon;
