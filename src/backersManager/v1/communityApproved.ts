import { CommunityApproved as CommunityApprovedEvent } from "../../../generated/BackersManagerRootstockCollectiveV1/BackersManagerRootstockCollectiveV1";
import { communityApproved } from "../../shared";

export function handleCommunityApproved(event: CommunityApprovedEvent): void {
  communityApproved(event.params.builder_);
}
