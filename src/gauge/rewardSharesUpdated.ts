import { RewardSharesUpdated as RewardSharesUpdatedEvent } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { Builder, GaugeToBuilder } from "../../generated/schema";
import { logEntityNotFound, updateBlockInfo } from "../utils";

export function handleRewardSharesUpdated(
  event: RewardSharesUpdatedEvent
): void {
  const gaugeToBuilder = GaugeToBuilder.load(event.address);
  if (gaugeToBuilder == null) {
    logEntityNotFound('GaugeToBuilder', event.address.toHexString(), 'handleRewardSharesUpdated');
    return;
  }

  const builder = Builder.load(gaugeToBuilder.builder);
  if (builder == null) {
    logEntityNotFound('Builder', gaugeToBuilder.builder.toHexString(), 'handleRewardSharesUpdated');
    return;
  }

  builder.rewardShares = event.params.rewardShares_;
  builder.save();

  updateBlockInfo(event, ["Builder"]);
}
