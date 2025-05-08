import {
  KYCApproved as KYCApprovedEvent,
} from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycApproved } from "../shared";

export function handleKYCApproved(event: KYCApprovedEvent): void {
  kycApproved(event.params.builder_, event);
}
