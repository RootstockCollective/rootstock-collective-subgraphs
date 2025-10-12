import { RewardDistributionStarted as RewardDistributionStartedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Bytes } from "@graphprotocol/graph-ts";
import { loadOrCreateCycle, updateBlockInfo } from "../utils";

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
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

  updateBlockInfo(event, ["Cycle"]);
}
