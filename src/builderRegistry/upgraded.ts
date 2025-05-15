import { Bytes } from "@graphprotocol/graph-ts";
import { Upgraded as UpgradedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { ContractConfig } from "../../generated/schema";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = Bytes.fromUTF8("default");
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.backersManager = Bytes.empty();
    contractConfig.rewardDistributor = Bytes.empty();
  }
  contractConfig.builderRegistry = event.address;

  contractConfig.save();
}
