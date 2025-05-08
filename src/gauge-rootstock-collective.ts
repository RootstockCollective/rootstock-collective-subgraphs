import {
  BackerRewardsClaimed as BackerRewardsClaimedEvent,
  BuilderRewardsClaimed as BuilderRewardsClaimedEvent,
} from "../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import {
  Backer,
  BackersRewardsClaimed,
  Builder,
  BuilderRewardsClaimed,
  BackerToBuilder,
  BackerToBuilderRewardsClaimed,
  GaugeToBuilder,
} from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

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
    rewardsClaimed.amount_ = BigInt.zero();
  }
  rewardsClaimed.backer_ = event.params.backer_;
  rewardsClaimed.token_ = event.params.rewardToken_;
  rewardsClaimed.amount_ = rewardsClaimed.amount_.plus(event.params.amount_);

  rewardsClaimed.save();
  backer.save();
}

function _handleBackerToBuilder(event: BackerRewardsClaimedEvent): void {
  const gaugeToBuilder = GaugeToBuilder.load(event.address);
  if (gaugeToBuilder == null) return;


  const backerToBuilderId = event.params.backer_.concat(gaugeToBuilder.builder_);
  const backerToBuilder = BackerToBuilder.load(backerToBuilderId);
  if (backerToBuilder == null) return;

  const rewardsClaimedId = backerToBuilderId.concat(event.params.rewardToken_);
  let rewardsClaimed = BackerToBuilderRewardsClaimed.load(rewardsClaimedId);
  if (rewardsClaimed == null) {
    rewardsClaimed = new BackerToBuilderRewardsClaimed(rewardsClaimedId);
    rewardsClaimed.amount_ = BigInt.zero();
  }
  rewardsClaimed.backerToBuilder_ = backerToBuilderId;
  rewardsClaimed.token_ = event.params.rewardToken_;
  rewardsClaimed.amount_ = rewardsClaimed.amount_.plus(event.params.amount_);

  rewardsClaimed.save();
  backerToBuilder.save();
}

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
