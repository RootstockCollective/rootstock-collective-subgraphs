import { KYCRevoked as KYCRevokedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycRevoked } from "./utils";

export function handleKYCRevoked(event: KYCRevokedEvent): void {
  kycRevoked(event.params.builder_);
}
