import { BuilderInitialized as BuilderInitializedEvent } from "../../generated/BuilderRegistryRootstockCollective/BuilderRegistryRootstockCollective";
import { builderInitialized } from "../shared";

export function handleBuilderInitialized(event: BuilderInitializedEvent): void {
  builderInitialized(
    event.params.builder_,
    event.params.rewardReceiver_,
    event.params.rewardPercentage_
  );
}
