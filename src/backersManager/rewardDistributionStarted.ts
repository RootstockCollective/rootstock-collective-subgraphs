import { RewardDistributionStarted as RewardDistributionStartedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Cycle, ContractConfig } from "../../generated/schema";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
): void {
  let cycle = Cycle.load(event.address);
  if (cycle == null) {
    cycle = new Cycle(event.address);
    cycle.totalPotentialReward_ = BigInt.zero();
    cycle.periodFinish_ = BigInt.zero();
    cycle.cycleDuration_ = BigInt.zero();
    cycle.distributionDuration_ = BigInt.zero();
  }
  cycle.onDistributionPeriod_ = true;

  const id = Bytes.fromUTF8("default");
  const contractConfig = ContractConfig.load(id);
  if (contractConfig == null) return;
  const rewardDistributorAddress = Address.fromBytes(
    contractConfig.rewardDistributor_
  );
  const rewardDistributor = RewardDistributorRootstockCollectiveContract.bind(
    rewardDistributorAddress
  );
  cycle.rewardsERC20_ = rewardDistributor.defaultRewardTokenAmount();
  cycle.rewardsRBTC_ = rewardDistributor.defaultRewardCoinbaseAmount();

  cycle.save();
}
