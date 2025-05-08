import {
  NewAllocation as NewAllocationEvent,
  BackerRewardsOptedIn as BackerRewardsOptedInEvent,
  BackerRewardsOptedOut as BackerRewardsOptedOutEvent,
  RewardDistributionStarted as RewardDistributionStartedEvent,
  RewardDistributionFinished as RewardDistributionFinishedEvent,
  Upgraded as UpgradedEvent,
} from "../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import {
  BackerStakingHistory,
  GaugeStakingHistory,
  Backer,
  BackerToBuilder,
  Cycle,
  ContractConfig,
  GaugeToBuilder,
} from "../generated/schema";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

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

export function handleBackerRewardsOptedIn(
  event: BackerRewardsOptedInEvent
): void {
  let backer = Backer.load(event.params.backer_);
  if (backer == null) {
    backer = new Backer(event.params.backer_);
    backer.totalAllocation_ = BigInt.zero();
  }
  backer.isBlacklisted_ = false;

  backer.save();
}

export function handleBackerRewardsOptedOut(
  event: BackerRewardsOptedOutEvent
): void {
  let backer = Backer.load(event.params.backer_);
  if (backer == null) {
    backer = new Backer(event.params.backer_);
    backer.totalAllocation_ = BigInt.zero();
  }
  backer.isBlacklisted_ = true;

  backer.save();
}

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
): void {
  let cycle = Cycle.load(event.address);
  if (cycle == null) {
    cycle = new Cycle(event.address);
    cycle.totalPotentialReward_ = BigInt.zero();
    cycle.periodFinish_ = BigInt.zero();
    cycle.cycleDuration_ = BigInt.zero();
    cycle.distributionDuration_ = BigInt.zero();
  }
  cycle.onDistributionPeriod_ = true;

  const id = Bytes.fromUTF8("default");
  const contractConfig = ContractConfig.load(id);
  if (contractConfig == null) return;
  const rewardDistributorAddress = Address.fromBytes(
    contractConfig.rewardDistributor_
  );
  const rewardDistributor = RewardDistributorRootstockCollectiveContract.bind(
    rewardDistributorAddress
  );
  cycle.rewardsERC20_ = rewardDistributor.defaultRewardTokenAmount();
  cycle.rewardsRBTC_ = rewardDistributor.defaultRewardCoinbaseAmount();

  cycle.save();
}

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  let cycle = Cycle.load(event.address);
  if (cycle == null) {
    cycle = new Cycle(event.address);
    cycle.totalPotentialReward_ = BigInt.zero();
    cycle.periodFinish_ = BigInt.zero();
    cycle.cycleDuration_ = BigInt.zero();
    cycle.distributionDuration_ = BigInt.zero();
    cycle.rewardsERC20_ = BigInt.zero();
    cycle.rewardsERC20_ = BigInt.zero();
  }
  cycle.onDistributionPeriod_ = false;

  cycle.save();
}

export function handleUpgraded(event: UpgradedEvent): void {
  const id = Bytes.fromUTF8("default");
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.builderRegistry_ = Bytes.empty();
    contractConfig.rewardDistributor_ = Bytes.empty();
  }
  contractConfig.backersManager_ = event.address;

  contractConfig.save();
}
