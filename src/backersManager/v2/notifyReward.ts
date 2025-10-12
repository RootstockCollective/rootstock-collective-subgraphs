import { NotifyReward as NotifyRewardEvent } from "../../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { loadOrCreateCycle, updateBlockInfo, loadOrCreateCycleRewards } from "../../utils";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleNotifyReward(
  event: NotifyRewardEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(event.address);
  const nextCycleStart = backersManagerContract.cycleNext(event.block.timestamp);
  const currentCycleStart = backersManagerContract.cycleStart(event.block.timestamp);
  const cycle = loadOrCreateCycle(changetype<Bytes>(Bytes.fromBigInt(nextCycleStart)));

  cycle.previousCycleStart = currentCycleStart;
  cycle.previousCycleDuration = backersManagerContract.getCycleStartAndDuration().getValue1();
  cycle.currentCycleStart = nextCycleStart;
  cycle.distributionDuration = backersManagerContract.distributionDuration();
  cycle.save();

  const cycleRewardsAmount = loadOrCreateCycleRewards(event.params.rewardToken_, cycle);
  cycleRewardsAmount.amount = cycleRewardsAmount.amount.plus(event.params.amount_);
  cycleRewardsAmount.save();

  updateBlockInfo(event, ["Cycle", "CycleRewardsAmount"]);
}
