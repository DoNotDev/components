// packages/components/src/atomic/Icons/Partner/FacebookIcon.tsx

/**
 * @fileoverview Facebook Icon Component
 * @description React component for rendering the Facebook icon. SVG-based icon component for authentication providers.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Facebook icon component
 */
const FacebookIcon: React.ComponentType<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={className}
    aria-hidden="true"
  >
    {/* White background circle for visibility */}
    <circle cx="24" cy="24" r="24" fill="white" />
    {/* Facebook logo */}
    <path
      fill="#1877F2"
      d="M44 24c0-11.046-8.954-20-20-20S4 12.954 4 24c0 9.984 7.287 18.254 16.834 19.76v-13.99H15.39V24h5.444v-4.722c0-5.38 3.206-8.34 8.097-8.34 2.344 0 4.797.42 4.797.42v5.276h-2.711c-2.666 0-3.498 1.656-3.498 3.352V24h5.94l-.948 6.03h-4.992v13.99C36.713 42.254 44 33.984 44 24z"
    />
  </svg>
);

export default FacebookIcon;
