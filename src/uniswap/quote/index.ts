import { utils } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { SwapParams, RouteDetails, QuoteDetails } from '../models';
import {
  APIErrorPayload,
  InsufficientFundsError,
  InvalidParamsError,
  IncompatibleNetworkError,
  UnsupportedNetworkError,
  InvalidJSONBodyError,
  InternalError,
  UnknownError,
  NativeInputOnly,
  MinimumSlippageDeadlineError,
} from '../errors';
import { TokenInfo } from '../../core/tokens';
import {
  SWAP_ROUTER_ADDRESS,
  ROUTER_API,
  UNISWAP_DEFAULTS,
  SUPPORTED_CHAINS,
  NATIVE_INPUT_ONLY,
} from '../constants';
import {
  isNativeToken,
  isValidRouteDetails,
  resolveWeth,
} from '../../core/utils';

export async function handleUniswapAPIRequest<T>(
  url: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(url, {
    signal: signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': apiKey,
    },
  });
  const formattedResponse: T = await res.json();
  if (res.ok) {
    return formattedResponse;
  }
  return handleAPIErrors(res, formattedResponse);
}

const handleAPIErrors = (res: Response, formattedResponse: any): never => {
  const { detail, errorCode } = formattedResponse;
  switch (res.status) {
    case 400:
      throw new InvalidParamsError({ detail, errorCode } as APIErrorPayload);
    case 422:
      throw new InvalidJSONBodyError({
        detail,
        errorCode,
      } as APIErrorPayload);
    case 500:
      throw new InternalError({ detail, errorCode } as APIErrorPayload);
    default:
      throw new UnknownError();
  }
};

export const validateRequest = (
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  amount?: number,
  balance?: number
) => {
  const { chainId: chainIdIn } = tokenIn;
  const { chainId: chainIdOut } = tokenOut;

  if (chainIdIn !== chainIdOut) {
    throw new IncompatibleNetworkError(tokenIn, tokenOut);
  }

  if (!SUPPORTED_CHAINS.includes(chainIdIn)) {
    throw new UnsupportedNetworkError();
  }

  if (NATIVE_INPUT_ONLY && !isNativeToken(tokenIn)) {
    throw new NativeInputOnly();
  }

  if (balance && amount && amount > balance) {
    throw new InsufficientFundsError(tokenIn.symbol);
  }
};

export const getUniswapQuote = async (
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  inputAmount: number, // not formatted
  exactOut: boolean = false,
  apiKey: string,
  signal?: AbortSignal
): Promise<QuoteDetails> => {
  validateRequest(tokenIn, tokenOut);

  const tradeType = exactOut ? 'exactOut' : 'exactIn';

  const formattedAmount = utils.parseEther(inputAmount.toString()).toString();
  // token symbol "WETH"=> "ETH"
  const formattedTokenIn = resolveWeth(tokenIn);
  const tokenInAddress = isNativeToken(formattedTokenIn)
    ? formattedTokenIn.symbol
    : formattedTokenIn.address;

  const url = `${ROUTER_API}/quote?tokenInAddress=${tokenInAddress}&tokenInChainId=${tokenIn.chainId}&tokenOutAddress=${tokenOut.address}&tokenOutChainId=${tokenIn.chainId}&amount=${formattedAmount}&type=${tradeType}`;

  return handleUniswapAPIRequest<QuoteDetails>(url, apiKey, signal);
};

export const getUniswapRoute = async (
  balance: number,
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  inputAmount: number,
  recipient: string,
  exactOut: boolean = false,
  options: {
    slippageTolerance: number;
    deadline: number;
  } = UNISWAP_DEFAULTS,
  apiKey: string,
  signal?: AbortSignal
): Promise<RouteDetails> => {
  validateRequest(tokenIn, tokenOut, inputAmount, balance);

  const tradeType = exactOut ? 'exactOut' : 'exactIn';

  const formattedAmount = utils.parseEther(inputAmount.toString()).toString();
  // token symbol "WETH"=> "ETH"
  const formattedTokenIn = resolveWeth(tokenIn);
  const tokenInAddress = isNativeToken(formattedTokenIn)
    ? formattedTokenIn.symbol
    : formattedTokenIn.address;

  const { slippageTolerance, deadline } = options;
  const url = `${ROUTER_API}/quote?tokenInAddress=${tokenInAddress}&tokenInChainId=${tokenIn.chainId}&tokenOutAddress=${tokenOut.address}&tokenOutChainId=${tokenOut.chainId}&amount=${formattedAmount}&type=${tradeType}&slippageTolerance=${slippageTolerance}&deadline=${deadline}&recipient=${recipient}`;

  return handleUniswapAPIRequest<RouteDetails>(url, apiKey, signal);
};

export const getUniswapSwapParams = async (
  balance: number,
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  inputAmount: number,
  recipient: string,
  exactOut: boolean = false,
  options: {
    slippageTolerance: number;
    deadline: number;
  } = UNISWAP_DEFAULTS,
  apiKey: string,
  signal?: AbortSignal
): Promise<SwapParams> => {
  try {
    const res = await getUniswapRoute(
      balance,
      tokenIn,
      tokenOut,
      inputAmount,
      recipient,
      exactOut,
      options,
      apiKey,
      signal
    );

    if (!isValidRouteDetails(res)) {
      throw new MinimumSlippageDeadlineError();
    }

    const { calldata, value } = res.methodParameters;
    return {
      data: calldata,
      to: SWAP_ROUTER_ADDRESS,
      value: BigNumber.from(value),
      gasPrice: BigNumber.from(res.gasPriceWei),
    };
  } catch (error) {
    // re-throw errors
    throw error;
  }
};
