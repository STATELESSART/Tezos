import { Member } from "./coop.model";
import { NftMetadata } from "./nft-metadata.model";
import { NftTzkt } from "./nft_tzkt.model";
import { Swap } from "./swap.model";

export class Nft {
    fa2Address!: string;
    // metadata!: NftMetadata;
    creator!: Member
    tokenId!: number;
    totalSupply!: number;
    title!: string;
    tags!: string[];
    symbol!: string;
    formats!: [{
        mimeType: string
    }];
    // creators!: string[];
    artifactUri: string = '';
    // displayUri!: string;
    description!: string;
    thumbnailUri!: string;
    // firstMinter!: {address: string};
    // swap?: Swap;

    fromNftTzkt(input: NftTzkt): this {
      console.log(input)
      console.log(this)
      this.fa2Address = input.contract.address
      this.creator = {address: input.metadata.creators[0], name: ''}
      this.tokenId = input.tokenId
      this.totalSupply = input.totalSupply
      this.title = input.metadata.name
      this.tags = input.metadata.tags
      this.symbol = input.metadata.symbol
      this.formats = input.metadata.formats
      this.artifactUri = input.metadata.artifactUri
      this.description = input.metadata.description
      this.thumbnailUri = input.metadata.thumbnailUri
      return this;
    }
  } 

