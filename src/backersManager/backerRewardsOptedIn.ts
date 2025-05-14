import { BackerRewardsOptedIn as BackerRewardsOptedInEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Backer } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleBackerRewardsOptedIn(
  event: BackerRewardsOptedInEvent
): void {
  let backer = Backer.load(event.params.backer_);
  if (backer == null) {
    backer = new Backer(event.params.backer_);
    backer.totalAllocation_ = BigInt.zero();
  }
  backer.isBlacklisted_ = false;

  backer.save();
}
