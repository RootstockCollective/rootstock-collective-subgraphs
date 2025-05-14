import { GaugeCreated as GaugeCreatedEvent } from "../../../generated/BackersManagerRootstockCollectiveV1/BackersManagerRootstockCollectiveV1";
import { Builder, GaugeToBuilder } from "../../../generated/schema";
import { GaugeRootstockCollective } from "../../../generated/templates";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
  GaugeRootstockCollective.create(event.params.gauge_);

  let builder = Builder.load(event.params.builder_);
  if (builder == null) {
    builder = new Builder(event.params.builder_);
    builder.totalAllocation_ = BigInt.zero();
    builder.isHalted_ = false;
    builder.totalAllocation_ = BigInt.zero();
    builder.rewardShares_ = BigInt.zero();
    builder.lastCycleRewards_ = BigInt.zero();
    builder.rewardReceiver_ = Bytes.empty();
    builder.backerRewardPercentage_ = BigInt.zero();
  }
  builder.gauge_ = event.params.gauge_;

  builder.save();

  const gaugeToBuilder = new GaugeToBuilder(event.params.gauge_);
  gaugeToBuilder.builder_ = builder.id;
  gaugeToBuilder.save();
}
