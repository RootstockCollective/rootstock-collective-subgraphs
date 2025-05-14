import { CommunityBanned as CommunityBannedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { communityBanned } from "./utils";

export function handleCommunityBanned(event: CommunityBannedEvent): void {
  communityBanned(event.params.builder_);
}
