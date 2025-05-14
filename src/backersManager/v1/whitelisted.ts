import { Whitelisted as WhitelistedEvent } from "../../../generated/BackersManagerRootstockCollectiveV1/BackersManagerRootstockCollectiveV1";
import { Builder, BuilderState } from "../../../generated/schema";

export function handleWhitelisted(event: WhitelistedEvent): void {
  const builder = Builder.load(event.params.builder_);
  if (builder == null) return;
  let builderState = BuilderState.load(builder.id);
  if (builderState == null) {
    builderState = new BuilderState(builder.id);
    builderState.builder_ = builder.id;
    builderState.kycApproved_ = false;
    builderState.kycPaused_ = false;
    builderState.selfPaused_ = false;
    builderState.initialized_ = false;
  }
  builderState.communityApproved_ = true;
  builderState.save();
  builder.save();
}
