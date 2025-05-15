import { BuilderActivated as BuilderActivatedEvent } from "../../../generated/BackersManagerRootstockCollectiveV1/BackersManagerRootstockCollectiveV1";
import { builderInitialized } from "../../shared";

export function handleBuilderActivated(event: BuilderActivatedEvent): void {
  builderInitialized(
    event.params.builder_,
    event.params.rewardReceiver_,
    event.params.rewardPercentage_
  );
}
