// Convert country code (IN, US) → emoji flag
export function countryCodeToFlag(code: string) {
    if (!code) return "";
    const cc = code.toUpperCase();
  
    // Only A–Z allowed
    if (cc.length !== 2) return "";
  
    const OFFSET = 127397; // Unicode offset for flags
    return String.fromCodePoint(cc.charCodeAt(0) + OFFSET)
        + String.fromCodePoint(cc.charCodeAt(1) + OFFSET);
  }
  
  // Extract +91 from phone like "+91 9876543210"
  export function extractCountryCode(phone: string): string | null {
    if (!phone) return null;
  
    // Remove any leading '+' then remove the last 10 digits before extracting the country code
    let sanitized = phone.trim();
    if (sanitized.startsWith('+')) {
      sanitized = sanitized.slice(1);
    }
    const digitsOnly = sanitized.replace(/\D/g, '');
    const withoutLast10 = digitsOnly.length > 10 ? digitsOnly.slice(0, -10) : digitsOnly;
    const match = withoutLast10.match(/^(\d{1,4})/);
    return match ? match[1] : null;
  }
  
  // Map country dial codes to 2-letter ISO codes
  export const dialCodeToISO: Record<string, string> = {
    "1": "US",
    "44": "GB",
    "61": "AU",
    "91": "IN",
    "971": "AE",
    "81": "JP",
    "86": "CN",
    "92": "PK",
    "94": "LK",
    "95": "MM",
  };

  // Reverse mapping: ISO code to dial code
  export const isoToDialCode: Record<string, string> = {
    "US": "1",
    "GB": "44",
    "AU": "61",
    "IN": "91",
    "AE": "971",
    "JP": "81",
    "CN": "86",
    "PK": "92",
    "LK": "94",
    "MM": "95",
  };

  // Country list with dial codes, ISO codes, and names
  export interface CountryOption {
    dialCode: string;
    isoCode: string;
    name: string;
  }

  export const countryOptions: CountryOption[] = [
    { dialCode: "1", isoCode: "US", name: "United States" },
    { dialCode: "44", isoCode: "GB", name: "United Kingdom" },
    { dialCode: "91", isoCode: "IN", name: "India" },
    { dialCode: "61", isoCode: "AU", name: "Australia" },
    { dialCode: "971", isoCode: "AE", name: "United Arab Emirates" },
    { dialCode: "81", isoCode: "JP", name: "Japan" },
    { dialCode: "86", isoCode: "CN", name: "China" },
    { dialCode: "92", isoCode: "PK", name: "Pakistan" },
    { dialCode: "94", isoCode: "LK", name: "Sri Lanka" },
    { dialCode: "95", isoCode: "MM", name: "Myanmar" },
    { dialCode: "33", isoCode: "FR", name: "France" },
    { dialCode: "49", isoCode: "DE", name: "Germany" },
    { dialCode: "39", isoCode: "IT", name: "Italy" },
    { dialCode: "34", isoCode: "ES", name: "Spain" },
    { dialCode: "31", isoCode: "NL", name: "Netherlands" },
    { dialCode: "32", isoCode: "BE", name: "Belgium" },
    { dialCode: "41", isoCode: "CH", name: "Switzerland" },
    { dialCode: "46", isoCode: "SE", name: "Sweden" },
    { dialCode: "47", isoCode: "NO", name: "Norway" },
    { dialCode: "45", isoCode: "DK", name: "Denmark" },
    { dialCode: "358", isoCode: "FI", name: "Finland" },
    { dialCode: "351", isoCode: "PT", name: "Portugal" },
    { dialCode: "30", isoCode: "GR", name: "Greece" },
    { dialCode: "48", isoCode: "PL", name: "Poland" },
    { dialCode: "7", isoCode: "RU", name: "Russia" },
    { dialCode: "82", isoCode: "KR", name: "South Korea" },
    { dialCode: "65", isoCode: "SG", name: "Singapore" },
    { dialCode: "60", isoCode: "MY", name: "Malaysia" },
    { dialCode: "66", isoCode: "TH", name: "Thailand" },
    { dialCode: "84", isoCode: "VN", name: "Vietnam" },
    { dialCode: "62", isoCode: "ID", name: "Indonesia" },
    { dialCode: "63", isoCode: "PH", name: "Philippines" },
    { dialCode: "64", isoCode: "NZ", name: "New Zealand" },
    { dialCode: "27", isoCode: "ZA", name: "South Africa" },
    { dialCode: "20", isoCode: "EG", name: "Egypt" },
    { dialCode: "234", isoCode: "NG", name: "Nigeria" },
    { dialCode: "254", isoCode: "KE", name: "Kenya" },
    { dialCode: "55", isoCode: "BR", name: "Brazil" },
    { dialCode: "52", isoCode: "MX", name: "Mexico" },
    { dialCode: "54", isoCode: "AR", name: "Argentina" },
    { dialCode: "56", isoCode: "CL", name: "Chile" },
    { dialCode: "57", isoCode: "CO", name: "Colombia" },
    { dialCode: "51", isoCode: "PE", name: "Peru" },
  ];
  