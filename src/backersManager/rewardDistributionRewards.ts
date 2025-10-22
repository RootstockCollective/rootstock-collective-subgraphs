import { RewardDistributionRewards as RewardDistributionRewardsEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { COINBASE_ADDRESS, loadOrCreateCycle, loadOrCreateCycleRewardPerToken, updateBlockInfo } from "../utils";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleRewardDistributionRewards(
  event: RewardDistributionRewardsEvent
): void {

  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );
  const currentCycleStart = backersManagerContract.cycleStart(event.block.timestamp);

  const cycle = loadOrCreateCycle(changetype<Bytes>(Bytes.fromBigInt(currentCycleStart)));
  cycle.onDistributionPeriod = true;
  cycle.currentCycleStart = currentCycleStart;
  cycle.currentCycleDuration = backersManagerContract.getCycleStartAndDuration().getValue1();
  cycle.distributionDuration = backersManagerContract.distributionDuration();
  cycle.save();

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
