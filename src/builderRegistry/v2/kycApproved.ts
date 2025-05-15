import { KYCApproved as KYCApprovedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { kycApproved } from "../shared";

export function handleKYCApproved(event: KYCApprovedEvent): void {
  kycApproved(event.params.builder_);
}
