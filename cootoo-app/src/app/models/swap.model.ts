import { TzktService } from "../services/tzkt.service";
import { Nft } from "./nft.model";

export class Swap {
    creator!: {
        address: string;
        name: string;
    };
    price!: number;
    amountLeft!: number;
    royalties!: number;
    id!: number;
    token!: Nft;
    status!: number;
}


export class SwapParam {
    coop_address!: string; 
    creator!: string;
    fa2_address!: string;
    objkt_id!: number; 
    objkt_amount!: number;
    xtz_per_objkt!: number;
    royalties!: number;
    id!: number;
    nft?: Nft

    fromSwapTzkt(input: SwapRes, coop_address: string, swap_id: number): this {
        console.log(input)
        console.log(this)
        this.coop_address = coop_address; 
        this.creator = input.value.creator;
        this.fa2_address = input.value.fa2_address;
        this.objkt_id = parseFloat(input.value.objkt_id); 
        this.objkt_amount = parseFloat(input.value.objkt_amount);
        this.xtz_per_objkt = parseFloat(input.value.xtz_per_objkt);
        this.royalties = parseFloat(input.value.royalties);
        this.id = swap_id;
        return this;
    }
}

export class SwapRes {
    // coop_address!: string; 
    value!: {
        creator: string;
        fa2_address: string;
        objkt_id: string; 
        objkt_amount: string;
        xtz_per_objkt: string;
        royalties: string;
    // id!: number;
    // nft?: Nft
    }
}

