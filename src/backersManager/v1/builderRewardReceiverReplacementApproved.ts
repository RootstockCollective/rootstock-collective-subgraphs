import { BuilderRewardReceiverReplacementApproved as BuilderRewardReceiverReplacementApprovedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { rewardReceiverUpdated } from "../../shared";

export function handleBuilderRewardReceiverReplacementApproved(
  event: BuilderRewardReceiverReplacementApprovedEvent
): void {
  rewardReceiverUpdated(event.params.builder_, event.params.newRewardReceiver_, event);
}
