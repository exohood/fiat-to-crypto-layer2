// Interfaces/types below describe the schema for standardized token lists (see https://uniswap.org/blog/token-lists)
type ExtensionValue = string | number | boolean | null;

export interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: {
    readonly [key: string]: { [key: string]: ExtensionValue } | ExtensionValue;
  };
}

export interface Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

export interface Tags {
  readonly [tagId: string]: {
    readonly name: string;
    readonly description: string;
  };
}
