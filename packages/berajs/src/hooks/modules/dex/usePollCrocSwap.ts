import useSWR from "swr";
import { type Address } from "viem";
import { usePublicClient } from "wagmi";

import { getSwap } from "~/actions/dex";
import { useBeraJs } from "~/contexts";
import { SwapRequest, type DefaultHookOptions } from "~/types";

type IUsePollSwapsArgs = SwapRequest;
interface IUsePollSwapsOptions extends DefaultHookOptions {
  isTyping?: boolean | undefined;
}

export interface SwapInfoV3 {
  batchSwapSteps: ICrocSwapStep[];
  formattedSwapAmount: string;
  formattedReturnAmount: string;
  formattedAmountIn: string;
  amountIn: bigint;
  returnAmount: bigint;
  tokenIn: string;
  tokenOut: string;
  value?: bigint;
  predictedAmountOut: bigint;
  formattedPredictedAmountOut: string;
}

export interface ICrocSwapStep {
  poolIdx: bigint;
  base: Address;
  quote: Address;
  isBuy: boolean;
}

/**
 * Polls a pair for the optimal route and amount for a swap
 */
export const usePollCrocSwap = (
  args: IUsePollSwapsArgs,
  options?: IUsePollSwapsOptions,
) => {
  const { tokenIn, tokenOut, amount, tokenInDecimals, tokenOutDecimals } = args;
  const publicClient = usePublicClient();
  const QUERY_KEY = [tokenIn, tokenOut, amount, options?.isTyping];
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;
  return useSWR<SwapInfoV3 | undefined>(
    QUERY_KEY,
    async () => {
      try {
        if (!publicClient || !config) return undefined;
        if (options?.isTyping !== undefined && options?.isTyping === true) {
          return {
            batchSwapSteps: [],
            formattedSwapAmount: amount ? amount.toString() : "0",
            formattedAmountIn: "0",
            formattedReturnAmount: "0",
            amountIn: 0n,
            returnAmount: 0n,
            tokenIn,
            tokenOut,
            priceImpactPercentage: 0,
            predictedAmountOut: 0n,
            formattedPredictedAmountOut: "0",
          };
        }
        return getSwap({
          args: {
            tokenIn,
            tokenOut,
            tokenInDecimals,
            tokenOutDecimals,
            amount,
          },
          config,
          publicClient,
        });
      } catch (e) {
        // TODO: throws so many errors but this is good 4 debug
        console.error(e);
        return {
          batchSwapSteps: [],
          formattedSwapAmount: amount ? amount.toString() : "0",
          formattedAmountIn: "0",
          formattedReturnAmount: "0",
          amountIn: 0n,
          returnAmount: 0n,
          tokenIn,
          tokenOut,
          predictedAmountOut: 0n,
          formattedPredictedAmountOut: "0",
        };
      }
    },
    {
      ...options?.opts,
    },
  );
};
