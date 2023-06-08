import { IAssets } from "../endpoints/asset/Asset.interface";
import { Asset_t, Blockchain_t } from "../endpoints/types";
export const findAsset = (
  assets: IAssets,
  asset: Asset_t,
  blockchain: Blockchain_t
) => {
  return assets[asset][blockchain];
};
