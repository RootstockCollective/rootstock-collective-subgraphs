import { Whitelisted as WhitelistedEvent } from "../../../generated/BackersManagerRootstockCollectiveV1/BackersManagerRootstockCollectiveV1";
import { communityApproved } from "../../shared";

export function handleWhitelisted(event: WhitelistedEvent): void {
  communityApproved(event.params.builder_);
}
