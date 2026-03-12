import { RewardDistributionRewards as RewardDistributionRewardsEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { COINBASE_ADDRESS, loadOrCreateContractConfig, loadOrCreateCycleRewardPerToken, updateBlockInfo } from "../utils";
import { Cycle } from "../../generated/schema";

export function handleRewardDistributionRewards(
  event: RewardDistributionRewardsEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );

  const contractConfig = loadOrCreateContractConfig();
  const cycle = Cycle.load(contractConfig.distributingCycleId);
  if (cycle == null) return;

  const rifCycleRewardPerToken = loadOrCreateCycleRewardPerToken(backersManagerContract.rifToken(), cycle);
  rifCycleRewardPerToken.amount = event.params.rifAmount_;
  rifCycleRewardPerToken.save();

  const usdrifCycleRewardPerToken = loadOrCreateCycleRewardPerToken(backersManagerContract.usdrifToken(), cycle);
  usdrifCycleRewardPerToken.amount = event.params.usdrifAmount_;
  usdrifCycleRewardPerToken.save();

  const nativeCycleRewardPerToken = loadOrCreateCycleRewardPerToken(COINBASE_ADDRESS, cycle);
  nativeCycleRewardPerToken.amount = event.params.nativeAmount_;
  nativeCycleRewardPerToken.save();

  updateBlockInfo(event, ["Cycle", "CycleRewardPerToken"]);
}
