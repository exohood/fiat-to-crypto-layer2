export const TOKEN_LIST = 'https://tokens.uniswap.org/';

export const getUniswapTokens = async () => {
  return fetch(TOKEN_LIST);
};
