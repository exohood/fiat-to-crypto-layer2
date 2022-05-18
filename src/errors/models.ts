import { chainIDToNetworkInfo, SUPPORTED_CHAINS } from '../core/constants';
import { TokenInfo } from 'src/tokens';

// if (inputAmount > balance)
export class InsufficientFundsError extends Error {
  constructor(token: string) {
    super(`You do not have enough ${token} to perform this action.`);
    this.name = 'Insufficient Funds';
  }
}

// if some unexpected exception is thrown
export class UnknownError extends Error {
  constructor() {
    super('Unknown Error');
  }
}

// if some unexpected exception is thrown
export class NetworkError extends Error {
  constructor() {
    super('Unknown Network error');
  }
}

export interface APIErrorPayload {
  detail: string;
  errorCode: string;
}

// if 1 or more arguments to router API are invalid
export class InvalidParamsError extends Error {
  public readonly detail: string;
  public readonly errorCode: string;

  constructor({ detail, errorCode }: APIErrorPayload) {
    super('Invalid arguments');
    this.detail = detail;
    this.errorCode = errorCode;
  }
}

export class IncompatibleNetworkError extends Error {
  constructor(tokenIn: TokenInfo, tokenOut: TokenInfo) {
    super(
      `You can not swap across networks. Input token (${tokenIn.symbol}) is not on the same network as output token (${tokenOut.symbol}). \nBoth tokens must be one Network`
    );
    this.name = 'Incompatible Chain IDs';
  }
}

export class UnsupportedNetworkError extends Error {
  constructor() {
    super(
      `Unsupported Network! \nLayer2 transactions only supported on the following networks: ${SUPPORTED_CHAINS.find(
        id => chainIDToNetworkInfo[id]?.name
      )}`
    );
    this.name = 'Unsupported Network';
  }
}

export class InvalidJSONBodyError extends Error {
  public readonly detail: string;
  public readonly errorCode: string;

  constructor({ detail, errorCode }: APIErrorPayload) {
    super('Invalid JSON Body');
    this.detail = detail;
    this.errorCode = errorCode;
  }
}

export class InternalError extends Error {
  public readonly detail: string;
  public readonly errorCode: string;

  constructor({ detail, errorCode }: APIErrorPayload) {
    super('Unexpected Internal error');
    this.detail = detail;
    this.errorCode = errorCode;
  }
}

export class NativeInputOnly extends Error {
  constructor() {
    super(
      'You are only allowed to select a native token as Input at this stage'
    );
    this.name = 'Native Input Only';
  }
}

// if 1 or more of these args are below minimum amount, methodParams on the RouteDetails object will be undefined. while the request will return 200
export class MinimumSlippageDeadlineError extends Error {
  constructor() {
    super('Either the deadline is or the slippage is set too low');
    this.name = 'Minimum Slippage Deadline Error';
  }
}
