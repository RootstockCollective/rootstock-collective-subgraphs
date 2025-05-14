import { GaugeCreated as GaugeCreatedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { gaugeCreated } from "./utils";

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
  gaugeCreated(event.params.builder_, event.params.gauge_);
}
