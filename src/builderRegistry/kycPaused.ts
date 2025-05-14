import { KYCPaused as KYCPausedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycPaused } from "./utils";

export function handleKYCPaused(event: KYCPausedEvent): void {
  kycPaused(event.params.builder_);
}
