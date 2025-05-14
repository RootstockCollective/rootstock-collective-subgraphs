import { CommunityApproved as CommunityApprovedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { communityApproved } from "./utils";

export function handleCommunityApproved(event: CommunityApprovedEvent): void {
  communityApproved(event.params.builder_);
}
