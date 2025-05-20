import { BackerRewardsOptedOut as BackerRewardsOptedOutEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Backer } from "../../generated/schema";
import { DEFAULT_BIGINT } from "../utils";

export function handleBackerRewardsOptedOut(
  event: BackerRewardsOptedOutEvent
): void {
  let backer = Backer.load(event.params.backer_);
  if (backer == null) {
    backer = new Backer(event.params.backer_);
    backer.totalAllocation = DEFAULT_BIGINT;
  }
  backer.isBlacklisted = true;
  backer.save();
}
