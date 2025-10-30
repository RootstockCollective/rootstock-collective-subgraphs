import { NotifyReward as NotifyRewardEvent } from "../../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { loadOrCreateCycle, updateBlockInfo, loadOrCreateCycleRewardPerToken } from "../../utils";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleNotifyReward(
  event: NotifyRewardEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(event.address);
  const nextCycleStart = backersManagerContract.cycleNext(event.block.timestamp);
  const currentCycleStart = backersManagerContract.cycleStart(event.block.timestamp);
  const cycle = loadOrCreateCycle(changetype<Bytes>(Bytes.fromBigInt(nextCycleStart)));

  cycle.previousCycleStart = currentCycleStart;
  cycle.previousCycleDuration = backersManagerContract.getCycleStartAndDuration().getValue1();
  cycle.currentCycleStart = nextCycleStart;
  cycle.distributionDuration = backersManagerContract.distributionDuration();
  cycle.save();

  const cycleRewardPerToken = loadOrCreateCycleRewardPerToken(event.params.rewardToken_, cycle);
  cycleRewardPerToken.amount = cycleRewardPerToken.amount.plus(event.params.amount_);
  cycleRewardPerToken.save();

  updateBlockInfo(event, ["Cycle", "CycleRewardPerToken"]);
}
