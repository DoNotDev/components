// packages/components/src/atomic/Icons/Partner/YahooIcon.tsx

/**
 * @fileoverview Yahoo Icon Component
 * @description React component for rendering the Yahoo icon. SVG-based icon component for authentication providers.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Yahoo icon component
 */
const YahooIcon: React.ComponentType<{ className?: string }> = ({
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
    {/* Yahoo logo - official purple */}
    <path
      fill="#5F01D1"
      d="M15.05 4.906c1.154 0 2.088-.325 2.088-.725s-.934-.725-2.088-.725-2.088.325-2.088.725.934.725 2.088.725zM6.352 4.906c1.154 0 2.088-.325 2.088-.725s-.934-.725-2.088-.725-2.088.325-2.088.725.935.725 2.088.725zM22.936 12.45c0 6.55-4.338 10.563-9.97 10.563-5.544 0-9.971-4.013-9.971-10.563 0-4.95 2.476-7.563 5.025-9.45h-4.826L0 11.25h4.557L6.375 3.9h4.106c-1.11 1.8-3.92 4.95-3.92 8.55 0 3.938 2.22 5.513 4.068 5.513 1.588 0 3.258-.937 3.258-3.488 0-1.125-.747-2.175-1.033-2.55-1.035 0-1.587 1.013-1.587 1.763 0 .45.187.975.187.975-1.125 0-1.334-1.313-1.334-2.213 0-1.725 1.334-3.862 3.261-3.862 1.854 0 3.333 1.387 3.333 3.637 0 5.025-5.47 3.975-5.47 3.975-.71 1.425.639 2.55 2.025 2.55 2.063 0 3.636-1.725 4.436-2.7.374-.413.636-.825.636-1.388 0-.337-.112-.525-.337-.712h3.187c-.075 0-.225-1.5-.225-1.5z"
    />
  </svg>
);

export default YahooIcon;
