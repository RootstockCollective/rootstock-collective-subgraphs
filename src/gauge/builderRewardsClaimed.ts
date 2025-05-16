import { BuilderRewardsClaimed as BuilderRewardsClaimedEvent } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import { Builder, BuilderRewardsClaimed } from "../../generated/schema";
import { DEFAULT_BIGINT } from "../utils";

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
    rewardsClaimed.amount = DEFAULT_BIGINT;
  }
  rewardsClaimed.builder = event.params.builder_;
  rewardsClaimed.token = event.params.rewardToken_;
  rewardsClaimed.amount = rewardsClaimed.amount.plus(event.params.amount_);

  rewardsClaimed.save();
  builder.save();
}
