import { Upgraded as UpgradedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { ContractConfig } from "../../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleUpgraded(event: UpgradedEvent): void {
  const id = Bytes.fromUTF8("default");
  let contractConfig = ContractConfig.load(id);
  if (contractConfig == null) {
    contractConfig = new ContractConfig(id);
    contractConfig.builderRegistry_ = Bytes.empty();
    contractConfig.rewardDistributor_ = Bytes.empty();
  }
  contractConfig.backersManager_ = event.address;

  contractConfig.save();
}
