import { Upgraded as UpgradedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { CONTRACT_CONFIG_ID, DEFAULT_BYTES } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = CONTRACT_CONFIG_ID;
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.backersManager = DEFAULT_BYTES;
    contractConfig.rewardDistributor = DEFAULT_BYTES;
    contractConfig.builders = [];
  }
  contractConfig.builderRegistry = event.address;

  contractConfig.save();
}
