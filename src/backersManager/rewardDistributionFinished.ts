import { RewardDistributionFinished as RewardDistributionFinishedEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { CONTRACT_CONFIG_ID, DEFAULT_BYTES, loadOrCreateGlobalMetric, updateBlockInfo } from "../utils";
import { ContractConfig, Cycle } from "../../generated/schema";

export function handleRewardDistributionFinished(
  event: RewardDistributionFinishedEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );

  const contractConfig = ContractConfig.load(CONTRACT_CONFIG_ID);
  if (contractConfig != null && !contractConfig.distributingCycleId.equals(DEFAULT_BYTES)) {
    const cycle = Cycle.load(contractConfig.distributingCycleId);
    if (cycle != null) {
      cycle.onDistributionPeriod = false;
      cycle.save();
    }
    contractConfig.distributingCycleId = DEFAULT_BYTES;
    contractConfig.save();
  }

  const globalMetric = loadOrCreateGlobalMetric();
  globalMetric.totalPotentialReward = backersManagerContract.totalPotentialReward();
  globalMetric.save();

  updateBlockInfo(event, ["Cycle", "ContractConfig", "GlobalMetric"]);
}
