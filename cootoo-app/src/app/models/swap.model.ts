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
}