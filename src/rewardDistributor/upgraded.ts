import { Upgraded as UpgradedEvent } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";
import { CONTRACT_CONFIG_ID } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = CONTRACT_CONFIG_ID;
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.backersManager = Bytes.empty();
    contractConfig.builderRegistry = Bytes.empty();
    contractConfig.builders = [];
  }
  contractConfig.rewardDistributor = event.address;

  contractConfig.save();
}
