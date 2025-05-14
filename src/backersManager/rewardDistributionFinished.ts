import { RewardDistributionFinished as RewardDistributionFinishedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Cycle } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  let cycle = Cycle.load(event.address);
  if (cycle == null) {
    cycle = new Cycle(event.address);
    cycle.totalPotentialReward_ = BigInt.zero();
    cycle.periodFinish_ = BigInt.zero();
    cycle.cycleDuration_ = BigInt.zero();
    cycle.distributionDuration_ = BigInt.zero();
    cycle.rewardsERC20_ = BigInt.zero();
    cycle.rewardsRBTC_ = BigInt.zero();
  }
  cycle.onDistributionPeriod_ = false;

  cycle.save();
}
