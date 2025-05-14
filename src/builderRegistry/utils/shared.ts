import {
  Builder,
  BuilderState,
  GaugeToBuilder,
} from "../../../generated/schema";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GaugeRootstockCollective } from "../../../generated/templates";

export function gaugeCreated(builder_: Address, gauge_: Address): void {
  GaugeRootstockCollective.create(gauge_);

  let builder = Builder.load(builder_);
  if (builder == null) {
    builder = new Builder(builder_);
    builder.totalAllocation_ = BigInt.zero();
    builder.isHalted_ = false;
    builder.totalAllocation_ = BigInt.zero();
    builder.rewardShares_ = BigInt.zero();
    builder.lastCycleRewards_ = BigInt.zero();
    builder.rewardReceiver_ = Bytes.empty();
    builder.backerRewardPercentage_ = BigInt.zero();
  }
  builder.gauge_ = gauge_;

  const gaugeToBuilder = new GaugeToBuilder(gauge_);
  gaugeToBuilder.builder_ = builder.id;

  builder.save();
  gaugeToBuilder.save();
}

export function builderInitialized(
  builder_: Address,
  rewardReceiver_: Address,
  rewardPercentage_: BigInt
): void {
  const builder = Builder.load(builder_);
  if (builder == null) return;
  builder.rewardReceiver_ = rewardReceiver_;
  builder.backerRewardPercentage_ = rewardPercentage_;
  let builderState = BuilderState.load(builder.id);
  if (builderState == null) {
    builderState = new BuilderState(builder.id);
    builderState.builder_ = builder.id;
    builderState.kycPaused_ = false;
    builderState.selfPaused_ = false;
    builderState.communityApproved_ = false;
  }
  builderState.kycApproved_ = true;
  builderState.initialized_ = true;

  builderState.save();
  builder.save();
}

export function rewardReceiverUpdated(
  builder_: Address,
  newRewardReceiver_: Address
): void {
  const builder = Builder.load(builder_);
  if (builder == null) return;
  builder.rewardReceiver_ = newRewardReceiver_;

  builder.save();
}

export function communityApproved(builder_: Address): void {
  const builder = Builder.load(builder_);
  if (builder == null) return;
  let builderState = BuilderState.load(builder.id);
  if (builderState == null) {
    builderState = new BuilderState(builder.id);
    builderState.builder_ = builder.id;
    builderState.kycApproved_ = false;
    builderState.kycPaused_ = false;
    builderState.selfPaused_ = false;
    builderState.initialized_ = false;
    builderState.pausedReason_ = "";
  }
  builderState.communityApproved_ = true;

  builderState.save();
  builder.save();
}

export function communityBanned(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.communityApproved_ = false;
  builderState.save();
}

export function kycApproved(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.kycApproved_ = true;
  builderState.save();
}

export function kycRevoked(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.kycApproved_ = false;

  builderState.save();
}

export function kycPaused(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.kycPaused_ = true;

  builderState.save();
}

export function kycResumed(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.kycPaused_ = false;
  builderState.save();
}

export function selfPaused(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.selfPaused_ = true;

  builderState.save();
}

export function selfResumed(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.selfPaused_ = false;

  builderState.save();
}
