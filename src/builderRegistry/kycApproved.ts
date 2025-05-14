import {
  KYCApproved as KYCApprovedEvent,
} from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { kycApproved } from "./utils";

export function handleKYCApproved(event: KYCApprovedEvent): void {
  kycApproved(event.params.builder_);
}
