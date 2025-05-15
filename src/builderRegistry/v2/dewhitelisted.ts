import { Dewhitelisted as DewhitelistedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { communityBanned } from "../shared";

export function handleDewhitelisted(event: DewhitelistedEvent): void {
  communityBanned(event.params.builder_);
}
