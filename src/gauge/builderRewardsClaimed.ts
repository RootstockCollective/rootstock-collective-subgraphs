import { Address } from "@graphprotocol/graph-ts";
import { BackersManagerRootstockCollective } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import {
  Builder,
  BuilderRewardsClaimed,
  ClaimedRewardsHistory,
  GaugeToBuilder,
} from "../../generated/schema";
import { BuilderRewardsClaimed as BuilderRewardsClaimedEvent } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import {
  DEFAULT_BIGINT,
  loadOrCreateContractConfig,
  logEntityNotFound,
  updateBlockInfo,
} from "../utils";

export function handleBuilderRewardsClaimed(
  event: BuilderRewardsClaimedEvent,
): void {
  _updateBuilderRewardsClaimed(event);
  _updateClaimedRewards(event);

  updateBlockInfo(event, ["BuilderRewardsClaimed", "ClaimedRewardsHistory"]);
}

export function _updateBuilderRewardsClaimed(
  event: BuilderRewardsClaimedEvent,
): void {
  const builder = Builder.load(event.params.builder_);
  if (builder == null) {
    logEntityNotFound(
      "Builder",
      event.params.builder_.toHexString(),
      "_updateBuilderRewardsClaimed",
    );
    return;
  }

  const rewardsClaimedId = event.params.builder_.concat(
    event.params.rewardToken_,
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
}

function _updateClaimedRewards(event: BuilderRewardsClaimedEvent): void {
  let entity = new ClaimedRewardsHistory(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );

  const gaugeToBuilder = GaugeToBuilder.load(event.address);
  if (gaugeToBuilder == null) {
    logEntityNotFound(
      "GaugeToBuilder",
      event.params.builder_.toHexString(),
      "BuilderRewardsClaimed._updateClaimedRewards",
    );
    return;
  }

  const contractConfig = loadOrCreateContractConfig();
  const backersManagerContract = BackersManagerRootstockCollective.bind(
    Address.fromBytes(contractConfig.backersManager),
  );

  const cycleStart = backersManagerContract.cycleStart(event.block.timestamp);

  entity.backer = null; // Signifying that this is a builder reward claim
  entity.rewardToken = event.params.rewardToken_;
  entity.amount = event.params.amount_;
  entity.builder = gaugeToBuilder.builder;
  entity.cycleStart = cycleStart;
  entity.blockTimestamp = event.block.timestamp;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;
  
  entity.save();
}
