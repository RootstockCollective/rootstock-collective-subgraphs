import { KYCRevoked as KYCRevokedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { kycRevoked } from "../utils";

export function handleKYCRevoked(event: KYCRevokedEvent): void {
  kycRevoked(event.params.builder_);
}
