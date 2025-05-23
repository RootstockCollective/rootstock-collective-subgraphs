import { Permitted as PermittedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { selfResumed } from "../../shared";

export function handlePermitted(event: PermittedEvent): void {
  selfResumed(event.params.builder_, event.params.rewardPercentage_, event.params.cooldown_, event.block.timestamp);
}
