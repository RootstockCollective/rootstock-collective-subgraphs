import { Upgraded as UpgradedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { loadOrCreateContractConfig } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const contractConfig = loadOrCreateContractConfig();
  contractConfig.builderRegistry = event.address;
  contractConfig.blockNumber = event.block.number;
  contractConfig.blockTimestamp = event.block.timestamp;
  contractConfig.blockHash = event.block.hash;

  contractConfig.save();
}
