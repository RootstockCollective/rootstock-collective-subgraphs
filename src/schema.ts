import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Backer as BackerEntity } from "../generated/schema";
import { updateBlockInfo } from "./utils";

// TODO: not used for now, but we're going to implement this idea in the future
export class Backer extends BackerEntity { 

    constructor(id: Bytes) {
        super(id);
    }
    
    saveWithEvent(event: ethereum.Event): void {
        updateBlockInfo(event, ["Backer"]);
        super.save();
    }
}