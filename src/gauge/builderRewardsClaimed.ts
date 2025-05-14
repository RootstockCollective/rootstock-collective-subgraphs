import { BuilderRewardsClaimed as BuilderRewardsClaimedEvent } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { Builder, BuilderRewardsClaimed } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleBuilderRewardsClaimed(
  event: BuilderRewardsClaimedEvent
): void {
  const builder = Builder.load(event.params.builder_);
  if (builder == null) return;

  const rewardsClaimedId = event.params.builder_.concat(
    event.params.rewardToken_
  );
  let rewardsClaimed = BuilderRewardsClaimed.load(rewardsClaimedId);
  if (rewardsClaimed == null) {
    rewardsClaimed = new BuilderRewardsClaimed(rewardsClaimedId);
    rewardsClaimed.amount_ = BigInt.zero();
  }
  rewardsClaimed.builder_ = event.params.builder_;
  rewardsClaimed.token_ = event.params.rewardToken_;
  rewardsClaimed.amount_ = rewardsClaimed.amount_.plus(event.params.amount_);

  rewardsClaimed.save();
  builder.save();
}
