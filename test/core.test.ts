import {
  getQuote,
  IncompatibleNetworkError,
  InsufficientFundsError,
  UnsupportedNetworkError,
  handleAPIRequest,
  validateRequest,
  getRoute,
  DEFAULTS,
} from '../src';
import { quoteResponse, routeResponse } from './mocks/responses';

// DEFINE CONSTANTS
const API_KEY = '1234';
const USER_WALLET = '0xC54070dA79E7E3e2c95D3a91fe98A42000e65a48';

const weth = {
  name: 'Wrapped Ether',
  address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  symbol: 'WETH',
  decimals: 18,
  chainId: 4,
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
};
const uni = {
  name: 'Uniswap',
  address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  symbol: 'UNI',
  decimals: 18,
  chainId: 4,
  logoURI: 'ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg',
};

// SYNCHRONOUS FUNCTIONS

describe('validateRequest', () => {
  it('throws NativeInputOnly error', () => {
    expect(() => validateRequest(uni, weth)).toThrow(
      'You are only allowed to select a native token as Input at this stage'
    );
  });

  it('throws IncompatibleNetworkError error', () => {
    const expectedError = new IncompatibleNetworkError(weth, {
      ...uni,
      chainId: 1,
    });
    expect(() => validateRequest(weth, { ...uni, chainId: 1 })).toThrow(
      expectedError.message
    );
  });

  it('throws UnsupportedNetworkError error', () => {
    const expectedError = new UnsupportedNetworkError();
    expect(() =>
      validateRequest({ ...weth, chainId: 5 }, { ...uni, chainId: 5 })
    ).toThrow(expectedError.message);
  });

  it('throws InsufficientFundsError error', () => {
    const expectedError = new InsufficientFundsError(weth.symbol);
    expect(() => validateRequest(weth, uni, 100, 50)).toThrow(
      expectedError.message
    );
  });
});

// ASYNCHRONOUS FUNCTIONS

describe('getQuote', () => {
  it('returns QUOTE response when swap params are missing', async () => {
    const res = await getQuote(weth, uni, 0.1, false, API_KEY);
    expect(res).toEqual(quoteResponse);
  });

  it('throws errors if inputs are invalid', async () => {
    await expect(
      getQuote(
        { ...weth, chainId: 5 },
        { ...uni, chainId: 5 },
        0.1,
        false,
        API_KEY
      )
    ).rejects.toThrowError();
  });
});

describe('getRoute', () => {
  it('returns ROUTE response when swap params are included', async () => {
    const res = await getRoute(
      100,
      weth,
      uni,
      0.02,
      USER_WALLET,
      false,
      DEFAULTS,
      API_KEY
    );
    expect(res).toEqual(routeResponse);
  });
  it('throws error when inputs are invalid', async () => {
    await expect(
      getRoute(
        100,
        { ...weth, chainId: 5 },
        { ...uni, chainId: 5 },
        0.02,
        USER_WALLET,
        false,
        DEFAULTS,
        API_KEY
      )
    ).rejects.toThrowError();
  });
});

describe('handleApiErrors', () => {
  it('throws InvalidParamsError when API returns 400', async () => {
    const invalidAddress = '0xC54070dA79E7E3e2c95D3a91fe98A42000e65a48';

    await expect(
      handleAPIRequest(`api400?invalidAddress=${invalidAddress}`, API_KEY)
    ).rejects.toThrow('Invalid arguments');
  });

  it('throws InvalidJSONBodyError when API returns 422', async () => {
    await expect(handleAPIRequest('api422', API_KEY)).rejects.toThrow(
      'Invalid JSON Body'
    );
  });

  it('throws InternalError when API returns 500', async () => {
    await expect(handleAPIRequest('api500', API_KEY)).rejects.toThrow(
      'Unexpected Internal error'
    );
  });

  it('throws UnknownError when API returns unrecognized status code', async () => {
    await expect(handleAPIRequest('api300', API_KEY)).rejects.toThrow(
      'Unknown Error'
    );
  });
});
