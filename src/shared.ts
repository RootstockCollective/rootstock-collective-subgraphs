import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GaugeToBuilder, Builder, BuilderState, ContractConfig, BackerRewardPercentage, Cycle } from "../generated/schema";
import { GaugeRootstockCollective } from "../generated/templates";
import { CONTRACT_CONFIG_ID, DEFAULT_BIGINT, DEFAULT_BYTES, DEFAULT_DECIMAL, ZERO_ADDRESS } from "./utils";

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
  if (contractConfig == null) return;
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

export function loadOrCreateBuilder(builder: Address): Builder {
  let builderEntity = Builder.load(builder);
  if (builderEntity == null) {
    builderEntity = new Builder(builder);
    builderEntity.isHalted = false;
    builderEntity.lastCycleRewards = DEFAULT_BIGINT;
    builderEntity.totalAllocation = DEFAULT_BIGINT;
    builderEntity.rewardShares = DEFAULT_BIGINT;
    builderEntity.gauge = ZERO_ADDRESS;
    builderEntity.rewardReceiver = DEFAULT_BYTES;
    builderEntity.estimatedRewardsPct = DEFAULT_DECIMAL;
  }

  return builderEntity;
}

export function loadOrCreateBuilderState(builder: Address): BuilderState {
  let builderState = BuilderState.load(builder);
  if (builderState == null) {
    builderState = new BuilderState(builder);
    builderState.builder = builder;
    builderState.initialized = false;
    builderState.kycApproved = false;
    builderState.communityApproved = false;
    builderState.kycPaused = false;
    builderState.selfPaused = false;
    builderState.pausedReason = DEFAULT_BYTES;
  }

  return builderState;
}

export function loadOrCreateBackerRewardPercentage(builder: Address): BackerRewardPercentage {
  let backerRewardPercentage = BackerRewardPercentage.load(builder);
  if (backerRewardPercentage == null) {
    backerRewardPercentage = new BackerRewardPercentage(builder);
    backerRewardPercentage.builder = builder;
    backerRewardPercentage.next = DEFAULT_BIGINT;
    backerRewardPercentage.previous = DEFAULT_BIGINT;
    backerRewardPercentage.cooldownEndTime = DEFAULT_BIGINT;
  }

  return backerRewardPercentage;
}

export function calculateEstimatedRewardsPct(rewardShares: BigInt, totalPotentialReward: BigInt): BigDecimal {
  if (totalPotentialReward.equals(DEFAULT_BIGINT)) {
    return DEFAULT_DECIMAL;
  }

  const shares = new BigDecimal(rewardShares);
  const total = new BigDecimal(totalPotentialReward);

  return shares.div(total);
}


export function communityBanned(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  haltBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.communityApproved = false;

  builderState.save();
}

export function kycApproved(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  resumeBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.kycApproved = true;

  builderState.save();
}

export function kycRevoked(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  haltBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
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
  if (builderState == null) return;
  builderState.kycPaused = false;

  builderState.save();
}

export function selfPaused(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  haltBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.selfPaused = true;

  builderState.save();
}

export function selfResumed(builder: Address, rewardPercentage: BigInt, cooldown: BigInt, timestamp: BigInt): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  resumeBuilder(builderEntity);

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.selfPaused = false;

  updateBackerRewardPercentage(builder, rewardPercentage, cooldown, timestamp);

  builderState.save();
}

export function rewardReceiverUpdated(
  builder: Address,
  newRewardReceiver: Address
): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
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
  if (contractConfig == null) return;

  const cycle = loadOrCreateCycle(Address.fromBytes(contractConfig.backersManager));
  const totalPotentialReward = cycle.totalPotentialReward.plus(builderEntity.rewardShares);
  cycle.totalPotentialReward = totalPotentialReward
  cycle.save();

  builderEntity.estimatedRewardsPct = calculateEstimatedRewardsPct(builderEntity.rewardShares, totalPotentialReward);
  builderEntity.save();
}

function haltBuilder(builderEntity: Builder): void {
  builderEntity.isHalted = true;
  builderEntity.save();

  const id = CONTRACT_CONFIG_ID;
  const contractConfig = ContractConfig.load(id);
  if (contractConfig == null) return;

  const cycle = loadOrCreateCycle(Address.fromBytes(contractConfig.backersManager));
  const totalPotentialReward = cycle.totalPotentialReward.minus(builderEntity.rewardShares);
  cycle.totalPotentialReward = totalPotentialReward;
  cycle.save();

  builderEntity.estimatedRewardsPct = calculateEstimatedRewardsPct(builderEntity.rewardShares, totalPotentialReward);
  builderEntity.save();
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

export function loadOrCreateCycle(backersManager: Address): Cycle {
  let cycle = Cycle.load(backersManager);
  if (cycle == null) {
      cycle = new Cycle(backersManager);
      cycle.totalPotentialReward = DEFAULT_BIGINT;
      cycle.rewardsERC20 = DEFAULT_BIGINT;
      cycle.rewardsRBTC = DEFAULT_BIGINT;
      cycle.onDistributionPeriod = false;
      cycle.periodFinish = DEFAULT_BIGINT;
      cycle.cycleDuration = DEFAULT_BIGINT;
      cycle.distributionDuration = DEFAULT_BIGINT;
  }

  return cycle;
}
