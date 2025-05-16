import {
  Builder,
  BuilderState,
  ContractConfig,
} from "../../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { loadOrCreateCycle } from "../backersManager/shared";
import { CONTRACT_CONFIG_ID } from "../utils";
import { calculateEstimatedRewardsPct, loadOrCreateBackerRewardPercentage } from "../shared";

export function rewardReceiverUpdated(
  builder: Address,
  newRewardReceiver: Address
): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  builderEntity.rewardReceiver = newRewardReceiver;

  builderEntity.save();
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

export function kycPaused(builder: Address): void {
  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.kycPaused = true;

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
  cycle.totalPotentialReward = cycle.totalPotentialReward.plus(builderEntity.rewardShares);
  cycle.save();

  builderEntity.estimatedRewardsPct = calculateEstimatedRewardsPct(builderEntity.rewardShares, cycle.totalPotentialReward);
  builderEntity.save();
}

function haltBuilder(builderEntity: Builder): void {
  builderEntity.isHalted = true;
  builderEntity.save();

  const id = CONTRACT_CONFIG_ID;
  const contractConfig = ContractConfig.load(id);
  if (contractConfig == null) return;

  const cycle = loadOrCreateCycle(Address.fromBytes(contractConfig.backersManager));
  cycle.totalPotentialReward = cycle.totalPotentialReward.minus(builderEntity.rewardShares);
  cycle.save();

  builderEntity.estimatedRewardsPct = calculateEstimatedRewardsPct(builderEntity.rewardShares, cycle.totalPotentialReward);
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