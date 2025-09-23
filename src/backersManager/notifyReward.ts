import { NotifyReward as NotifyRewardEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { loadOrCreateCycle, updateBlockInfo } from "../utils";
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

  // Update rewards for this cycle
  if (event.params.rewardToken_.equals(backersManagerContract.rewardToken())) {
    cycle.rewardsERC20 = cycle.rewardsERC20.plus(event.params.amount_);
  } else {
    cycle.rewardsRBTC = cycle.rewardsRBTC.plus(event.params.amount_);
  }

  cycle.save();

  updateBlockInfo(event, ["Cycle"]);
}
