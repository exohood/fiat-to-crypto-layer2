# Exohood Fiat to Crypto - Layer2 SDK

This package serves as a library that can be published to npm and imported into `widget/package` to provide the necessary logic to perform swaps from Native Currency to any other token provided it is supported by the dex in questions.

## Dependencies included in the bundle

- [@usedapp/core](https://github.com/TrueFiEng/useDApp/)
- [@ethersproject/units](https://www.npmjs.com/package/@ethersproject/units)
- [@ethersproject/address](https://www.npmjs.com/package/@ethersproject/address)
- [@ethersproject/bignumber](https://www.npmjs.com/package/@ethersproject/bignumber)

### Dexs implemented to date

- Uniswap (v2 & v3)

## Local development

> Import layer2 into widget/package using `yarn link`.

inside `layer2` root folder:

```shell
yarn install
yarn link
yarn start
```

inside `widget/package`:

```shell
yarn link layer2
yarn start:l2
```

## Production Installation

> download directly from Github until v1 is published to NPM.

inside `widget/package`:

```shell
yarn add @Exohood Fiat to Crypto/layer2#main
```

## Usage

### How to: Get a quote & perform Transaction

1. Wrap your application with the Layer2Provider.

```typescript=
import { L2Provider } from 'layer2';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <L2Provider>
      <App />
    </L2Provider>
  </React.StrictMode>
);
```

> The L2Provider is nothing but a wrapper for [@usedapp/core](https://usedapp-docs.netlify.app/docs)'s <DappProvider />
> UseDApp [documentation](https://usedapp-docs.netlify.app/docs)

2. Get a Quote

> If a user does not have their wallet ocnnected we can still fetch quote data. (`<QuoteResult>` returned by `getQuote()` does not contain `calldata` necessary to perform a swap, only quote data for display purposes).

```typescript=
const { getQuote } from "layer2";

 const newQuote = await getQuote(
        tokenIn,
        tokenOut,
        amount,
        false,
        apiKey,
        abortSignal
      );

// Returns
// >>
 interface QuoteDetails {
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
```

3. Get Swap Params

> If a user has connected their wallet, we have all the data needed by the quote api to return to us the `calldata` necessary to perform a swap.

```typescript=
const { getSwapParams, useSendTransaction, useLayer2, formatEther } from "layer2";



const App = ()=> {
    const { sendTransaction, state } = useSendTransaction();
    const { account } = useLayer2()
    const balance = useEtherBalance(account);

    const res = await getSwapParams(
          Number(formatEther(balance)),
          tokenIn,
          tokenOut,
          amount,
          account, // or specify custom receiver address
          false,
          {
            1, // 1%
            200, // 200 seconds
          },
          apiKey
        );

// Returns
// >>
interface SwapParams {
  data: string; // route.methodParameters.calldata,
  to: string; //  V3_SWAP_ROUTER_ADDRESS,
  value: BigNumber; // BigNumber.from(route.methodParameters.value),
  gasPrice: BigNumber; // this we can choose not to pass to user's wallet, the wallet make a more recent estimate anyway
}

//   Take what we need from the response and submit the transaction
    const {data, to, value } = res;

 sendTransaction({
            data: data,
            to: to,
            value: value,
            from: receiverAddress,
          });

    // we can also track the current status of the transaction in the UI.
    return (
        <div>
            {state.status === "Mining" && (<p>Transaction pending...</p>)}
             {state.status === "Success" && (<p>Success!! 🚀</p>)}
        </div>

    )

```

## Other Useful things

### Hooks/Context

1. EnsContext

> Since many users might connect a wallet that has either an ens name or an ens avatar registered to it, we would like to show this to the user. The items returned by the context are _only_ relevant to the wallet currently connected to the dApp.

**Usage**

```typescript=
import {shortenIfAddress, useEns, useLayer2} from "layer2"

const App = ()=> {
  const { ensName, ensAvatar } = useEns(); // >> <string | null>
  const { account } = useLayer2();

  return (
    <p>Your wallet: {ensName ?? shortenIfAddress(account)} </p>
    {ensAvatar && <img src={ensAvatar} alt="avatar image" />}
  )

  // Your wallet: vitalik.eth   or 0xC54...5a48
  // 🤖  or [nothing]
}


```

2. Inidividual ENS hooks

> There are hooks that resolve for ens that we might want to use for wallets _other_ that the one connected to the dAPP.

- useEnsName

**Usage**

```typescript=
const address = '0xC54070dA79E7E3e2c95D3a91fe98A42000e65a48';
const name = useEnsName(address); // >> <string | null>
```

- useEnsAddress

**Usage**

```typescript=
const name = 'vitalik.eth';
const address = useEnsAddress(name); // >> <string | null>
```

- useEnsAvatar

**Usage**

```typescript=
const name = 'vitalik.eth';
const address = '0xC54070dA79E7E3e2c95D3a91fe98A42000e65a48';
const address = useEnsAvatar([name, address]); // >> <string | null>

// this hook wil attempt to resolve each item in the array until it finds something
```

- addTokenToMetamask

**Usage**

```typescript=

const token = {
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    decimals: 18,
    chainId: 1,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
}
const { addToken, success } useAddTokenToMetamask(token);


return (
    <>
        <button onClick={addToken}>
            add DAI to wallet
        </button>
        {success && <p>Success!! 🥳</p>}
    </>

)
```

## Utils

- uriToHttp

> Since many assets in the web3 ecosystem are stored on ipfs/ arweave or other distributed storage solutions, we would like to convert any URLs using such protocols to one using https so that we may reliably retrieve said asset from all browsers. (not everyone has ipfs support set up in their browser)

**Usage**

```typescript=
import { uriToHttp } from 'layer2';

const httpsArray = uriToHttp(
  'ipfs://QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir'
);

console.log(httpsArray[0]);

// https://cloudflare-ipfs.com/ipfs/QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir/
```

## Tests

**Stack**

- [Jest](https://jestjs.io/)
- [msw.js](https://mswjs.io/)
- [@ethereum-waffle/provider](https://ethereum-waffle.readthedocs.io/en/latest/basic-testing.html)

**Coverage**

Coverage is collected from the following files:

- src/core/core.tsx
- src/core/utils.ts

All [Quote API](https://github.com/Exohood Fiat to Crypto/routing-api) routes are mocked using _mock service worker_ inside `test/mocks/handlers.ts`.

There are, however some caveats to this:

- "Happy paths" are accurately mocked. ie. the mock servcie worker will behave _exactly_ like the actual API if conditions for success are met.

- "Unhappy paths" are **not** accurately mocked as this would require implementing all the API logic again in this repo just for the sake of testing. Furthermore, this would be pretty pointless anyway since the purpose of _these_ tests are not to test how the API responds, but instead are meant to test how this SDK _handles_ those responses.

To run the tests locally, fromt eh root folder, run:

```shell
yarn test
```
