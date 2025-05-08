import {
  BuilderActivated as BuilderInitializedEvent,
  BuilderRewardReceiverReplacementApproved as RewardReceiverUpdatedEvent,
  CommunityApproved as CommunityApprovedEvent,
  Dewhitelisted as CommunityBannedEvent,
  GaugeCreated as GaugeCreatedEvent,
  KYCApproved as KYCApprovedEvent,
  KYCRevoked as KYCRevokedEvent,
  Paused as KYCPausedEvent,
  Unpaused as KYCResumedEvent,
  Revoked as SelfPausedEvent,
  Permitted as SelfResumedEvent,
} from "../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { Builder, BuilderState } from "../generated/schema";
import { GaugeRootstockCollective } from "../generated/templates";

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
  GaugeRootstockCollective.create(event.params.gauge_);
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
