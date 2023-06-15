import { useEffect, useState } from "react";
import { useGetAssetsQuery } from "../../../store/api/endpoints/asset/Asset";
import {
  Asset_t,
  Blockchain_t,
  WrappedToken,
} from "../../../store/api/endpoints/types";
import { useAppSelector } from "../../../store/hooks";
import { IAssets } from "../../../store/api/endpoints/asset/Asset.interface";
import { Token } from "../../../store/api/types";

const predicate = (
  key: string,
  assets: IAssets,
  currentBlockchain: Blockchain_t
) => assets[key as Asset_t][currentBlockchain];

export const useAvailableTokens = () => {
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);

  const currentBlockchain = useAppSelector(
    (state) => state.connection.currentBlockchain
  );
  const { data: assets, isLoading } = useGetAssetsQuery();

  useEffect(() => {
    if (assets && currentBlockchain) {
      const f = (key: string) => predicate(key, assets, currentBlockchain);
      setAvailableTokens(
        Object.keys(assets)
          .filter(f)
          .map((key) => {
            const name = key as Asset_t;
            return {
              ...assets[name][currentBlockchain],
              name,
              image: assets[name].image,
              type: assets[name][currentBlockchain].is_native
                ? "Native"
                : WrappedToken[name]
                  ? "Wrapped"
                  : name.includes("usdc") ||
                    name.includes("usdt") ||
                    name.includes("dai")
                    ? "Stable"
                    : "Other",
            };
          })
      );
    }
  }, [currentBlockchain, assets]);
  return { availableTokens, isAvailalbeTokensLoading: isLoading };
};
