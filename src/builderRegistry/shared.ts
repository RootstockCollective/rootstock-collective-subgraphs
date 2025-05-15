import {
  Builder,
  BuilderState,
} from "../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";

export function rewardReceiverUpdated(
  builder: Address,
  newRewardReceiver: Address
): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  builderEntity.rewardReceiver = newRewardReceiver;

  builderEntity.save();
}

export function communityBanned(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  builderEntity.isHalted = false;

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.communityApproved = false;

  builderEntity.save();
  builderState.save();
}

export function kycApproved(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  builderEntity.isHalted = true;
  
  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.kycApproved = true;

  builderEntity.save();
  builderState.save();
}

export function kycRevoked(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  builderEntity.isHalted = false;

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.kycApproved = false;

  builderEntity.save();
  builderState.save();
}

export function kycPaused(builder: Address): void {
  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.kycPaused = true;

  builderState.save();
}

export function kycResumed(builder_: Address): void {
  const builderState = BuilderState.load(builder_);
  if (builderState == null) return;
  builderState.kycPaused = false;

  builderState.save();
}

export function selfPaused(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  builderEntity.isHalted = false;

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.selfPaused = true;

  builderEntity.save();
  builderState.save();
}

export function selfResumed(builder: Address): void {
  const builderEntity = Builder.load(builder);
  if (builderEntity == null) return;
  builderEntity.isHalted = true;

  const builderState = BuilderState.load(builder);
  if (builderState == null) return;
  builderState.selfPaused = false;

  builderEntity.save();
  builderState.save();
}
