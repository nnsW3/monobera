import { bhoneyVaultContractAddress } from "@bera/config";
import useSWR, { useSWRConfig } from "swr";
import useSWRImmutable from "swr/immutable";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";

import { bTokenAbi } from "~/abi";
import POLLING from "~/enum/polling";
import { useBeraJs } from "~/contexts";

export const usePollPerpsBgtRewards = () => {
  const publicClient = usePublicClient();
  const method = "pendingBGT";
  const { account } = useBeraJs();
  const QUERY_KEY = [account, method];
  const { mutate } = useSWRConfig();
  const { isLoading } = useSWR(
    QUERY_KEY,
    async () => {
      if (!publicClient) return undefined;
      try {
        const result = await publicClient.readContract({
          address: bhoneyVaultContractAddress,
          abi: bTokenAbi,
          functionName: method,
          args: [account],
        });
        return Number(formatUnits(result as bigint, 18));
      } catch (e) {
        console.error(e);
        return undefined;
      }
    },
    {
      refreshInterval: POLLING.FAST,
    },
  );

  const useBgtRewards = () => {
    const { data = undefined } = useSWRImmutable<number | undefined>(QUERY_KEY);
    return data;
  };
  return {
    QUERY_KEY,
    refetch: () => mutate(QUERY_KEY),
    useBgtRewards,
    isLoading,
  };
};
