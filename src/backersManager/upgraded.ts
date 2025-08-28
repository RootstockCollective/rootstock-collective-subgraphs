import { Upgraded as UpgradedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { loadOrCreateContractConfig } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const contractConfig = loadOrCreateContractConfig();
  contractConfig.backersManager = event.address;
  contractConfig.blockNumber = event.block.number;
  contractConfig.blockTimestamp = event.block.timestamp;
  contractConfig.blockHash = event.block.hash;

  contractConfig.save();
}
