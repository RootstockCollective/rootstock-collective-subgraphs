import {
  BackerRewardPercentageUpdateScheduled as BackerRewardPercentageUpdateScheduledEvent,
  BuilderActivated as BuilderActivatedEvent,
  BuilderMigratedV2 as BuilderMigratedV2Event,
  BuilderRewardReceiverReplacementApproved as BuilderRewardReceiverReplacementApprovedEvent,
  BuilderRewardReceiverReplacementCancelled as BuilderRewardReceiverReplacementCancelledEvent,
  BuilderRewardReceiverReplacementRequested as BuilderRewardReceiverReplacementRequestedEvent,
  CommunityApproved as CommunityApprovedEvent,
  Dewhitelisted as DewhitelistedEvent,
  GaugeCreated as GaugeCreatedEvent,
  Initialized as InitializedEvent,
  KYCApproved as KYCApprovedEvent,
  KYCRevoked as KYCRevokedEvent,
  Paused as PausedEvent,
  Permitted as PermittedEvent,
  Revoked as RevokedEvent,
  Unpaused as UnpausedEvent,
  Upgraded as UpgradedEvent,
} from "../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective"
import {
  BackerRewardPercentageUpdateScheduled,
  BuilderActivated,
  BuilderMigratedV2,
  BuilderRewardReceiverReplacementApproved,
  BuilderRewardReceiverReplacementCancelled,
  BuilderRewardReceiverReplacementRequested,
  CommunityApproved,
  Dewhitelisted,
  GaugeCreated,
  Initialized,
  KYCApproved,
  KYCRevoked,
  Paused,
  Permitted,
  Revoked,
  Unpaused,
  Upgraded,
} from "../generated/schema"
import { GaugeRootstockCollective } from "../generated/templates"

export function handleBackerRewardPercentageUpdateScheduled(
  event: BackerRewardPercentageUpdateScheduledEvent,
): void {
  let entity = new BackerRewardPercentageUpdateScheduled(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.rewardPercentage_ = event.params.rewardPercentage_
  entity.cooldown_ = event.params.cooldown_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBuilderActivated(event: BuilderActivatedEvent): void {
  let entity = new BuilderActivated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.rewardReceiver_ = event.params.rewardReceiver_
  entity.rewardPercentage_ = event.params.rewardPercentage_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBuilderMigratedV2(event: BuilderMigratedV2Event): void {
  let entity = new BuilderMigratedV2(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.migrator_ = event.params.migrator_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBuilderRewardReceiverReplacementApproved(
  event: BuilderRewardReceiverReplacementApprovedEvent,
): void {
  let entity = new BuilderRewardReceiverReplacementApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.newRewardReceiver_ = event.params.newRewardReceiver_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBuilderRewardReceiverReplacementCancelled(
  event: BuilderRewardReceiverReplacementCancelledEvent,
): void {
  let entity = new BuilderRewardReceiverReplacementCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.newRewardReceiver_ = event.params.newRewardReceiver_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBuilderRewardReceiverReplacementRequested(
  event: BuilderRewardReceiverReplacementRequestedEvent,
): void {
  let entity = new BuilderRewardReceiverReplacementRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.newRewardReceiver_ = event.params.newRewardReceiver_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCommunityApproved(event: CommunityApprovedEvent): void {
  let entity = new CommunityApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDewhitelisted(event: DewhitelistedEvent): void {
  let entity = new Dewhitelisted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_

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

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleKYCApproved(event: KYCApprovedEvent): void {
  let entity = new KYCApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleKYCRevoked(event: KYCRevokedEvent): void {
  let entity = new KYCRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.reason_ = event.params.reason_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePermitted(event: PermittedEvent): void {
  let entity = new Permitted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_
  entity.rewardPercentage_ = event.params.rewardPercentage_
  entity.cooldown_ = event.params.cooldown_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRevoked(event: RevokedEvent): void {
  let entity = new Revoked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.builder_ = event.params.builder_

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
