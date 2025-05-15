import {
  BackerRewardsClaimed as BackerRewardsClaimedEvent,
} from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import {
  Backer,
  BackersRewardsClaimed,
  BackerToBuilder,
  BackerToBuilderRewardsClaimed,
  GaugeToBuilder,
} from "../../generated/schema";
import { DEFAULT_BIGINT } from "../utils";

export function handleBackerRewardsClaimed(
  event: BackerRewardsClaimedEvent
): void {
  _handleBacker(event);
  _handleBackerToBuilder(event);
}

function _handleBacker(event: BackerRewardsClaimedEvent): void {
  const backer = Backer.load(event.params.backer_);
  if (backer == null) return;

  const rewardsClaimedId = event.params.backer_.concat(
    event.params.rewardToken_
  );
  let rewardsClaimed = BackersRewardsClaimed.load(rewardsClaimedId);
  if (rewardsClaimed == null) {
    rewardsClaimed = new BackersRewardsClaimed(rewardsClaimedId);
    rewardsClaimed.amount = DEFAULT_BIGINT;
  }
  rewardsClaimed.backer = event.params.backer_;
  rewardsClaimed.token = event.params.rewardToken_;
  rewardsClaimed.amount = rewardsClaimed.amount.plus(event.params.amount_);

  rewardsClaimed.save();
}

function _handleBackerToBuilder(event: BackerRewardsClaimedEvent): void {
  const gaugeToBuilder = GaugeToBuilder.load(event.address);
  if (gaugeToBuilder == null) return;

  const backerToBuilderId = event.params.backer_.concat(
    gaugeToBuilder.builder
  );
  const backerToBuilder = BackerToBuilder.load(backerToBuilderId);
  if (backerToBuilder == null) return;

  const rewardsClaimedId = backerToBuilderId.concat(event.params.rewardToken_);
  let rewardsClaimed = BackerToBuilderRewardsClaimed.load(rewardsClaimedId);
  if (rewardsClaimed == null) {
    rewardsClaimed = new BackerToBuilderRewardsClaimed(rewardsClaimedId);
    rewardsClaimed.amount = DEFAULT_BIGINT;
  }
  rewardsClaimed.backerToBuilder = backerToBuilderId;
  rewardsClaimed.token = event.params.rewardToken_;
  rewardsClaimed.amount = rewardsClaimed.amount.plus(event.params.amount_);

  rewardsClaimed.save();
}
