import { KYCPaused as KYCPausedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycPaused } from "../shared";

export function handleKYCPaused(event: KYCPausedEvent): void {
  kycPaused(event.params.builder_, event.params.reason_, event);
}
