import { Upgraded as UpgradedEvent } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { ContractConfig } from "../../generated/schema";  
import { CONTRACT_CONFIG_ID, ZERO_ADDRESS } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = CONTRACT_CONFIG_ID;
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.backersManager = ZERO_ADDRESS;
    contractConfig.builderRegistry = ZERO_ADDRESS;
    contractConfig.builders = [];
    contractConfig.blockNumber = event.block.number;
    contractConfig.blockTimestamp = event.block.timestamp;
    contractConfig.blockHash = event.block.hash;
  }
  contractConfig.rewardDistributor = event.address;

  contractConfig.save();
}
