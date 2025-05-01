import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BackerRewardsClaimed } from "../generated/schema"
import { BackerRewardsClaimed as BackerRewardsClaimedEvent } from "../generated/GaugeRootstockCollective/GaugeRootstockCollective"
import { handleBackerRewardsClaimed } from "../src/gauge-rootstock-collective"
import { createBackerRewardsClaimedEvent } from "./gauge-rootstock-collective-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let rewardToken_ = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let backer_ = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let amount_ = BigInt.fromI32(234)
    let newBackerRewardsClaimedEvent = createBackerRewardsClaimedEvent(
      rewardToken_,
      backer_,
      amount_
    )
    handleBackerRewardsClaimed(newBackerRewardsClaimedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BackerRewardsClaimed created and stored", () => {
    assert.entityCount("BackerRewardsClaimed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BackerRewardsClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "rewardToken_",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BackerRewardsClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "backer_",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BackerRewardsClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amount_",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
