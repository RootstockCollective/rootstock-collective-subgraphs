import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BackerRewardsClaimed,
  BuilderRewardsClaimed,
  Initialized,
  NewAllocation,
  NotifyReward
} from "../generated/GaugeRootstockCollective/GaugeRootstockCollective"

export function createBackerRewardsClaimedEvent(
  rewardToken_: Address,
  backer_: Address,
  amount_: BigInt
): BackerRewardsClaimed {
  let backerRewardsClaimedEvent = changetype<BackerRewardsClaimed>(
    newMockEvent()
  )

  backerRewardsClaimedEvent.parameters = new Array()

  backerRewardsClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardToken_",
      ethereum.Value.fromAddress(rewardToken_)
    )
  )
  backerRewardsClaimedEvent.parameters.push(
    new ethereum.EventParam("backer_", ethereum.Value.fromAddress(backer_))
  )
  backerRewardsClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "amount_",
      ethereum.Value.fromUnsignedBigInt(amount_)
    )
  )

  return backerRewardsClaimedEvent
}

export function createBuilderRewardsClaimedEvent(
  rewardToken_: Address,
  builder_: Address,
  amount_: BigInt
): BuilderRewardsClaimed {
  let builderRewardsClaimedEvent = changetype<BuilderRewardsClaimed>(
    newMockEvent()
  )

  builderRewardsClaimedEvent.parameters = new Array()

  builderRewardsClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardToken_",
      ethereum.Value.fromAddress(rewardToken_)
    )
  )
  builderRewardsClaimedEvent.parameters.push(
    new ethereum.EventParam("builder_", ethereum.Value.fromAddress(builder_))
  )
  builderRewardsClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "amount_",
      ethereum.Value.fromUnsignedBigInt(amount_)
    )
  )

  return builderRewardsClaimedEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createNewAllocationEvent(
  backer_: Address,
  allocation_: BigInt
): NewAllocation {
  let newAllocationEvent = changetype<NewAllocation>(newMockEvent())

  newAllocationEvent.parameters = new Array()

  newAllocationEvent.parameters.push(
    new ethereum.EventParam("backer_", ethereum.Value.fromAddress(backer_))
  )
  newAllocationEvent.parameters.push(
    new ethereum.EventParam(
      "allocation_",
      ethereum.Value.fromUnsignedBigInt(allocation_)
    )
  )

  return newAllocationEvent
}

export function createNotifyRewardEvent(
  rewardToken_: Address,
  builderAmount_: BigInt,
  backersAmount_: BigInt
): NotifyReward {
  let notifyRewardEvent = changetype<NotifyReward>(newMockEvent())

  notifyRewardEvent.parameters = new Array()

  notifyRewardEvent.parameters.push(
    new ethereum.EventParam(
      "rewardToken_",
      ethereum.Value.fromAddress(rewardToken_)
    )
  )
  notifyRewardEvent.parameters.push(
    new ethereum.EventParam(
      "builderAmount_",
      ethereum.Value.fromUnsignedBigInt(builderAmount_)
    )
  )
  notifyRewardEvent.parameters.push(
    new ethereum.EventParam(
      "backersAmount_",
      ethereum.Value.fromUnsignedBigInt(backersAmount_)
    )
  )

  return notifyRewardEvent
}
