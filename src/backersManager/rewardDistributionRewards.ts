import { RewardDistributionRewards as RewardDistributionRewardsEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { COINBASE_ADDRESS, loadOrCreateCycle, loadOrCreateCycleRewards, updateBlockInfo } from "../utils";
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

  const rifCycleRewards = loadOrCreateCycleRewards(backersManagerContract.rifToken(), cycle);
  rifCycleRewards.amount = event.params.rifAmount_;
  rifCycleRewards.save();

  const usdrifCycleRewards = loadOrCreateCycleRewards(backersManagerContract.usdrifToken(), cycle);
  usdrifCycleRewards.amount = event.params.usdrifAmount_;
  usdrifCycleRewards.save();

  const nativeCycleRewards = loadOrCreateCycleRewards(COINBASE_ADDRESS, cycle);
  nativeCycleRewards.amount = event.params.nativeAmount_;
  nativeCycleRewards.save();

  updateBlockInfo(event, ["Cycle", "CycleRewards"]);
}
