import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Backer as BackerEntity } from "../generated/schema";
import { updateBlockInfo } from "./utils";

export class Backer extends BackerEntity { 

    constructor(id: Bytes) {
        super(id);
    }
    
    saveWithEvent(event: ethereum.Event): void {
        updateBlockInfo(event, ["Backer"]);
        super.save();
    }
}