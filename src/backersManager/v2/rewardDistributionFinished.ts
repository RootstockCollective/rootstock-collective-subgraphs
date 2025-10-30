import { RewardDistributionFinished as RewardDistributionFinishedEvent } from "../../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { GaugeRootstockCollective as GaugeRootstockCollectiveContract } from "../../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { Builder } from "../../../generated/schema";
import { loadOrCreateCycle, loadOrCreateGlobalMetric, logEntityNotFound, updateBlockInfo } from "../../utils";
import { Address, Bytes } from "@graphprotocol/graph-ts";

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
  for (let i = 0; i < globalMetric.builders.length; i++) {
    const builder = globalMetric.builders[i];
    const builderEntity = Builder.load(builder);
    if (builderEntity == null) {
      logEntityNotFound('Builder', builder.toString(), 'handleRewardDistributionFinished');
      continue;
    }

    const gauge = GaugeRootstockCollectiveContract.bind(Address.fromBytes(builderEntity.gauge));
    builderEntity.rewardShares = gauge.rewardShares();
    builderEntity.save();
  }
  globalMetric.totalPotentialReward = backersManagerContract.totalPotentialReward();
  globalMetric.save();

  updateBlockInfo(event, ["Builder", "Cycle", "GlobalMetric"]);
}
