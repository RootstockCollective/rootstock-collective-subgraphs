import { RewardDistributionStarted as RewardDistributionStartedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { loadOrCreateCycle, updateBlockInfo, loadOrCreateContractConfig } from "../utils";

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );
  const currentCycleStart = backersManagerContract.cycleStart(event.block.timestamp);
  const cycleData = backersManagerContract.cycleData();

  // Duration of the finalized cycle (N)
  let finalizedDuration: BigInt;
  if (currentCycleStart.equals(cycleData.getNextStart())) {
    // Just switched into the first new cycle → previous cycle used previousDuration
    finalizedDuration = cycleData.getPreviousDuration();
  } else {
    // Already past the first new cycle → previous cycle used nextDuration
    finalizedDuration = cycleData.getNextDuration();
  }

  const finalizedCycleStart = currentCycleStart.minus(finalizedDuration);
  const cycle = loadOrCreateCycle(changetype<Bytes>(Bytes.fromBigInt(currentCycleStart)));
  cycle.onDistributionPeriod = true;
  cycle.previousCycleStart = finalizedCycleStart;
  cycle.previousCycleDuration = finalizedDuration;
  cycle.currentCycleStart = currentCycleStart;
  cycle.currentCycleDuration = backersManagerContract.getCycleStartAndDuration().getValue1();
  cycle.distributionDuration = backersManagerContract.distributionDuration();

  const contractConfig = loadOrCreateContractConfig();
  const rewardDistributorAddress = Address.fromBytes(
    contractConfig.rewardDistributor
  );
  const rewardDistributor = RewardDistributorRootstockCollectiveContract.bind(
    rewardDistributorAddress
  );
  cycle.rewardsERC20 = rewardDistributor.defaultRewardTokenAmount();
  cycle.rewardsRBTC = rewardDistributor.defaultRewardCoinbaseAmount();
  cycle.save();

  updateBlockInfo(event, ["Cycle"]);
}
