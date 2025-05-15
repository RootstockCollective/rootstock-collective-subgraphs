import { SelfResumed as SelfResumedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { selfResumed } from "./shared";

export function handleSelfResumed(event: SelfResumedEvent): void {
  selfResumed(event.params.builder_);
}
