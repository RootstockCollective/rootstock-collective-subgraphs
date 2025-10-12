import { DefaultRewardAmountsUpdated as DefaultRewardAmountsUpdatedEvent } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { COINBASE_ADDRESS, loadOrCreateGlobalDefaultAmount, loadOrCreateGlobalMetric, updateBlockInfo } from "../utils";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";

export function handleDefaultRewardAmountsUpdated(event: DefaultRewardAmountsUpdatedEvent): void {
  const globalMetric = loadOrCreateGlobalMetric();
  const rewardDistributorContract = RewardDistributorRootstockCollectiveContract.bind(event.address);
  
  const nativeDefaultAmount = loadOrCreateGlobalDefaultAmount(COINBASE_ADDRESS, globalMetric);
  nativeDefaultAmount.amount = event.params.nativeAmount_;
  nativeDefaultAmount.save();

  const usdrifDefaultAmount = loadOrCreateGlobalDefaultAmount(rewardDistributorContract.usdrifToken(), globalMetric);
  usdrifDefaultAmount.amount = event.params.usdrifAmount_;
  usdrifDefaultAmount.save();

  const rifDefaultAmount = loadOrCreateGlobalDefaultAmount(rewardDistributorContract.rifToken(), globalMetric);
  rifDefaultAmount.amount = event.params.rifAmount_;
  rifDefaultAmount.save();

  updateBlockInfo(event, ["GlobalDefaultAmount"]);
}
