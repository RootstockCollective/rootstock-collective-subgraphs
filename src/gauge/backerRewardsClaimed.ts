import { Address } from "@graphprotocol/graph-ts";
import { BackersManagerRootstockCollective } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import {
  Backer,
  BackersRewardsClaimed,
  BackerToBuilder,
  BackerToBuilderRewardsClaimed,
  ClaimedRewardsHistory,
  GaugeToBuilder,
} from "../../generated/schema";
import { BackerRewardsClaimed as BackerRewardsClaimedEvent } from "../../generated/templates/GaugeRootstockCollective/GaugeRootstockCollective";
import {
  DEFAULT_BIGINT,
  loadOrCreateContractConfig,
  logEntityNotFound,
  updateBlockInfo,
} from "../utils";

export function handleBackerRewardsClaimed(
  event: BackerRewardsClaimedEvent,
): void {
  _updateBacker(event);
  _updateBackerToBuilder(event);
  _updateBackerRewardsClaimed(event);

  updateBlockInfo(event, [
    "BackerRewardsClaimed",
    "BackerToBuilderRewardsClaimed",
    "ClaimedRewardsHistory",
  ]);
}

function _updateBacker(event: BackerRewardsClaimedEvent): void {
  const backer = Backer.load(event.params.backer_);
  if (backer == null) {
    logEntityNotFound(
      "Backer",
      event.params.backer_.toHexString(),
      "BackerRewardsClaimed._updateBacker",
    );
    return;
  }

  const rewardsClaimedId = event.params.backer_.concat(
    event.params.rewardToken_,
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

function _updateBackerToBuilder(event: BackerRewardsClaimedEvent): void {
  const gaugeToBuilder = GaugeToBuilder.load(event.address);
  if (gaugeToBuilder == null) {
    logEntityNotFound(
      "GaugeToBuilder",
      event.address.toHexString(),
      "BackerRewardsClaimed._updateBackerToBuilder",
    );
    return;
  }

  const backerToBuilderId = event.params.backer_.concat(gaugeToBuilder.builder);
  const backerToBuilder = BackerToBuilder.load(backerToBuilderId);
  if (backerToBuilder == null) {
    logEntityNotFound(
      "BackerToBuilder",
      backerToBuilderId.toHexString(),
      "BackerRewardsClaimed._updateBackerToBuilder",
    );
    return;
  }

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

function _updateBackerRewardsClaimed(event: BackerRewardsClaimedEvent): void {
  let entity = new ClaimedRewardsHistory(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );

  const gaugeToBuilder = GaugeToBuilder.load(event.address);
  if (gaugeToBuilder == null) {
    logEntityNotFound(
      "GaugeToBuilder",
      event.address.toHexString(),
      "BackerRewardsClaimed._updateBackerRewardsClaimed",
    );
    return;
  }

  const contractConfig = loadOrCreateContractConfig();
  const backersManagerContract = BackersManagerRootstockCollective.bind(
    Address.fromBytes(contractConfig.backersManager),
  );
  const cycleStart = backersManagerContract.cycleStart(event.block.timestamp);

  entity.backer = event.params.backer_;
  entity.rewardToken = event.params.rewardToken_;
  entity.amount = event.params.amount_;
  entity.builder = gaugeToBuilder.builder;
  entity.cycleStart = cycleStart;

  entity.blockHash = event.block.hash;

  entity.save();
}
