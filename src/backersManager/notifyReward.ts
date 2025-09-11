import { NotifyReward as NotifyRewardEvent } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { BackersManagerRootstockCollective as BackersManagerRootstockCollectiveContract } from "../../generated/BackersManagerRootstockCollective/BackersManagerRootstockCollective";
import { loadOrCreateCycle, updateBlockInfo } from "../utils";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleNotifyReward(
  event: NotifyRewardEvent
): void {
  const backersManagerContract = BackersManagerRootstockCollectiveContract.bind(
    event.address
  );
  const cycleStart = backersManagerContract.cycleNext(event.block.timestamp);
  const cycle = loadOrCreateCycle(changetype<Bytes>(Bytes.fromBigInt(cycleStart)));
  if(event.params.rewardToken_.equals(backersManagerContract.rewardToken())) { 
    cycle.rewardsERC20 = cycle.rewardsERC20.plus(event.params.amount_);
  } else {
    cycle.rewardsRBTC = cycle.rewardsRBTC.plus(event.params.amount_);
  }
  
  cycle.save();

  updateBlockInfo(event, ["Cycle"]);
}
