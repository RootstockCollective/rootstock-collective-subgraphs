import { KYCResumed as KYCResumedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycResumed } from "./utils";

export function handleKYCResumed(event: KYCResumedEvent): void {
  kycResumed(event.params.builder_);
}
