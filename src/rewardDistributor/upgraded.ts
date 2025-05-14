import { Upgraded as UpgradedEvent } from "../../generated/RewardDistributorRootstockCollective/RewardDistributorRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = Bytes.fromUTF8("default");
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.backersManager_ = Bytes.empty();
    contractConfig.builderRegistry_ = Bytes.empty();
  }
  contractConfig.rewardDistributor_ = event.address;

  contractConfig.save();
}
