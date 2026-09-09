// packages/components/src/atomic/Icons/Partner/providerIcons.tsx

/**
 * @fileoverview Auth Provider Icons
 * @description Icons for authentication providers (Google, GitHub, etc.). This mapping follows the schema-driven approach where schema defines icon names that map to icon components. The mapping is the minimal redundancy needed since components package cannot import @donotdev/core.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Mail, MailCheck } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

import AppleIcon from './AppleIcon';
import DiscordIcon from './DiscordIcon';
import FacebookIcon from './FacebookIcon';
import GitHubIcon from './GitHubIcon';
import GoogleIcon from './GoogleIcon';
import LinkedInIcon from './LinkedinIcon';
import MastodonIcon from './MastodonIcon';
import MediumIcon from './MediumIcon';
import MicrosoftIcon from './MicrosoftIcon';
import NotionIcon from './NotionIcon';
import RedditIcon from './RedditIcon';
import SlackIcon from './SlackIcon';
import SpotifyIcon from './SpotifyIcon';
import SupabaseIcon from './SupabaseIcon';
import TwitchIcon from './TwitchIcon';
import XIcon from './XIcon';
import YahooIcon from './YahooIcon';
import YouTubeIcon from './YouTubeIcon';

// Import all the existing icon components

// Default Icon (fallback) - Handshake icon
function DefaultProviderIcon({
  className = '',
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...props}>
      <path
        fill="currentColor"
        d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L9.27 7.88l-1.41-1.41a2.4 2.4 0 0 0-3.4 0L2.3 9.88a2.4 2.4 0 0 0 0 3.4l1.41 1.41-2.12 2.12a5.4 5.4 0 0 0 0 7.65l1.41 1.41a5.4 5.4 0 0 0 7.65 0l2.12-2.12 1.41 1.41a2.4 2.4 0 0 0 3.4 0l3.4-3.4a2.4 2.4 0 0 0 0-3.4l-1.41-1.41 2.12-2.12a5.4 5.4 0 0 0 0-7.65l-1.41-1.41zM16.27 8.88l-1.41-1.41a2.4 2.4 0 0 1 3.4 0l1.41 1.41-3.4 3.4zM7.73 15.12l1.41 1.41a2.4 2.4 0 0 1-3.4 0l-1.41-1.41 3.4-3.4z"
      />
    </svg>
  );
}

/**
 * Default provider icon component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export default DefaultProviderIcon;

/**
 * Schema-driven icon mapping
 *
 * This mapping MUST match the icon properties from AUTH_PARTNERS and OAUTH_PARTNERS schemas:
 * - AUTH_PARTNERS: google, github, facebook, discord, twitter, microsoft, spotify, linkedin, reddit, twitch, yahoo, apple, password, emailLink
 * - OAUTH_PARTNERS: google, github, discord, spotify, twitch, reddit, linkedin, slack, notion, medium, twitter, mastodon, youtube
 *
 * Naming convention: schema icon value → ComponentName
 * Example: schema icon: 'google' → GoogleIcon component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const PROVIDER_ICONS = {
  // Schema icon values → Component mapping (alphabetical)
  apple: AppleIcon,
  discord: DiscordIcon,
  emailLink: MailCheck,
  facebook: FacebookIcon,
  github: GitHubIcon,
  google: GoogleIcon,
  linkedin: LinkedInIcon,
  mastodon: MastodonIcon,
  medium: MediumIcon,
  microsoft: MicrosoftIcon,
  notion: NotionIcon,
  password: Mail,
  reddit: RedditIcon,
  slack: SlackIcon,
  spotify: SpotifyIcon,
  supabase: SupabaseIcon,
  twitch: TwitchIcon,
  twitter: XIcon,
  yahoo: YahooIcon,
  youtube: YouTubeIcon,
} as const;

/**
 * Get provider icon by schema icon value with fallback to default
 *
 * @param partnerId - The schema icon value (e.g., 'google', 'github')
 * @returns The corresponding icon component or DefaultProviderIcon
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function getProviderIcon(partnerId: string): ComponentType<any> {
  return (
    PROVIDER_ICONS[partnerId as keyof typeof PROVIDER_ICONS] ||
    DefaultProviderIcon
  );
}
