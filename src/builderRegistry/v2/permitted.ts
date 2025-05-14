import { Permitted as PermittedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { selfResumed } from "../utils";

export function handlePermitted(event: PermittedEvent): void {
  selfResumed(event.params.builder_);
}
