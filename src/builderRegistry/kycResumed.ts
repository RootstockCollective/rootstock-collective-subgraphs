import { KYCResumed as KYCResumedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycResumed } from "./shared";

export function handleKYCResumed(event: KYCResumedEvent): void {
  kycResumed(event.params.builder_);
}
