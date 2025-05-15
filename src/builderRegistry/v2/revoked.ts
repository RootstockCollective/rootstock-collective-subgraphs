import { Revoked as RevokedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { selfPaused } from "../shared";

export function handleRevoked(event: RevokedEvent): void {
  selfPaused(event.params.builder_);
}
