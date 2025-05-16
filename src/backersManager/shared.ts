import { Address } from "@graphprotocol/graph-ts";
import { Cycle } from "../../generated/schema";
import { DEFAULT_BIGINT } from "../utils";

export function loadOrCreateCycle(backersManager: Address): Cycle {
    let cycle = Cycle.load(backersManager);
    if (cycle == null) {
        cycle = new Cycle(backersManager);
        cycle.totalPotentialReward = DEFAULT_BIGINT;
        cycle.rewardsERC20 = DEFAULT_BIGINT;
        cycle.rewardsRBTC = DEFAULT_BIGINT;
        cycle.onDistributionPeriod = false;
        cycle.periodFinish = DEFAULT_BIGINT;
        cycle.cycleDuration = DEFAULT_BIGINT;
        cycle.distributionDuration = DEFAULT_BIGINT;
    }

    return cycle;
}
