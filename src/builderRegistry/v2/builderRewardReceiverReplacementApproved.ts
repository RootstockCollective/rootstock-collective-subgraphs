import { BuilderRewardReceiverReplacementApproved as BuilderRewardReceiverReplacementApprovedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { rewardReceiverUpdated } from "../utils";

export function handleBuilderRewardReceiverReplacementApproved(
  event: BuilderRewardReceiverReplacementApprovedEvent
): void {
  rewardReceiverUpdated(event.params.builder_, event.params.newRewardReceiver_);
}
