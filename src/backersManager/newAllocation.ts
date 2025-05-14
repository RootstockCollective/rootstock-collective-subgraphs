import { NewAllocation as NewAllocationEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import {
  BackerStakingHistory,
  GaugeStakingHistory,
  Backer,
  BackerToBuilder,
  GaugeToBuilder,
} from "../../generated/schema";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleNewAllocation(event: NewAllocationEvent): void {
  _handleBackerStakingHistory(event);
  _handleBacker(event);
  _handleBackerToBuilder(event);
}

function _handleBackerStakingHistory(event: NewAllocationEvent): void {
  const backerAddress = event.params.backer_;
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );
  const backerTotalAllocation =
    backersManagerContract.backerTotalAllocation(backerAddress);

  let backer = BackerStakingHistory.load(backerAddress);
  const zero = BigInt.zero();
  if (backer == null) {
    backer = new BackerStakingHistory(backerAddress);
    backer.accumulatedTime_ = zero;
    backer.backerTotalAllocation_ = zero;
  }

  if (backer.backerTotalAllocation_.gt(zero)) {
    const lastStakedSeconds = event.block.timestamp.minus(
      backer.lastBlockTimestamp_
    );
    backer.accumulatedTime_ = backer.accumulatedTime_.plus(lastStakedSeconds);
  }
  backer.lastBlockNumber_ = event.block.number;
  backer.lastBlockTimestamp_ = event.block.timestamp;
  backer.backerTotalAllocation_ = backerTotalAllocation;

  backer.save();

  const gaugeId = backerAddress.concat(event.params.gauge_);
  let gauge = GaugeStakingHistory.load(gaugeId);
  if (gauge == null) {
    gauge = new GaugeStakingHistory(gaugeId);
    gauge.gauge_ = event.params.gauge_;
    gauge.accumulatedAllocationsTime_ = zero;
    gauge.backer_ = backerAddress;
  } else {
    const lastStakedSeconds = event.block.timestamp.minus(
      gauge.lastBlockTimestamp_
    );
    gauge.accumulatedAllocationsTime_ = gauge.accumulatedAllocationsTime_.plus(
      gauge.allocation_.times(lastStakedSeconds)
    );
  }
  gauge.allocation_ = event.params.allocation_;
  gauge.lastBlockNumber_ = event.block.number;
  gauge.lastBlockTimestamp_ = event.block.timestamp;

  gauge.save();
}

function _handleBacker(event: NewAllocationEvent): void {
  let backer = Backer.load(event.params.backer_);
  if (backer == null) {
    backer = new Backer(event.params.backer_);
    backer.isBlacklisted_ = false;
  }
  backer.totalAllocation_ = event.params.allocation_;

  backer.save();
}

function _handleBackerToBuilder(event: NewAllocationEvent): void {
  const gaugeToBuilder = GaugeToBuilder.load(event.address);
  if (gaugeToBuilder == null) return;

  let backerToBuilder = BackerToBuilder.load(
    event.params.backer_.concat(gaugeToBuilder.builder_)
  );
  if (backerToBuilder == null) {
    backerToBuilder = new BackerToBuilder(
      event.params.backer_.concat(event.params.gauge_)
    );
    backerToBuilder.backer_ = event.params.backer_;
    backerToBuilder.builder_ = event.params.gauge_;
    backerToBuilder.totalAllocation_ = BigInt.zero();
  }
  backerToBuilder.totalAllocation_ = event.params.allocation_;

  backerToBuilder.save();
}
