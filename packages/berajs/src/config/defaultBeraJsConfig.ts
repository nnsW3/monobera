import { type Chain } from "wagmi";

import { type NetworkConfig } from "./types";

const PolarisChain: Chain = {
  id: 2061,
  name: "Polaris",
  network: "Polaris",
  nativeCurrency: {
    decimals: 18,
    name: "Polaris",
    symbol: "tbera",
  },
  blockExplorers: {
    etherscan: {
      name: "PolarScan",
      url: "k8s-guardedt-explorer-f0d73f8a8b-1f6003a02eec3390.elb.us-west-2.amazonaws.com",
    },
    default: {
      name: "PolarScan",
      url: "k8s-guardedt-explorer-f0d73f8a8b-1f6003a02eec3390.elb.us-west-2.amazonaws.com",
    },
  },
  rpcUrls: {
    default: {
      http: [
        "http://devnet.beraswillmakeit.com:8545",
        "http://guarded.beraswillmakeit.com:8545",
      ],
    },
    public: {
      http: [
        "http://k8s-guardedt-archive0-706b2d9d3e-0a11fbacff1901c5.elb.us-west-2.amazonaws.com:8545",
      ],
    },
  },
};

export const defaultBeraConfig: NetworkConfig = {
  precompileAddresses: {
    multicall: "0x0000",
  },
  chain: PolarisChain,
};
