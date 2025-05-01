import {
  BackerRewardsOptedIn as BackerRewardsOptedInEvent,
  BackerRewardsOptedOut as BackerRewardsOptedOutEvent,
  Initialized as InitializedEvent,
  NewAllocation as NewAllocationEvent,
  NewCycleDurationScheduled as NewCycleDurationScheduledEvent,
  NewDistributionDuration as NewDistributionDurationEvent,
  NotifyReward as NotifyRewardEvent,
  RewardDistributed as RewardDistributedEvent,
  RewardDistributionFinished as RewardDistributionFinishedEvent,
  RewardDistributionStarted as RewardDistributionStartedEvent,
  Upgraded as UpgradedEvent,
  GaugeCreated as GaugeCreatedEvent,
} from "../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective"
import {
  BackerRewardsOptedIn,
  BackerRewardsOptedOut,
  Initialized,
  NewAllocation,
  NewCycleDurationScheduled,
  NewDistributionDuration,
  NotifyReward,
  RewardDistributed,
  RewardDistributionFinished,
  RewardDistributionStarted,
  Upgraded,
  GaugeCreated as GaugeCreated,
  BackerStakingHistory,
  GaugeStakingHistory,
} from "../generated/schema"
import { GaugeRootstockCollective } from "../generated/templates"
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective"
import { BigInt } from '@graphprotocol/graph-ts'

export function handleBackerRewardsOptedIn(
  event: BackerRewardsOptedInEvent
): void {
  let entity = new BackerRewardsOptedIn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.backer_ = event.params.backer_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBackerRewardsOptedOut(
  event: BackerRewardsOptedOutEvent
): void {
  let entity = new BackerRewardsOptedOut(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.backer_ = event.params.backer_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewAllocation(event: NewAllocationEvent): void {
  
  let entity = new NewAllocation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.backer_ = event.params.backer_
  entity.gauge_ = event.params.gauge_
  entity.allocation_ = event.params.allocation_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  const backerAddress = event.params.backer_
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(event.address)
  const backerTotalAllocation = backersManagerContract.backerTotalAllocation(backerAddress)
  
  let backer = BackerStakingHistory.load(backerAddress)
  const zero = BigInt.zero()
  if(backer == null) { 
    backer = new BackerStakingHistory(backerAddress)
    backer.accumulatedTime_ = zero
    backer.backerTotalAllocation_ = zero
  } 

  if(backer.backerTotalAllocation_.gt(zero)) {
    const lastStakedSeconds = event.block.timestamp.minus(backer.lastBlockTimestamp_)
    backer.accumulatedTime_ = backer.accumulatedTime_.plus(lastStakedSeconds)
  }
  backer.lastBlockNumber_ = event.block.number
  backer.lastBlockTimestamp_ = event.block.timestamp
  backer.backerTotalAllocation_ = backerTotalAllocation
  backer.save()

  const gaugeId = backerAddress.concat(event.params.gauge_)
  let gauge = GaugeStakingHistory.load(gaugeId)
  if(gauge == null) { 
   gauge = new GaugeStakingHistory(gaugeId)
   gauge.gauge_ = event.params.gauge_
   gauge.accumulatedAllocationsTime_ = zero
   gauge.backer_ = backerAddress
  } else{
   const lastStakedSeconds = event.block.timestamp.minus(gauge.lastBlockTimestamp_)
   gauge.accumulatedAllocationsTime_ = gauge.accumulatedAllocationsTime_.plus(gauge.allocation_.times(lastStakedSeconds))
  }
  gauge.allocation_ = event.params.allocation_
  gauge.lastBlockNumber_ = event.block.number
  gauge.lastBlockTimestamp_ = event.block.timestamp
  gauge.save()
}

export function handleNewCycleDurationScheduled(
  event: NewCycleDurationScheduledEvent
): void {
  let entity = new NewCycleDurationScheduled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newCycleDuration_ = event.params.newCycleDuration_
  entity.cooldownEndTime_ = event.params.cooldownEndTime_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewDistributionDuration(
  event: NewDistributionDurationEvent
): void {
  let entity = new NewDistributionDuration(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newDistributionDuration_ = event.params.newDistributionDuration_
  entity.by_ = event.params.by_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNotifyReward(event: NotifyRewardEvent): void {
  let entity = new NotifyReward(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.rewardToken_ = event.params.rewardToken_
  entity.sender_ = event.params.sender_
  entity.amount_ = event.params.amount_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardDistributed(event: RewardDistributedEvent): void {
  let entity = new RewardDistributed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender_ = event.params.sender_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  let entity = new RewardDistributionFinished(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender_ = event.params.sender_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
): void {
  let entity = new RewardDistributionStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender_ = event.params.sender_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
    let entity = new GaugeCreated(
      event.transaction.hash.concatI32(event.logIndex.toI32()),
    )
    entity.builder_ = event.params.builder_
    entity.gauge_ = event.params.gauge_
    entity.creator_ = event.params.creator_
  
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
  
    entity.save()
  
    GaugeRootstockCollective.create(event.params.gauge_)
}