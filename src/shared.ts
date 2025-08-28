import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { GaugeToBuilder, Builder, BuilderState } from "../generated/schema";
import { GaugeRootstockCollective } from "../generated/templates";
import { loadOrCreateBuilder, loadOrCreateBackerRewardPercentage, loadOrCreateBuilderState, logEntityNotFound, updateBlockInfo, loadOrCreateGlobalMetric } from "./utils";

export function gaugeCreated(builder: Address, gauge: Address, event: ethereum.Event): void {
  GaugeRootstockCollective.create(gauge);

  const builderEntity = loadOrCreateBuilder(builder);
  builderEntity.gauge = gauge;
  builderEntity.save();

  const backerRewardPercentage = loadOrCreateBackerRewardPercentage(builder);
  backerRewardPercentage.save();

  const gaugeToBuilder = new GaugeToBuilder(gauge);
  gaugeToBuilder.builder = builder;
  gaugeToBuilder.save();

  const globalMetric = loadOrCreateGlobalMetric();
  const builders = globalMetric.builders;
  builders.push(builder);
  globalMetric.builders = builders;
  globalMetric.save();

  updateBlockInfo(event, ["Builder", "BackerRewardPercentage", "GaugeToBuilder", "GlobalMetric"]);
}

export function communityApproved(builder: Address, event: ethereum.Event): void {
  const builderState = loadOrCreateBuilderState(builder);
  builderState.communityApproved = true;
  builderState.save();

  updateBlockInfo(event, ["BuilderState"]);
}

export function builderInitialized(
  builder: Address,
  rewardReceiver: Address,
  rewardPercentage: BigInt,
  cooldown: BigInt,
  event: ethereum.Event
): void {
  const builderEntity = loadOrCreateBuilder(builder);
  builderEntity.rewardReceiver = rewardReceiver;

  const builderState = loadOrCreateBuilderState(builder);
  builderState.kycApproved = true;
  builderState.initialized = true;

  const backerRewardPercentage = loadOrCreateBackerRewardPercentage(builder);
  backerRewardPercentage.next = rewardPercentage;
  backerRewardPercentage.previous = rewardPercentage;
  backerRewardPercentage.cooldownEndTime = cooldown;

  builderEntity.save();
  builderState.save();
  backerRewardPercentage.save();

  updateBlockInfo(event, ["Builder", "BuilderState", "BackerRewardPercentage"]);
}

export function communityBanned(builder: Address, event: ethereum.Event): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.communityBanned');
    return;
  }
  haltBuilder(builderEntity); // Updates Builder and GlobalMetric

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.communityBanned');
    return;
  }
  builderState.communityApproved = false;
  builderState.save();

  updateBlockInfo(event, ["Builder", "BuilderState", "GlobalMetric"]);
}

export function kycApproved(builder: Address, event: ethereum.Event): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.kycApproved');
    return;
  }
  resumeBuilder(builderEntity); // Updates Builder and GlobalMetric

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.kycApproved');
    return;
  }
  builderState.kycApproved = true;
  builderState.save();

  updateBlockInfo(event, ["Builder", "BuilderState", "GlobalMetric"]);
}

export function kycRevoked(builder: Address, event: ethereum.Event): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.kycRevoked');
    return;
  }
  haltBuilder(builderEntity); // Updates Builder and GlobalMetric

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.kycRevoked');
    return;
  }
  builderState.kycApproved = false;
  builderState.save();

  updateBlockInfo(event, ["Builder", "BuilderState", "GlobalMetric"]);
}

export function kycPaused(builder: Address, reason: Bytes, event: ethereum.Event): void {
  const builderState = loadOrCreateBuilderState(builder);
  builderState.kycPaused = true;
  builderState.pausedReason = reason;
  builderState.save();

  updateBlockInfo(event, ["BuilderState"]);
}

export function kycResumed(builder_: Address, event: ethereum.Event): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder_.toHexString(), 'Shared.kycResumed');
    return;
  }
  builderState.kycPaused = false;
  builderState.save();

  updateBlockInfo(event, ["BuilderState"]);
}

export function selfPaused(builder: Address, event: ethereum.Event): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.selfPaused');
    return;
  }
  haltBuilder(builderEntity); // Updates Builder and Cycle

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.selfPaused');
    return;
  }
  builderState.selfPaused = true;
  builderState.save();

  updateBlockInfo(event, ["Builder", "BuilderState", "Cycle"]);
}

export function selfResumed(builder: Address, rewardPercentage: BigInt, cooldown: BigInt, timestamp: BigInt, event: ethereum.Event): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.selfResumed');
    return;
  }
  resumeBuilder(builderEntity); // Updates Builder and GlobalMetric

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.selfResumed');
    return;
  }
  builderState.selfPaused = false;
  builderState.save();

  updateBackerRewardPercentage(builder, rewardPercentage, cooldown, timestamp);
  updateBlockInfo(event, ["Builder", "BuilderState", "BackerRewardPercentage", "GlobalMetric"]);
}

export function rewardReceiverUpdated(
  builder: Address,
  newRewardReceiver: Address,
  event: ethereum.Event
): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.rewardReceiverUpdated');
    return;
  }
  builderEntity.rewardReceiver = newRewardReceiver;
  builderEntity.save();

  updateBlockInfo(event, ["Builder"]);
}

export function backerRewardPercentageUpdateScheduled(builder: Address, rewardPercentage: BigInt, cooldown: BigInt, timestamp: BigInt, event: ethereum.Event): void {
  updateBackerRewardPercentage(builder, rewardPercentage, cooldown, timestamp);
  updateBlockInfo(event, ["BackerRewardPercentage"]);
}

function resumeBuilder(builderEntity: Builder): void {
  builderEntity.isHalted = false;
  builderEntity.save();

  const globalMetric = loadOrCreateGlobalMetric();
  const totalPotentialReward = globalMetric.totalPotentialReward.plus(builderEntity.rewardShares);
  globalMetric.totalPotentialReward = totalPotentialReward;
  globalMetric.save();
}

function haltBuilder(builderEntity: Builder): void {
  builderEntity.isHalted = true;
  builderEntity.save();

  const globalMetric = loadOrCreateGlobalMetric();
  const totalPotentialReward = globalMetric.totalPotentialReward.minus(builderEntity.rewardShares);
  globalMetric.totalPotentialReward = totalPotentialReward;
  globalMetric.save();
}

function updateBackerRewardPercentage(builder: Address, rewardPercentage: BigInt, cooldown: BigInt, timestamp: BigInt): void {
  const backerRewardPercentage = loadOrCreateBackerRewardPercentage(builder);
  if (timestamp.ge(backerRewardPercentage.cooldownEndTime)) {
    backerRewardPercentage.previous = backerRewardPercentage.next;
  }
  backerRewardPercentage.cooldownEndTime = cooldown;
  backerRewardPercentage.next = rewardPercentage;
  backerRewardPercentage.save();
}
