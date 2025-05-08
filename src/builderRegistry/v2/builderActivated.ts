import { BuilderActivated as BuilderActivatedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { builderInitialized } from "../../shared";

export function handleBuilderActivated(event: BuilderActivatedEvent): void {
  builderInitialized(
    event.params.builder_,
    event.params.rewardReceiver_,
    event.params.rewardPercentage_,
    event.block.timestamp,
    event
  );
}
