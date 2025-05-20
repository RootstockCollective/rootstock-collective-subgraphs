import { Upgraded as UpgradedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { CONTRACT_CONFIG_ID, ZERO_ADDRESS } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = CONTRACT_CONFIG_ID;
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.backersManager = ZERO_ADDRESS;
    contractConfig.rewardDistributor = ZERO_ADDRESS;
    contractConfig.builders = [];
  }
  contractConfig.builderRegistry = event.address;
  contractConfig.save();
}
