import { DefaultRewardAmountsUpdated as DefaultRewardAmountsUpdatedEvent } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { COINBASE_ADDRESS, loadOrCreateGlobalDistributionPerToken, loadOrCreateGlobalMetric, updateBlockInfo } from "../utils";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";

export function handleDefaultRewardAmountsUpdated(event: DefaultRewardAmountsUpdatedEvent): void {
  const globalMetric = loadOrCreateGlobalMetric();
  const rewardDistributorContract = RewardDistributorRootstockCollectiveContract.bind(event.address);
  
  const nativeDistributionPerToken = loadOrCreateGlobalDistributionPerToken(COINBASE_ADDRESS, globalMetric);
  nativeDistributionPerToken.amount = event.params.nativeAmount_;
  nativeDistributionPerToken.save();

  const usdrifDistributionPerToken = loadOrCreateGlobalDistributionPerToken(rewardDistributorContract.usdrifToken(), globalMetric);
  usdrifDistributionPerToken.amount = event.params.usdrifAmount_;
  usdrifDistributionPerToken.save();

  const rifDistributionPerToken = loadOrCreateGlobalDistributionPerToken(rewardDistributorContract.rifToken(), globalMetric);
  rifDistributionPerToken.amount = event.params.rifAmount_;
  rifDistributionPerToken.save();

  updateBlockInfo(event, ["GlobalMetric", "GlobalDistributionPerToken"]);
}
