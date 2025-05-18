import { RewardDistributionStarted as RewardDistributionStartedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { Address } from "@graphprotocol/graph-ts";
import { loadOrCreateCycle, CONTRACT_CONFIG_ID } from "../utils";

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
): void {
  const cycle = loadOrCreateCycle(event.address);
  cycle.onDistributionPeriod = true;

  const id = CONTRACT_CONFIG_ID;
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
