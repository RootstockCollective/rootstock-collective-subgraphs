import { Upgraded as UpgradedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { CONTRACT_CONFIG_ID, DEFAULT_BYTES } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = CONTRACT_CONFIG_ID;
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.builderRegistry = DEFAULT_BYTES;
    contractConfig.rewardDistributor = DEFAULT_BYTES;
    contractConfig.builders = [];
  }
  contractConfig.backersManager = event.address;

  contractConfig.save();
}
