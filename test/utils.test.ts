import {
  BigNumber,
  formatTokenAmount,
  getAddressFromEnsName,
  getEnsNameFromAddress,
  isNativeToken,
  resolveWeth,
  TokenInfo,
  uriToHttp,
} from '../src';
import { MockProvider } from '@ethereum-waffle/provider';

// DEFINE CONSTANTS

const weth: TokenInfo = {
  name: 'Wrapped Ether',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  symbol: 'WETH',
  decimals: 18,
  chainId: 1,
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
};

const resolvedWeth: TokenInfo = {
  name: 'Wrapped Ether',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  symbol: 'ETH',
  decimals: 18,
  chainId: 1,
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
};

const dai: TokenInfo = {
  name: 'Dai Stablecoin',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  symbol: 'DAI',
  decimals: 18,
  chainId: 1,
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
};

const ethBalance = BigNumber.from('0x3d12391bc3404970'); // 4400642577297066352

// SOME KNOWN ENS CREDENTIALS ON MAINNET

const mockProvider = new MockProvider();
const [wallet] = mockProvider.getWallets();

// TESTS

describe('Utility functions', () => {
  describe('isNativeToken', () => {
    it('accepts weth as native', () => {
      const isNative = isNativeToken(weth);
      expect(isNative).toBe(true);
    });

    it('rejects dai as native', () => {
      const isNative = isNativeToken(dai);
      expect(isNative).toBe(false);
    });
  });

  describe('resolveWeth', () => {
    it('converts WETH symbol to ETH', () => {
      const resolved = resolveWeth(weth);
      expect(resolved).toEqual(resolvedWeth);
    });

    it('does not alter tokens other than weth', () => {
      const resolved = resolveWeth(dai);
      expect(resolved).toEqual(dai);
    });
  });

  describe('formatTokenAmount', () => {
    it('formats eth to 18 decimals', () => {
      const formatted = formatTokenAmount(18, ethBalance);
      expect(formatted).toEqual('4.400642577297066352');
    });

    it('fails quietly, returns "0.00" with no input', () => {
      const formatted = formatTokenAmount(18, (null as unknown) as BigNumber);
      expect(formatted).toEqual('0.00');
    });
  });

  describe('uriToHttp', () => {
    it('converts ipfs to https', () => {
      const result = uriToHttp(
        'ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg'
      );
      expect(result).toEqual([
        'https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg/',
        'https://ipfs.io/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg/',
      ]);
    });

    it('converts http to https', () => {
      const result = uriToHttp(
        'http://assets.coingecko.com/coins/images/11224/thumb/tBTC.png?1589620754'
      );
      expect(result).toEqual([
        'https://assets.coingecko.com/coins/images/11224/thumb/tBTC.png?1589620754',
        'http://assets.coingecko.com/coins/images/11224/thumb/tBTC.png?1589620754',
      ]);
    });
  });

  describe('Ens Resolvers', () => {
    const name = 'test.eth';

    beforeAll(async () => {
      await mockProvider.setupENS(wallet);
      if (mockProvider?.ens) {
        await mockProvider?.ens.createDomain('eth', { recursive: true });
        await mockProvider?.ens.setAddressWithReverse(name, wallet, {
          recursive: true,
        });
      }
    });

    it('"getAddressFromEnsName" finds an address from a name', async () => {
      const address = await getAddressFromEnsName(name, mockProvider);
      expect(address).toEqual(wallet.address);
    });

    it('"getEnsNameFromAddress" finds a name from an address', async () => {
      const ensName = await getEnsNameFromAddress(wallet.address, mockProvider);
      expect(ensName).toEqual(name);
    });
  });
});
