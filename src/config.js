// Single source of truth for site-wide constants.
// BOOKING_URL is injected into every CTA in the HTML at build time (see vite.config.js,
// where %BOOKING_URL% is replaced) and is also available to scripts that import it.
export const BOOKING_URL = 'https://turo.com/us/en/suv-rental/united-states/apopka-fl/kia/niro-ev/3149762';

// Canonical origin used for Open Graph tags and JSON-LD. Change when the domain is final.
export const SITE_URL = 'https://knightrip.com';
