const CHAIN_INFO = {
  MAINNET: {
    chainId: "0x5A",
    chainName: "Zilionixx Mainnet",
    nativeCurrency: {
      name: "ZNX Coin",
      symbol: "ZNX",
      decimals: 18,
    },
    rpcUrls: ["https://rpc1.znxscan.com"],
    blockExplorerUrls: ["https://znxscan.com"],
  },
  TESTNET: {
    chainId: "0x5D",
    chainName: "Zilionixx Testnet",
    nativeCurrency: {
      name: "ZNX Coin",
      symbol: "ZNX",
      decimals: 18,
    },
    rpcUrls: ["https://testrpc1.znxscan.com"],
    blockExplorerUrls: ["https://testnet.znxscan.com"],
  },
};

const ORDER_STATUS = {
  active: "active",
  success: "success",
  cancel: "cancel",
};

module.exports = { CHAIN_INFO, ORDER_STATUS };
