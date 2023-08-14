export class NftMetadata {
    name!: string;
    tags!: string[];
    symbol!: string;
    formats!: [{
        mimeType: string
    }];
    creators!: string[];
    artifactUri: string = '';
    // displayUri!: string;
    description!: string;
    thumbnailUri!: string;
}
