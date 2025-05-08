import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  BuilderInitialized as BuilderInitializedEvent,
  RewardReceiverUpdated as RewardReceiverUpdatedEvent,
  CommunityApproved as CommunityApprovedEvent,
  CommunityBanned as CommunityBannedEvent,
  GaugeCreated as GaugeCreatedEvent,
  KYCApproved as KYCApprovedEvent,
  KYCRevoked as KYCRevokedEvent,
  KYCPaused as KYCPausedEvent,
  KYCResumed as KYCResumedEvent,
  SelfPaused as SelfPausedEvent,
  SelfResumed as SelfResumedEvent,
  Upgraded as UpgradedEvent,
} from "../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import {
  Builder,
  BuilderState,
  ContractConfig,
  GaugeToBuilder,
} from "../generated/schema";
import { GaugeRootstockCollective } from "../generated/templates";

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
  GaugeRootstockCollective.create(event.params.gauge_);

  let builder = Builder.load(event.params.builder_);
  if (builder == null) {
    builder = new Builder(event.params.builder_);
    builder.totalAllocation_ = BigInt.zero();
    builder.isHalted_ = false;
    builder.totalAllocation_ = BigInt.zero();
    builder.rewardShares_ = BigInt.zero();
    builder.lastCycleRewards_ = BigInt.zero();
    builder.rewardReceiver_ = Bytes.empty();
    builder.backerRewardPercentage_ = BigInt.zero();
  }
  builder.gauge_ = event.params.gauge_;

  builder.save();

  const gaugeToBuilder = new GaugeToBuilder(event.params.gauge_);
  gaugeToBuilder.builder_ = builder.id;
  gaugeToBuilder.save();
}

export function handleBuilderInitialized(event: BuilderInitializedEvent): void {
  const builder = Builder.load(event.params.builder_);
  if (builder == null) return;
  builder.rewardReceiver_ = event.params.rewardReceiver_;
  builder.backerRewardPercentage_ = event.params.rewardPercentage_;
  let builderState = BuilderState.load(builder.id);
  if (builderState == null) {
    builderState = new BuilderState(builder.id);
    builderState.builder_ = builder.id;
    builderState.kycPaused_ = false;
    builderState.selfPaused_ = false;
    builderState.communityApproved_ = false;
  }
  builderState.kycApproved_ = true;
  builderState.initialized_ = true;

  builderState.save();
  builder.save();
}

export function handleRewardReceiverUpdated(
  event: RewardReceiverUpdatedEvent
): void {
  const builder = Builder.load(event.params.builder_);
  if (builder == null) return;
  builder.rewardReceiver_ = event.params.newRewardReceiver_;
  builder.save();
}

export function handleCommunityApproved(event: CommunityApprovedEvent): void {
  const builder = Builder.load(event.params.builder_);
  if (builder == null) return;
  let builderState = BuilderState.load(builder.id);
  if (builderState == null) {
    builderState = new BuilderState(builder.id);
    builderState.builder_ = builder.id;
    builderState.kycApproved_ = false;
    builderState.kycPaused_ = false;
    builderState.selfPaused_ = false;
    builderState.initialized_ = false;
  }
  builderState.communityApproved_ = true;

  builderState.save();
  builder.save();
}

export function handleCommunityBanned(event: CommunityBannedEvent): void {
  const builderState = BuilderState.load(event.params.builder_);
  if (builderState == null) return;
  builderState.communityApproved_ = false;

  builderState.save();
}

export function handleKYCApproved(event: KYCApprovedEvent): void {
  const builderState = BuilderState.load(event.params.builder_);
  if (builderState == null) return;
  builderState.kycApproved_ = true;

  builderState.save();
}

export function handleKYCRevoked(event: KYCRevokedEvent): void {
  const builderState = BuilderState.load(event.params.builder_);
  if (builderState == null) return;
  builderState.kycApproved_ = false;

  builderState.save();
}

export function handleKYCPaused(event: KYCPausedEvent): void {
  const builderState = BuilderState.load(event.params.builder_);
  if (builderState == null) return;
  builderState.kycPaused_ = true;
  builderState.save();
}

export function handleKYCResumed(event: KYCResumedEvent): void {
  const builderState = BuilderState.load(event.params.builder_);
  if (builderState == null) return;
  builderState.kycPaused_ = false;

  builderState.save();
}

export function handleSelfPaused(event: SelfPausedEvent): void {
  const builderState = BuilderState.load(event.params.builder_);
  if (builderState == null) return;
  builderState.selfPaused_ = true;

  builderState.save();
}

export function handleSelfResumed(event: SelfResumedEvent): void {
  const builderState = BuilderState.load(event.params.builder_);
  if (builderState == null) return;
  builderState.selfPaused_ = false;

  builderState.save();
}

export function handleUpgraded(event: UpgradedEvent): void {
  const id = Bytes.fromUTF8("default");
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.backersManager_ = Bytes.empty();
    contractConfig.rewardDistributor_ = Bytes.empty();
  }
  contractConfig.builderRegistry_ = event.address;

  contractConfig.save();
}
