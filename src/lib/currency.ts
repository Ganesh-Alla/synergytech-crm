export interface CurrencyOption {
    isoCode: string;
    name: string;
    symbol: string; // $ for USD, € for EUR, £ for GBP, etc.
}

export const currencyOptions: CurrencyOption[] = [
    { isoCode: "USD", name: "United States Dollar", symbol: "$" },
    { isoCode: "EUR", name: "Euro", symbol: "€" },
    { isoCode: "GBP", name: "British Pound", symbol: "£" },
    { isoCode: "INR", name: "Indian Rupee", symbol: "₹" },
  ];
  export function getCurrencyName(isoCode: string): string {
    return currencyOptions.find(currency => currency.isoCode === isoCode)?.name || ''
  }
  export function getCurrencySymbol(isoCode: string): string {
    return currencyOptions.find(currency => currency.isoCode === isoCode)?.symbol || ''
  }
  