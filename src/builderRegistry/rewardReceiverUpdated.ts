import { RewardReceiverUpdated as RewardReceiverUpdatedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { rewardReceiverUpdated } from "../shared";

export function handleRewardReceiverUpdated(
  event: RewardReceiverUpdatedEvent
): void {
  rewardReceiverUpdated(event.params.builder_, event.params.newRewardReceiver_, event);
}
