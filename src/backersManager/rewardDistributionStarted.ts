import { RewardDistributionStarted as RewardDistributionStartedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { RewardDistributorRootstockCollective as RewardDistributorRootstockCollectiveContract } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { Address, Bytes } from "@graphprotocol/graph-ts";
import { loadOrCreateCycle, updateBlockInfo, loadOrCreateContractConfig } from "../utils";

export function handleRewardDistributionStarted(
  event: RewardDistributionStartedEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );
  const cycleStart = backersManagerContract.cycleStart(event.block.timestamp);
  const cycle = loadOrCreateCycle(changetype<Bytes>(Bytes.fromBigInt(cycleStart)));
  cycle.onDistributionPeriod = true;
  cycle.cycleStart = cycleStart;
  cycle.cycleDuration = backersManagerContract.getCycleStartAndDuration().getValue1();
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
