import { NftMetadata } from "./nft-metadata.model";
import { Swap } from "./swap.model";

export class Nft {
    contract!: {address: string};
    metadata!: NftMetadata;
    tokenId!: number;
    totalSupply!: number;
    firstMinter!: {address: string};
    swap?: Swap;
  } 