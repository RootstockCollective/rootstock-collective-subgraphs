import { RewardDistributionFinished as RewardDistributionFinishedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Cycle } from "../../generated/schema";

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  const cycle = Cycle.load(event.address);
  if (cycle == null) return;
  cycle.onDistributionPeriod = false;

  cycle.save();
}
