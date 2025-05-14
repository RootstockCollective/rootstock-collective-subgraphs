import { Paused as PausedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { kycPaused } from "../utils";

export function handlePaused(event: PausedEvent): void {
  kycPaused(event.params.builder_);
}
