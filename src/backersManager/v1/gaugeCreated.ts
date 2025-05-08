import { GaugeCreated as GaugeCreatedEvent } from "../../../generated/BackersManagerRootstockCollectiveV1/BackersManagerRootstockCollectiveV1";
import { gaugeCreated } from "../../shared";

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
  gaugeCreated(event.params.builder_, event.params.gauge_, event);
}
