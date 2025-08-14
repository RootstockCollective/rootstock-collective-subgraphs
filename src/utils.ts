import { BigInt, Bytes, BigDecimal, Address, log } from "@graphprotocol/graph-ts";
import { BackerRewardPercentage, BlockChangeLog, Builder, BuilderState, Cycle, GlobalMetric } from "../generated/schema";
import { ContractConfig } from "../generated/schema";
import { ethereum } from "@graphprotocol/graph-ts";

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

export function loadOrCreateCycle(cycleStart: Bytes): Cycle {
  let cycle = Cycle.load(cycleStart);
  if (cycle == null) {
    cycle = new Cycle(cycleStart);
    cycle.rewardsERC20 = DEFAULT_BIGINT;
    cycle.rewardsRBTC = DEFAULT_BIGINT;
    cycle.onDistributionPeriod = false;
    cycle.cycleDuration = DEFAULT_BIGINT;
    cycle.distributionDuration = DEFAULT_BIGINT;
    cycle.cycleStart = DEFAULT_BIGINT;
  }

  return cycle;
}

export function loadOrCreateBlockChangeLog(blockHash: Bytes): BlockChangeLog {
  let blockChangeLog = BlockChangeLog.load(blockHash);
  if (blockChangeLog == null) {
    blockChangeLog = new BlockChangeLog(blockHash);
    blockChangeLog.blockNumber = DEFAULT_BIGINT;
    blockChangeLog.blockTimestamp = DEFAULT_BIGINT;
    blockChangeLog.updatedEntities = [];
  }

  return blockChangeLog;
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

export function updateBlockInfo(event: ethereum.Event, entityNames: string[]): void {
  let blockChangeLog = BlockChangeLog.load(event.block.hash);
  if (blockChangeLog == null) {
    blockChangeLog = new BlockChangeLog(event.block.hash);
    blockChangeLog.blockNumber = event.block.number;
    blockChangeLog.blockTimestamp = event.block.timestamp;
    blockChangeLog.updatedEntities = [];
  }
  
  const updatedEntities = blockChangeLog.updatedEntities;
  for (let i = 0; i < entityNames.length; i++) {
    const entityName = entityNames[i];
    if (!updatedEntities.includes(entityName)) {
      updatedEntities.push(entityName);
    }
  }
  blockChangeLog.updatedEntities = updatedEntities;
  blockChangeLog.save();

  // Update ContractConfig block information
  const contractConfig = ContractConfig.load(CONTRACT_CONFIG_ID);
  if (contractConfig == null) {
    logEntityNotFound('ContractConfig', CONTRACT_CONFIG_ID.toString(), 'Utils.updateBlockChangeLog');
    return;
  }
  contractConfig.blockNumber = event.block.number;
  contractConfig.blockTimestamp = event.block.timestamp;
  contractConfig.blockHash = event.block.hash;
  contractConfig.save();
}

export function loadOrCreateGlobalMetric(): GlobalMetric {
  let globalMetric = GlobalMetric.load(CONTRACT_CONFIG_ID);
  if (globalMetric == null) {
    globalMetric = new GlobalMetric(CONTRACT_CONFIG_ID);
    globalMetric.totalPotentialReward = DEFAULT_BIGINT;
    globalMetric.builders = [];
    globalMetric.totalAllocation = DEFAULT_BIGINT;
  }

  return globalMetric;
}

export function loadOrCreateContractConfig(): ContractConfig {
  const id = CONTRACT_CONFIG_ID;
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.builderRegistry = ZERO_ADDRESS;
    contractConfig.rewardDistributor = ZERO_ADDRESS;
    contractConfig.backersManager = ZERO_ADDRESS;
    contractConfig.blockNumber = DEFAULT_BIGINT;
    contractConfig.blockTimestamp = DEFAULT_BIGINT;
    contractConfig.blockHash = DEFAULT_BYTES;
  }

  return contractConfig;
}
