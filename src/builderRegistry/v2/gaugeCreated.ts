import { GaugeCreated as GaugeCreatedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { gaugeCreated } from "../utils";

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
  gaugeCreated(event.params.builder_, event.params.gauge_);
}
