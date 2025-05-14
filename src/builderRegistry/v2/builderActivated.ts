import { BuilderActivated as BuilderActivatedEvent } from "../../../generated/BuilderRegistryRootstockCollectiveV2/BuilderRegistryRootstockCollectiveV2";
import { builderInitialized } from "../utils";

export function handleBuilderActivated(event: BuilderActivatedEvent): void {
  builderInitialized(
    event.params.builder_,
    event.params.rewardReceiver_,
    event.params.rewardPercentage_
  );
}
