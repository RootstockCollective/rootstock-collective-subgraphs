import { Address, BigInt } from "@graphprotocol/graph-ts";
import { GaugeToBuilder, BuilderToGauge, Builder, BuilderState } from "../generated/schema";
import { GaugeRootstockCollective } from "../generated/templates";
import { DEFAULT_BIGINT, DEFAULT_BYTES } from "./utils";

export function gaugeCreated(builder: Address, gauge: Address): void {
  GaugeRootstockCollective.create(gauge);

  const gaugeToBuilder = new GaugeToBuilder(gauge);
  gaugeToBuilder.builder = builder;
  gaugeToBuilder.save();

  const builderToGauge = new BuilderToGauge(builder);
  builderToGauge.gauge = gauge;
  builderToGauge.save();
}

export function communityApproved(builder: Address): void {
  const builderEntity = createOrLoadBuilder(builder);
  const builderToGauge = BuilderToGauge.load(builder);
  if (builderToGauge != null) {
    builderEntity.gauge = builderToGauge.gauge;
  }

  const builderState = createOrLoadBuilderState(builder);
  builderState.communityApproved = true;

  builderEntity.save();
  builderState.save();
}

export function builderInitialized(
  builder: Address,
  rewardReceiver: Address,
  rewardPercentage: BigInt
): void {
  const builderEntity = createOrLoadBuilder(builder);
  builderEntity.rewardReceiver = rewardReceiver;
  builderEntity.backerRewardPercentage = rewardPercentage;

  const builderState = createOrLoadBuilderState(builder);
  builderState.kycApproved = true;
  builderState.initialized = true;

  builderEntity.save();
  builderState.save();
}

export function createOrLoadBuilder(builder: Address): Builder {
  let builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    builderEntity = new Builder(builder);
    builderEntity.isHalted = false;
    builderEntity.lastCycleRewards = DEFAULT_BIGINT;
    builderEntity.totalAllocation = DEFAULT_BIGINT;
    builderEntity.rewardShares = DEFAULT_BIGINT;
    builderEntity.gauge = DEFAULT_BYTES;
    builderEntity.backerRewardPercentage = DEFAULT_BIGINT;
    builderEntity.rewardReceiver = DEFAULT_BYTES;
  }

  return builderEntity;
}

export function createOrLoadBuilderState(builder: Address): BuilderState {
  let builderState = BuilderState.load(builder);
  if (builderState == null) {
    builderState = new BuilderState(builder);
    builderState.builder = builder;
    builderState.initialized = false;
    builderState.kycApproved = false;
    builderState.communityApproved = false;
    builderState.kycPaused = false;
    builderState.selfPaused = false;
    builderState.pausedReason = "";
  }

  return builderState;
}