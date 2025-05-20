import { BigInt, Bytes, BigDecimal, Address, log } from "@graphprotocol/graph-ts";
import { BackerRewardPercentage, Builder, BuilderState, Cycle } from "../generated/schema";

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

export function logEntityNotFound(entityType: string, entityId: string, context: string): void {
  log.warning(
    `[Entity Not Found] type: ${entityType}, id: ${entityId}, function: ${context}`,
    []
  );
}

export const ZERO_ADDRESS = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
export const DEFAULT_BIGINT = BigInt.zero();
export const DEFAULT_BYTES = Bytes.empty();
export const DEFAULT_DECIMAL = BigDecimal.zero();
export const CONTRACT_CONFIG_ID = Bytes.fromUTF8("default");
