import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { GaugeToBuilder, BuilderToGauge, Builder, BuilderState, ContractConfig, BackerRewardPercentage } from "../generated/schema";
import { GaugeRootstockCollective } from "../generated/templates";
import { CONTRACT_CONFIG_ID, DEFAULT_BIGINT, DEFAULT_BYTES, DEFAULT_DECIMAL } from "./utils";

export function gaugeCreated(builder: Address, gauge: Address): void {
  GaugeRootstockCollective.create(gauge);

  const gaugeToBuilder = new GaugeToBuilder(gauge);
  gaugeToBuilder.builder = builder;
  gaugeToBuilder.save();

  const builderToGauge = new BuilderToGauge(builder);
  builderToGauge.gauge = gauge;
  builderToGauge.save();

  const contractConfig = ContractConfig.load(CONTRACT_CONFIG_ID);
  if (contractConfig == null) return;
  const builders = contractConfig.builders;
  builders.push(builder);
  contractConfig.builders = builders;
  contractConfig.save();
}

export function communityApproved(builder: Address): void {
  const builderEntity = loadOrCreateBuilder(builder);
  const builderToGauge = BuilderToGauge.load(builder);
  if (builderToGauge == null) return;
  builderEntity.gauge = builderToGauge.gauge;

  const builderState = loadOrCreateBuilderState(builder);
  builderState.communityApproved = true;

  const backerRewardPercentage = loadOrCreateBackerRewardPercentage(builder);

  builderEntity.save();
  builderState.save();
  backerRewardPercentage.save();
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
    builderEntity.gauge = DEFAULT_BYTES;
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
    builderState.pausedReason = "";
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