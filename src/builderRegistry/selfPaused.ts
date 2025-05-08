import { SelfPaused as SelfPausedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { selfPaused } from "../shared";

export function handleSelfPaused(event: SelfPausedEvent): void {
  selfPaused(event.params.builder_, event);
}
