import { SelfPaused as SelfPausedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { selfPaused } from "./utils";

export function handleSelfPaused(event: SelfPausedEvent): void {
  selfPaused(event.params.builder_);
}
