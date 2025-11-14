import { NewAllocation as NewAllocationEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import {
  AllocationHistory,
  BackerStakingHistory,
  GaugeStakingHistory,
  Backer,
  BackerToBuilder,
  GaugeToBuilder,
  Builder,
  DailyAllocation,
} from "../../generated/schema";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { GaugeRootstockCollective as GaugeRootstockCollectiveContract } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { DEFAULT_BIGINT, loadOrCreateGlobalMetric, logEntityNotFound, updateBlockInfo } from "../utils";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleNewAllocation(event: NewAllocationEvent): void {
  _handleBackerStakingHistory(event);

  const gaugeToBuilder = GaugeToBuilder.load(event.params.gauge_);
  if (gaugeToBuilder == null) {
    logEntityNotFound('GaugeToBuilder', event.params.gauge_.toHexString(), 'handleNewAllocation');
    return;
  }
  
  _handleBuilderAndGlobalMetric(event, gaugeToBuilder);
  _handleAllocationHistory(event, gaugeToBuilder);
  _handleBacker(event, gaugeToBuilder);
  _handleBackerToBuilder(event, gaugeToBuilder);
  _handleDailyAllocation(event);

  updateBlockInfo(event, ["Builder", "Backer", "BackerToBuilder", "GlobalMetric", "BackerStakingHistory", "GaugeStakingHistory", "DailyAllocation", "AllocationHistory"]);
}

function _handleBackerStakingHistory(event: NewAllocationEvent): void {
  const backerAddress = event.params.backer_;
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );
  const backerTotalAllocation =
    backersManagerContract.backerTotalAllocation(backerAddress);

  let backer = BackerStakingHistory.load(backerAddress);

  if (backer == null) {
    backer = new BackerStakingHistory(backerAddress);
    backer.accumulatedTime = DEFAULT_BIGINT;
    backer.backerTotalAllocation = DEFAULT_BIGINT;
  }

  if (backer.backerTotalAllocation.gt(DEFAULT_BIGINT)) {
    const lastStakedSeconds = event.block.timestamp.minus(
      backer.lastBlockTimestamp
    );
    backer.accumulatedTime = backer.accumulatedTime.plus(lastStakedSeconds);
  }
  backer.lastBlockNumber = event.block.number;
  backer.lastBlockTimestamp = event.block.timestamp;
  backer.backerTotalAllocation = backerTotalAllocation;
  backer.save();

  const gaugeId = backerAddress.concat(event.params.gauge_);
  let gauge = GaugeStakingHistory.load(gaugeId);
  if (gauge == null) {
    gauge = new GaugeStakingHistory(gaugeId);
    gauge.gauge = event.params.gauge_;
    gauge.accumulatedAllocationsTime = DEFAULT_BIGINT;
    gauge.backer = backerAddress;
  } else {
    const lastStakedSeconds = event.block.timestamp.minus(
      gauge.lastBlockTimestamp
    );
    gauge.accumulatedAllocationsTime = gauge.accumulatedAllocationsTime.plus(
      gauge.allocation.times(lastStakedSeconds)
    );
  }
  gauge.allocation = event.params.allocation_;
  gauge.lastBlockNumber = event.block.number;
  gauge.lastBlockTimestamp = event.block.timestamp;
  gauge.save();
}

function _getPreviousAllocation(gaugeToBuilder: GaugeToBuilder, backer: Address): BigInt {
  let previousAllocation = DEFAULT_BIGINT;
  const backerToBuilder = BackerToBuilder.load(
    backer.concat(gaugeToBuilder.builder)
  );
  if (backerToBuilder != null) {
    previousAllocation = backerToBuilder.totalAllocation;
  }

  return previousAllocation;
}

function _handleBuilderAndGlobalMetric(event: NewAllocationEvent, gaugeToBuilder: GaugeToBuilder): void {
  const builder = Builder.load(gaugeToBuilder.builder);
  if (builder == null) {
    logEntityNotFound('Builder', gaugeToBuilder.builder.toString(), 'NewAllocation.handleBuilder');
    return;
  }

  const previousAllocation = _getPreviousAllocation(gaugeToBuilder, event.params.backer_);
  builder.totalAllocation = builder.totalAllocation.plus(event.params.allocation_).minus(previousAllocation);

  const gaugeContract = GaugeRootstockCollectiveContract.bind(event.params.gauge_);
  const rewardShares = gaugeContract.rewardShares();

  const globalMetric = loadOrCreateGlobalMetric();
  if(!builder.isHalted) { 
    const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
      event.address
    );
    globalMetric.totalPotentialReward = backersManagerContract.totalPotentialReward();
  }
  globalMetric.totalAllocation = globalMetric.totalAllocation.plus(event.params.allocation_).minus(previousAllocation);
  globalMetric.save();

  builder.rewardShares = rewardShares;
  builder.save();
}

function _handleBacker(event: NewAllocationEvent, gaugeToBuilder: GaugeToBuilder): void {
  let backer = Backer.load(event.params.backer_);
  if (backer == null) {
    backer = new Backer(event.params.backer_);
    backer.totalAllocation = DEFAULT_BIGINT;
    backer.isBlacklisted = false;
  }

  const previousAllocation = _getPreviousAllocation(gaugeToBuilder, event.params.backer_);
  backer.totalAllocation = backer.totalAllocation.plus(event.params.allocation_).minus(previousAllocation);
  backer.save();
}

function _handleBackerToBuilder(event: NewAllocationEvent, gaugeToBuilder: GaugeToBuilder): void {
  let backerToBuilder = BackerToBuilder.load(
    event.params.backer_.concat(gaugeToBuilder.builder)
  );
  if (backerToBuilder == null) {
    backerToBuilder = new BackerToBuilder(
      event.params.backer_.concat(gaugeToBuilder.builder)
    );
    backerToBuilder.backer = event.params.backer_;
    backerToBuilder.builder = gaugeToBuilder.builder;
    backerToBuilder.builderState = gaugeToBuilder.builder;
  }
  backerToBuilder.totalAllocation = event.params.allocation_;
  backerToBuilder.save();
}

function _handleDailyAllocation(event: NewAllocationEvent,): void {
  const globalMetric = loadOrCreateGlobalMetric();

  const timestamp = event.block.timestamp.toI32();
  const dayId = timestamp - (timestamp % 86400);
  const dayIdBytes = Bytes.fromI32(dayId);

  let dailyAllocation = DailyAllocation.load(dayIdBytes);
  if (dailyAllocation == null) {
    dailyAllocation = new DailyAllocation(dayIdBytes);
    dailyAllocation.totalAllocation = DEFAULT_BIGINT;
  }
  dailyAllocation.totalAllocation = globalMetric.totalAllocation;
  dailyAllocation.day = dayId;
  dailyAllocation.save();
}

function _handleAllocationHistory(event: NewAllocationEvent, gaugeToBuilder: GaugeToBuilder): void {
  let entity = new AllocationHistory(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let backerToBuilder = BackerToBuilder.load(
    event.params.backer_.concat(gaugeToBuilder.builder)
  );

  if (backerToBuilder) {
    // Calculate the absolute difference
    const difference = event.params.allocation_.minus(backerToBuilder.totalAllocation);
    entity.allocation = difference.abs();
    entity.increased = event.params.allocation_.gt(backerToBuilder.totalAllocation);
  } else {
    // First allocation, the difference is the full amount
    entity.allocation = event.params.allocation_;
    entity.increased = true;
  }

  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );
  const cycleStart = backersManagerContract.cycleStart(event.block.timestamp);

  entity.backer = event.params.backer_;
  entity.builder = gaugeToBuilder.builder;
  entity.blockTimestamp = event.block.timestamp;
  entity.cycleStart = cycleStart;
  entity.blockHash = event.block.hash;

  entity.save();
}
