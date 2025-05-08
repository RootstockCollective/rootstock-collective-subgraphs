import { KYCRevoked as KYCRevokedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycRevoked } from "../shared";

export function handleKYCRevoked(event: KYCRevokedEvent): void {
  kycRevoked(event.params.builder_, event);
}
