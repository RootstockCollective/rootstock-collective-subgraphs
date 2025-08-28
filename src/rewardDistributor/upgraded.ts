import { Upgraded as UpgradedEvent } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { loadOrCreateContractConfig } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const contractConfig = loadOrCreateContractConfig();
  contractConfig.rewardDistributor = event.address;
  contractConfig.blockNumber = event.block.number;
  contractConfig.blockTimestamp = event.block.timestamp;
  contractConfig.blockHash = event.block.hash;

  contractConfig.save();
}
