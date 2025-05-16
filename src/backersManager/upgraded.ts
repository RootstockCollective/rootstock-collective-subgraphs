import { Upgraded as UpgradedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";
import { CONTRACT_CONFIG_ID } from "../utils";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = CONTRACT_CONFIG_ID;
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.builderRegistry = Bytes.empty();
    contractConfig.rewardDistributor = Bytes.empty();
    contractConfig.builders = [];
  }
  contractConfig.backersManager = event.address;

  contractConfig.save();
}
