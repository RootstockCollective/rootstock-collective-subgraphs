import { RewardDistributionFinished as RewardDistributionFinishedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { GaugeRootstockCollective as GaugeRootstockCollectiveContract } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { Builder, ContractConfig, Cycle } from "../../generated/schema";
import { CONTRACT_CONFIG_ID } from "../utils";
import { Address } from "@graphprotocol/graph-ts";
import { calculateEstimatedRewardsPct } from "../shared";

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );

  const cycle = Cycle.load(event.address);
  if (cycle == null) return;
  cycle.onDistributionPeriod = false;
  cycle.totalPotentialReward = backersManagerContract.totalPotentialReward();

  cycle.save();

  const contractConfig = ContractConfig.load(CONTRACT_CONFIG_ID);
  if (contractConfig == null) return;
  for (let i = 0; i < contractConfig.builders.length; i++) {
    const builder = contractConfig.builders[i];
    const builderEntity = Builder.load(builder);
    if (builderEntity == null) continue;

    const gauge = GaugeRootstockCollectiveContract.bind(Address.fromBytes(builderEntity.gauge));

    builderEntity.rewardShares = gauge.rewardShares();
    builderEntity.estimatedRewardsPct = calculateEstimatedRewardsPct(builderEntity.rewardShares, cycle.totalPotentialReward);
    builderEntity.save();
  }
}
