export const COUNTRIES = [
  // Americas
  { code: 'us', name: 'United States', flag: '🇺🇸', region: 'Americas' },
  { code: 'ca', name: 'Canada',         flag: '🇨🇦', region: 'Americas' },
  { code: 'mx', name: 'Mexico',         flag: '🇲🇽', region: 'Americas' },
  { code: 'br', name: 'Brazil',         flag: '🇧🇷', region: 'Americas' },
  { code: 'ar', name: 'Argentina',      flag: '🇦🇷', region: 'Americas' },
  { code: 'cl', name: 'Chile',          flag: '🇨🇱', region: 'Americas' },
  { code: 'co', name: 'Colombia',       flag: '🇨🇴', region: 'Americas' },
  { code: 'pe', name: 'Peru',           flag: '🇵🇪', region: 'Americas' },

  // Europe
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'de', name: 'Germany',        flag: '🇩🇪', region: 'Europe' },
  { code: 'fr', name: 'France',         flag: '🇫🇷', region: 'Europe' },
  { code: 'es', name: 'Spain',          flag: '🇪🇸', region: 'Europe' },
  { code: 'it', name: 'Italy',          flag: '🇮🇹', region: 'Europe' },
  { code: 'nl', name: 'Netherlands',    flag: '🇳🇱', region: 'Europe' },
  { code: 'se', name: 'Sweden',         flag: '🇸🇪', region: 'Europe' },
  { code: 'no', name: 'Norway',         flag: '🇳🇴', region: 'Europe' },
  { code: 'dk', name: 'Denmark',        flag: '🇩🇰', region: 'Europe' },
  { code: 'fi', name: 'Finland',        flag: '🇫🇮', region: 'Europe' },
  { code: 'ch', name: 'Switzerland',    flag: '🇨🇭', region: 'Europe' },
  { code: 'at', name: 'Austria',        flag: '🇦🇹', region: 'Europe' },
  { code: 'be', name: 'Belgium',        flag: '🇧🇪', region: 'Europe' },
  { code: 'pt', name: 'Portugal',       flag: '🇵🇹', region: 'Europe' },
  { code: 'pl', name: 'Poland',         flag: '🇵🇱', region: 'Europe' },
  { code: 'ie', name: 'Ireland',        flag: '🇮🇪', region: 'Europe' },
  { code: 'gr', name: 'Greece',         flag: '🇬🇷', region: 'Europe' },
  { code: 'tr', name: 'Türkiye',        flag: '🇹🇷', region: 'Europe' },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿', region: 'Europe' },
  { code: 'hu', name: 'Hungary',        flag: '🇭🇺', region: 'Europe' },
  { code: 'ro', name: 'Romania',        flag: '🇷🇴', region: 'Europe' },
  { code: 'sk', name: 'Slovakia',       flag: '🇸🇰', region: 'Europe' },
  { code: 'ru', name: 'Russia',         flag: '🇷🇺', region: 'Europe' },

  // Asia-Pacific
  { code: 'jp', name: 'Japan',          flag: '🇯🇵', region: 'Asia-Pacific' },
  { code: 'kr', name: 'South Korea',    flag: '🇰🇷', region: 'Asia-Pacific' },
  { code: 'au', name: 'Australia',      flag: '🇦🇺', region: 'Asia-Pacific' },
  { code: 'nz', name: 'New Zealand',    flag: '🇳🇿', region: 'Asia-Pacific' },
  { code: 'sg', name: 'Singapore',      flag: '🇸🇬', region: 'Asia-Pacific' },
  { code: 'hk', name: 'Hong Kong',      flag: '🇭🇰', region: 'Asia-Pacific' },
  { code: 'tw', name: 'Taiwan',         flag: '🇹🇼', region: 'Asia-Pacific' },
  { code: 'th', name: 'Thailand',       flag: '🇹🇭', region: 'Asia-Pacific' },
  { code: 'ph', name: 'Philippines',    flag: '🇵🇭', region: 'Asia-Pacific' },
  { code: 'id', name: 'Indonesia',      flag: '🇮🇩', region: 'Asia-Pacific' },
  { code: 'my', name: 'Malaysia',       flag: '🇲🇾', region: 'Asia-Pacific' },
  { code: 'in', name: 'India',          flag: '🇮🇳', region: 'Asia-Pacific' },
  { code: 'cn', name: 'China',          flag: '🇨🇳', region: 'Asia-Pacific' },

  // Middle East & Africa
  { code: 'il', name: 'Israel',         flag: '🇮🇱', region: 'Middle East' },
  { code: 'sa', name: 'Saudi Arabia',   flag: '🇸🇦', region: 'Middle East' },
  { code: 'ae', name: 'UAE',            flag: '🇦🇪', region: 'Middle East' },
  { code: 'za', name: 'South Africa',   flag: '🇿🇦', region: 'Africa' },
  { code: 'ng', name: 'Nigeria',        flag: '🇳🇬', region: 'Africa' },
  { code: 'eg', name: 'Egypt',          flag: '🇪🇬', region: 'Africa' },
]

export const REGIONS = ['All', 'Americas', 'Europe', 'Asia-Pacific', 'Middle East', 'Africa']

export function getCountry(code) {
  return COUNTRIES.find(c => c.code === code)
}
