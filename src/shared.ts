import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GaugeToBuilder, Builder, BuilderState, ContractConfig } from "../generated/schema";
import { GaugeRootstockCollective } from "../generated/templates";
import { CONTRACT_CONFIG_ID, loadOrCreateBuilder, loadOrCreateBackerRewardPercentage, loadOrCreateBuilderState, loadOrCreateCycle, logEntityNotFound } from "./utils";

export function gaugeCreated(builder: Address, gauge: Address): void {
  GaugeRootstockCollective.create(gauge);

  const builderEntity = loadOrCreateBuilder(builder);
  builderEntity.gauge = gauge;
  builderEntity.save();

  const backerRewardPercentage = loadOrCreateBackerRewardPercentage(builder);
  backerRewardPercentage.save();

  const gaugeToBuilder = new GaugeToBuilder(gauge);
  gaugeToBuilder.builder = builder;
  gaugeToBuilder.save();

  const contractConfig = ContractConfig.load(CONTRACT_CONFIG_ID);
  if (contractConfig == null) {
    logEntityNotFound('ContractConfig', CONTRACT_CONFIG_ID.toString(), 'Shared.gaugeCreated');
    return;
  }
  const builders = contractConfig.builders;
  builders.push(builder);
  contractConfig.builders = builders;
  contractConfig.save();
}

export function communityApproved(builder: Address): void {
  const builderState = loadOrCreateBuilderState(builder);
  builderState.communityApproved = true;
  builderState.save();
}

export function builderInitialized(
  builder: Address,
  rewardReceiver: Address,
  rewardPercentage: BigInt,
  cooldown: BigInt
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
}

export function communityBanned(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.communityBanned');
    return;
  }
  haltBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.communityBanned');
    return;
  }
  builderState.communityApproved = false;
  builderState.save();
}

export function kycApproved(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.kycApproved');
    return;
  }
  resumeBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.kycApproved');
    return;
  }
  builderState.kycApproved = true;
  builderState.save();
}

export function kycRevoked(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.kycRevoked');
    return;
  }
  haltBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.kycRevoked');
    return;
  }
  builderState.kycApproved = false;
  builderState.save();
}

export function kycPaused(builder: Address, reason: Bytes): void {
  const builderState = loadOrCreateBuilderState(builder);
  builderState.kycPaused = true;
  builderState.pausedReason = reason;
  builderState.save();
}

export function kycResumed(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder_.toHexString(), 'Shared.kycResumed');
    return;
  }
  builderState.kycPaused = false;
  builderState.save();
}

export function selfPaused(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.selfPaused');
    return;
  }
  haltBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.selfPaused');
    return;
  }
  builderState.selfPaused = true;
  builderState.save();
}

export function selfResumed(builder: Address, rewardPercentage: BigInt, cooldown: BigInt, timestamp: BigInt): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.selfResumed');
    return;
  }
  resumeBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) {
    logEntityNotFound('BuilderState', builder.toHexString(), 'Shared.selfResumed');
    return;
  }
  builderState.selfPaused = false;
  builderState.save();

  updateBackerRewardPercentage(builder, rewardPercentage, cooldown, timestamp);
}

export function rewardReceiverUpdated(
  builder: Address,
  newRewardReceiver: Address
): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    logEntityNotFound('Builder', builder.toHexString(), 'Shared.rewardReceiverUpdated');
    return;
  }
  builderEntity.rewardReceiver = newRewardReceiver;
  builderEntity.save();
}

export function backerRewardPercentageUpdateScheduled(builder: Address, rewardPercentage: BigInt, cooldown: BigInt, timestamp: BigInt): void {
  updateBackerRewardPercentage(builder, rewardPercentage, cooldown, timestamp);
}

function resumeBuilder(builderEntity: Builder): void {
  builderEntity.isHalted = false;
  builderEntity.save();

  const id = CONTRACT_CONFIG_ID;
  const contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    logEntityNotFound('ContractConfig', id.toString(), 'Shared.resumeBuilder');
    return;
  }

  const cycle = loadOrCreateCycle(Address.fromBytes(contractConfig.backersManager));
  const totalPotentialReward = cycle.totalPotentialReward.plus(builderEntity.rewardShares);
  cycle.totalPotentialReward = totalPotentialReward;
  cycle.save();
}

function haltBuilder(builderEntity: Builder): void {
  builderEntity.isHalted = true;
  builderEntity.save();

  const id = CONTRACT_CONFIG_ID;
  const contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    logEntityNotFound('ContractConfig', id.toString(), 'Shared.haltBuilder');
    return;
  }

  const cycle = loadOrCreateCycle(Address.fromBytes(contractConfig.backersManager));
  const totalPotentialReward = cycle.totalPotentialReward.minus(builderEntity.rewardShares);
  cycle.totalPotentialReward = totalPotentialReward;
  cycle.save();
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
