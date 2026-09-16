import { Address } from "@graphprotocol/graph-ts";
import { BackersManagerRootstockCollective } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { GaugeNotifyReward } from "../../generated/schema";
import { NotifyReward as NotifyRewardEvent } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { loadOrCreateContractConfig, updateBlockInfo } from "../utils";

/**
 * Per-gauge reward distribution. The BackersManager NotifyReward handler only
 * keeps the cycle-wide total (CycleRewardPerToken); this keeps the per-gauge
 * split between builder and backers, which is what the builders table reads.
 */
export function handleNotifyReward(event: NotifyRewardEvent): void {
  const entity = new GaugeNotifyReward(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );

  const contractConfig = loadOrCreateContractConfig();
  const backersManagerContract = BackersManagerRootstockCollective.bind(
    Address.fromBytes(contractConfig.backersManager),
  );

  entity.gauge = event.address;
  entity.rewardToken = event.params.rewardToken_;
  entity.builderAmount = event.params.builderAmount_;
  entity.backersAmount = event.params.backersAmount_;
  entity.cycleStart = backersManagerContract.cycleStart(event.block.timestamp);
  entity.blockTimestamp = event.block.timestamp;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  updateBlockInfo(event, ["GaugeNotifyReward"]);
}
