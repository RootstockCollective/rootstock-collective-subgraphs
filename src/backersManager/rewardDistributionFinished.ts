import { RewardDistributionFinished as RewardDistributionFinishedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Bytes } from "@graphprotocol/graph-ts";
import { loadOrCreateCycle, loadOrCreateGlobalMetric, updateBlockInfo } from "../utils";

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );

  const cycleStart = backersManagerContract.cycleStart(event.block.timestamp);
  const cycle = loadOrCreateCycle(changetype<Bytes>(Bytes.fromBigInt(cycleStart)));
  cycle.onDistributionPeriod = false;
  cycle.save();

  const globalMetric = loadOrCreateGlobalMetric();
  globalMetric.totalPotentialReward = backersManagerContract.totalPotentialReward();
  globalMetric.save();

  updateBlockInfo(event, ["Cycle", "GlobalMetric"]);
}
