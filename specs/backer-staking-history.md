# RBI (Realized Backers Incentives)

The **Realized Backers Incentives (RBI)** percentage represents the actual percentage of rewards you have received so far based on your backing allocations.

The calculation follows this formula:

```math
\text{RBI \%} = \text{Total Staked Time} \times \frac{\text{Total Rewards Earned}}{\text{Total stRIF Allocated}}
```

Where:
- **Total Staked Time** is the total time during which the stRIF was allocated.
- **Total Rewards Earned** is the total rewards earned based on your backing.
- **Total stRIF Allocated** is the total amount of stRIF allocated over time, considering both the **allocation rate** and the **duration**.

### Explanation of Time-Based Allocation:

When stRIF is allocated over time, you need to consider the **amount of stRIF allocated per unit of time** and multiply it by the **duration** of allocation. For example, if **10 stRIF** is allocated for **5 seconds**, the total stRIF allocated is:

$$
\text{Total stRIF Allocated} = 10 \times 5 = 50 \, \text{stRIF-seconds}
$$

This gives the **Total stRIF Allocated** over the time period, which is factored into the RBI calculation.

## The Graph

To calculate the **RBI %**, we can leverage data from **The Graph** to obtain all the necessary variables. This approach simplifies the process by eliminating the need for additional manual calculations and event retrieval.

However, there is a drawback to using **The Graph**. Due to the nature of the rewards algorithm, relying solely on the event data provided by **The Graph** may not reflect the most up-to-date results. The data processed by **The Graph** is based on events, but the most accurate calculation requires values that account for the **last mined block**. This means that event-based data may lag behind the actual state of the system, leading to discrepancies in the values used for calculating the **RBI %**.

Thus, when calculating the RBI, we need to perform the calculations that are typically done in **The Graph**, but directly in the place where we want to display the RBI.

### Total Rewards Earned

The total rewards earned can be calculated by combining the `BackerRewardsClaimed` event and the `earned` function from the gauge contract.

We can retrieve all the events from **The Graph**, but the `earned` function needs to be called directly from the contract.

### New Allocation

The total staked time and stRIF allocated can be obtained by calculating the time that each allocation was staked. To do this, we need to perform the calculation on each `NewAllocation` event that is emitted. The `NewAllocation` event is emitted by each `Gauge` individually and in the `BackersManager`, which differentiates the gauge.

Once we process all the events, we still need to account for the data from the **last mined block**.

Below we will describe what is the process but this is also reflected in the code.

#### Total Staked Time

The total staked time is the sum of all the seconds that stRIF was staked. To calculate this, we compute the difference in seconds between the previous event and the current one, then add it to the accumulated total. We only include the time in the accumulated total if the allocations were greater than 0.

#### Total stRIF Allocated

The total stRIF allocated is the sum of the product of the number of seconds each allocation was staked and the allocation amount. To calculate this, we compute the difference in seconds between the previous event and the current one, multiply it by the allocation, and add it to the accumulated total.
