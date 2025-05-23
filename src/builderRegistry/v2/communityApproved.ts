import { CommunityApproved as CommunityApprovedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { communityApproved } from "../../shared";

export function handleCommunityApproved(event: CommunityApprovedEvent): void {
  communityApproved(event.params.builder_);
}
