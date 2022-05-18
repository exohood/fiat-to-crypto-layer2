import { ReactNode } from 'react';
import { BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

export interface SwapParams {
  data: string; // route.methodParameters.calldata,
  to: string; //  V3_SWAP_ROUTER_ADDRESS,
  value: BigNumber; // BigNumber.from(route.methodParameters.value),
  gasPrice: BigNumber;
}
// Interfaces
export interface ProviderProps {
  children?: ReactNode;
}

// use this interface for type assertion inside addERC20ToMetamask()
export interface WatchAssetParams {
  method: string;
  params: {
    type: string; // In the future, other standards will be supported
    options: {
      address: string; // The address of the token contract
      symbol: string; // A ticker symbol or shorthand, up to 5 characters
      decimals: number; // The number of token decimals
      image: string; // A string url of the token logo
    };
  };
}

export interface Info {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  wethAddress?: string;
}

// generic return class we can extend for route, quote and functionParams
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  // TODO: add error classes here eg. InsufficientFundsError or NetworkError etc.
  public errorMessage?: string | undefined;
  public value?: T;

  private constructor(isSuccess: boolean, value?: T, errorMessage?: string) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.errorMessage = errorMessage;
    this.value = value;

    Object.freeze(this);
  }

  public static ok<T>(value: T): Result<T> {
    return new Result(true, value);
  }

  public static fail<T>(error: string): Result<T> {
    return new Result(false, {} as T, error);
  }
}

export type QuoteResult = Result<QuoteDetails>;
export type RouteResult = Result<RouteDetails>;
export type SwapParamsResult = Result<SwapParams>;

// export type QuoteResult = QuoteDetails | NetworkError;

export interface QuoteDetails {
  blockNumber: string;
  amount: string;
  amountDecimals: string;
  quote: string;
  quoteDecimals: string;
  quoteGasAdjusted: string;
  quoteGasAdjustedDecimals: string;
  gasUseEstimateQuote: string;
  gasUseEstimateQuoteDecimals: string;
  gasUseEstimate: string;
  gasUseEstimateUSD: string;
  gasPriceWei: string;
  route: any[][];
  routeString: string;
  quoteId: string;
}

export interface RouteDetails extends QuoteDetails {
  methodParameters: {
    calldata: string; // long hexString
    value: string; // 0x00
  };
}

export interface MetaMaskProvider extends JsonRpcProvider {
  provider: {
    request: (params: WatchAssetParams) => Promise<boolean>;
  };
}
