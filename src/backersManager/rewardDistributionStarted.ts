import { RewardDistributionStarted as RewardDistributionStartedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Cycle, ContractConfig } from "../../generated/schema";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { Address, Bytes } from "@graphprotocol/graph-ts";
import { DEFAULT_BIGINT } from "../utils";

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
): void {
  let cycle = Cycle.load(event.address);
  if (cycle == null) {
    cycle = new Cycle(event.address);
    cycle.totalPotentialReward = DEFAULT_BIGINT;
    cycle.periodFinish = DEFAULT_BIGINT;
    cycle.cycleDuration = DEFAULT_BIGINT;
    cycle.distributionDuration = DEFAULT_BIGINT;
  }
  cycle.onDistributionPeriod = true;

  const id = Bytes.fromUTF8("default");
  const contractConfig = ContractConfig.load(id);
  if (contractConfig == null) return;
  const rewardDistributorAddress = Address.fromBytes(
    contractConfig.rewardDistributor
  );
  const rewardDistributor = RewardDistributorRootstockCollectiveContract.bind(
    rewardDistributorAddress
  );
  cycle.rewardsERC20 = rewardDistributor.defaultRewardTokenAmount();
  cycle.rewardsRBTC = rewardDistributor.defaultRewardCoinbaseAmount();

  cycle.save();
}
