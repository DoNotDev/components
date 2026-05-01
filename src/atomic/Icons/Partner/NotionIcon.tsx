// packages/components/src/atomic/Icons/Partner/NotionIcon.tsx

/**
 * @fileoverview Notion Icon Component
 * @description React component for rendering the Notion icon. SVG-based icon component for authentication providers.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Notion icon component
 */
const NotionIcon: React.ComponentType<{ className?: string }> = ({
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
    {/* Notion logo */}
    <path
      fill="#000000"
      d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046 1.354-.373 1.354-1.214V6.354c0-.84-.513-1.214-1.354-1.167L6.466 5.146c-.841.047-1.214.327-1.214 1.142z"
    />
  </svg>
);

export default NotionIcon;
