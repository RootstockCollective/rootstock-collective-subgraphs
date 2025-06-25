import { BackerRewardPercentageUpdateScheduled as BackerRewardPercentageUpdateScheduledEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { backerRewardPercentageUpdateScheduled } from "../shared";

export function handleBackerRewardPercentageUpdateScheduled(event: BackerRewardPercentageUpdateScheduledEvent): void {
    backerRewardPercentageUpdateScheduled(event.params.builder_, event.params.rewardPercentage_, event.params.cooldown_, event.block.timestamp, event);
}
