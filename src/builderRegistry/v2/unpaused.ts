import { Unpaused as UnpausedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { kycResumed } from "../../shared";

export function handleUnpaused(event: UnpausedEvent): void {
  kycResumed(event.params.builder_, event);
}
