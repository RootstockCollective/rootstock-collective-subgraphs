import { RewardDistributionFinished as RewardDistributionFinishedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { GaugeRootstockCollective as GaugeRootstockCollectiveContract } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { Builder, ContractConfig, Cycle } from "../../generated/schema";
import { CONTRACT_CONFIG_ID, logEntityNotFound } from "../utils";
import { Address } from "@graphprotocol/graph-ts";

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );

  const cycle = Cycle.load(event.address);
  if (cycle == null) {
    logEntityNotFound('Cycle', event.address.toHexString(), 'handleRewardDistributionFinished');
    return;
  }
  cycle.onDistributionPeriod = false;
  cycle.totalPotentialReward = backersManagerContract.totalPotentialReward();
  cycle.save();

  const contractConfig = ContractConfig.load(CONTRACT_CONFIG_ID);
  if (contractConfig == null) {
    logEntityNotFound('ContractConfig', CONTRACT_CONFIG_ID.toString(), 'handleRewardDistributionFinished');
    return;
  }
  for (let i = 0; i < contractConfig.builders.length; i++) {
    const builder = contractConfig.builders[i];
    const builderEntity = Builder.load(builder);
    if (builderEntity == null) {
      logEntityNotFound('Builder', builder.toString(), 'handleRewardDistributionFinished');
      continue;
    }

    const gauge = GaugeRootstockCollectiveContract.bind(Address.fromBytes(builderEntity.gauge));

    builderEntity.rewardShares = gauge.rewardShares();
    builderEntity.save();
  }
}
