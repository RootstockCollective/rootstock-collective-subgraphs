import { NewAllocation as NewAllocationEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import {
  BackerStakingHistory,
  GaugeStakingHistory,
  Backer,
  BackerToBuilder,
  GaugeToBuilder,
  Builder,
} from "../../generated/schema";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { GaugeRootstockCollective as GaugeRootstockCollectiveContract } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { DEFAULT_BIGINT, loadOrCreateCycle, logEntityNotFound } from "../utils";
import { Address, BigInt } from "@graphprotocol/graph-ts";

export function handleNewAllocation(event: NewAllocationEvent): void {
  _handleBackerStakingHistory(event);

  const gaugeToBuilder = GaugeToBuilder.load(event.params.gauge_);
  if (gaugeToBuilder == null) {
    logEntityNotFound('GaugeToBuilder', event.params.gauge_.toHexString(), 'handleNewAllocation');
    return;
  }
  
  _handleBuilder(event, gaugeToBuilder  );
  _handleBacker(event, gaugeToBuilder);
  _handleBackerToBuilder(event, gaugeToBuilder);
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

function _handleBuilder(event: NewAllocationEvent, gaugeToBuilder: GaugeToBuilder): void {
  const builder = Builder.load(gaugeToBuilder.builder);
  if (builder == null) {
    logEntityNotFound('Builder', gaugeToBuilder.builder.toString(), 'NewAllocation.handleBuilder');
    return;
  }

  const previousAllocation = _getPreviousAllocation(gaugeToBuilder, event.params.backer_);
  builder.totalAllocation = builder.totalAllocation.plus(event.params.allocation_).minus(previousAllocation);

  const gaugeContract = GaugeRootstockCollectiveContract.bind(event.params.gauge_);
  const rewardShares = gaugeContract.rewardShares();

  const cycle = loadOrCreateCycle(event.address);
  if(!builder.isHalted) { 
    cycle.totalPotentialReward = cycle.totalPotentialReward.plus(rewardShares).minus(builder.rewardShares);
    cycle.save();
 }

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