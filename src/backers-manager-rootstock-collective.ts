import { NewAllocation as NewAllocationEvent } from "../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackerStakingHistory, GaugeStakingHistory, NewAllocation } from "../generated/schema";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleNewAllocation(event: NewAllocationEvent): void {
  let entity = new NewAllocation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.backer_ = event.params.backer_;
  entity.gauge_ = event.params.gauge_;
  entity.allocation_ = event.params.allocation_;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

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
