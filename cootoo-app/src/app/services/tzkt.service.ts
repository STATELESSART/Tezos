import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { Coop, CoopRes, Metadata } from '../models/coop.model';
import { Nft } from '../models/nft.model';
import { Swap, SwapParam, SwapRes } from '../models/swap.model';
import { NftTzkt } from '../models/nft_tzkt.model';
import { Profile } from '../models/profile.model';
import { CoopDetail } from '../models/coop_detail.model';
import { Observable, never } from 'rxjs';
import { TzktRes } from '../models/tzkt.model';
import { bytes2Char } from '@taquito/utils';

@Injectable({
  providedIn: 'root'
})
export class TzktService {

  private tzktUrlAPI = environment.tzktUrlAPI
  private contract = environment.contract

  constructor(private http: HttpClient) {}


  getCoopsAddress() {
    const url = `${this.tzktUrlAPI}/operations/originations/?sender=${this.contract}`
    return this.http.get<Object[]>(url).pipe(
      map((originations: any[]) => {
        let coopAddressList: string[] = []
        originations.forEach(orig => {
          coopAddressList.push(orig['originatedContract']['address'])
        });
        return coopAddressList
      }))
  }

  getCoop(coopAddress: string) {
    const url = `${this.tzktUrlAPI}/contracts/${coopAddress}/storage`
    return this.http.get<Coop>(url).pipe(
      map((coop: Coop) => {
        coop.address = coopAddress
        return coop
      }))
  }

  getCoopDetail(coopAddress: string): Observable<CoopDetail> {
    const url = `${this.tzktUrlAPI}/contracts/${coopAddress}/storage`
    // ONLY AVAILABLE SWAPS: ?active=true
    const urlSwap = `${this.tzktUrlAPI}/contracts/${coopAddress}/bigmaps/swaps/keys?active=true`
    console.log(urlSwap)
    // let coopDetail = new CoopDetail()
    return this.http.get<CoopRes>(url).pipe(
      switchMap(coopRes => {

        let coopDetail = new CoopDetail().fromCoopTzkt(coopRes, coopAddress)
        // const coop = new Coop().fromCoopTzkt(coopRes, coopAddress)
        // console.log(coop)
        // coopDetail = {...coop, swaps: []}
        // coopDetail.address = coopAddress

        this.getCoopMetadata(coopAddress).subscribe(metadata => {
          console.log(metadata)
          coopDetail.name = metadata.name
          coopDetail.description = metadata.description
          coopDetail.image = metadata.image
        })

        // get swaps
        return this.http.get<SwapRes[]>(urlSwap).pipe(
          map((swapsRes) => {
          // coopDetail.swaps = []
            swapsRes.forEach((swapRes, index) => {
              let swap = new SwapParam().fromSwapTzkt(swapRes, coopAddress, index)
              // let swap = swapRes.value as SwapParam
              // swap.id = index
              return this.getNft(swap.fa2_address, swap.objkt_id).subscribe(nft => {
                swap.nft = nft
                console.log(nft)
                coopDetail.swaps.push(swap)
              })
            })

            console.log(coopDetail)
            return coopDetail

            // return this.http.get(urlMetadata).pipe(
            //   map((metadataRes) => {
                
            //     coopDetail.name = metadataRes.name
            //     return coopDetail
            //   }))

            
            

          }
        ))
        // return this.getBigmapOfContract(coopAddress, 'swaps').then(swaps => {
        //   coopDetail.swaps = swaps
        // });
        // return $swaps.pipe(
        //   map(swaps => {
        //     console.log(swaps);
        //     coop.swaps = swaps as unknown as Swap[];
        //     return coop; 
        //   })
        // );
        
        
      }))
  }


  getCoopMetadata(coopAddress: string) {

    const urlMetadata = `${this.tzktUrlAPI}/contracts/${coopAddress}/bigmaps/metadata/keys?active=true&key=content`
    console.log(urlMetadata)

    return this.http.get<TzktRes[]>(urlMetadata).pipe(
      map((metadataRes) => {
        console.log(JSON.parse(bytes2Char(metadataRes[0].value)))
        return JSON.parse(bytes2Char(metadataRes[0].value)) as Metadata
      }))

  }


  // getData(): Observable<string[]> {
  //   return this.http.get<string>('service1/getData').pipe(
  //     mergeMap( (dataFromSvc1) => {
  //       return this.http.get<string[]>('service2/getData/' + dataFromSvc1);
  //     }),
  //     catchError( (err) => {
  //       // handle error scenario
  //       console.log(err)
  //     }
  //   )
  // }

  // getData(): Observable<string[]> {
  //   return this.http.get<string>('service1/getData')
  //     .pipe(
  //       switchMap(dataFromSvc1 => {
  //          return this.http.get<string[]>('service2/getData/' + dataFromSvc1);
  //       }),
  //       catchError(this.someErrorHandler)
  //     );
  // }
  

  async getWalletNfts(address: string) {
    const url = `${this.tzktUrlAPI}/tokens/balances?account=${address}&limit=1000&token.standard.type=fa2&balance.gt=0`
    return this.http.get<any[]>(url).pipe(
      map((nftRes) => {
        let nfts: Nft[] = []
        nftRes.forEach(nftRes => {
          console.log(nftRes['token'])
          const nft: Nft = new Nft().fromNftTzkt(nftRes['token']) 
          // if ('artifactUri' in metadata) {
          //   let artifactUri = metadata.artifactUri
          //   artifactUri = artifactUri.replace("ipfs://", "")
  
          //   const url = 'https://ipfs.io/ipfs/' + artifactUri
          //   nft.metadata.artifactUri = url
          // } else {
          //   nft.metadata.artifactUri = ''
          // }
          
          nfts.push(nft)
        })
        console.log(nfts)
        return nfts
      }))
    
  }

  getNft(fa2_address: string, objkt_id: number) {
    const url = `${this.tzktUrlAPI}/tokens/?contract=${fa2_address}&tokenId=${objkt_id}`
    return this.http.get<any[]>(url).pipe(
      map((nftRes) => {
        const nft: Nft = new Nft().fromNftTzkt(nftRes[0])
        
        // const metadata = nft.metadata
        // if ('artifactUri' in metadata) {
        //   let artifactUri = nft.metadata['artifactUri']
        //   artifactUri = artifactUri.replace("ipfs://", "")

        //   const url = 'https://ipfs.io/ipfs/' + artifactUri
        //   nft.metadata.artifactUri = url
        // } else {
        //   nft.metadata.artifactUri = ''
        // }

        return nft
      }))
    
  }


  // async getCoopNfts(address: string) {
  //   return (await this.getBigmapOfContract(this.contract, 'swaps')).pipe(
  //     map(swaps => {
  //     console.log(swaps)
  //     let nfts: Nft[] = []
  //     swaps.forEach(async swapsRes => {
  //       const swap: Swap = swapsRes.value
  //       swap.swap_id = swapsRes.key
  //       console.log(swap)
  //       if (swap.coop_address == address) {
  //         const fa2_address = swap.fa2_address
  //         const objkt_id = swap.objkt_id;
  //         (await this.getNft(fa2_address, objkt_id)).subscribe(nft => {
  //           // nft.swap = swap
  //           nfts.push(nft)
  //         })
  //       }
  //     })
  //     return nfts
  //   }))

    
  // }


  async getUserProfile(address: string) {
    const url = `${this.tzktUrlAPI}/accounts/${address}` 

    let profile = new Profile(address)

    return this.http.get<object>(url).pipe(
      map(res => {

        console.log(res)
        if ('metadata' in res) {
          const metadata = res['metadata'] as object
          console.log(res['metadata'])
          profile.exists = true

          if ('alias' in metadata) {
            profile.alias = metadata['alias'] as string
          }

          if ('description' in metadata) {
            profile.description = metadata['description'] as string
          }

          // profile.alias = res['metadata']['alias']
        }

      return profile
      
      })
    )
    
  }




  // async getContractStorageFieldAPI(address: string, fieldName: string) {
  //   const url = `${this.tzktUrlAPI}/contracts/${address}/storage/?path=${fieldName}`
  //   return this.http.get<string[]>(url)
  // }


  async getOriginatedContractAddressFromHash(opHash: string) {
    return (await this.getOriginationByHash(opHash)).pipe(
      map((data: any) => {
        return data[0]['originatedContract']['address']
      })
    )

  }

  async getOriginationByHash(opHash: string) {
    const url = `${this.tzktUrlAPI}/operations/originations/${opHash}`
    return this.http.get<Object>(url)
  }

  async getBigmapOfContract(address: string, bigmapName: string) {
    const url = `${this.tzktUrlAPI}/contracts/${address}/bigmaps/${bigmapName}/keys`
    console.log(url)
    return this.http.get<any[]>(url)
    // .pipe(
    //   map((data: any) => {
    //     return data
    //   })
    // )
  }
  
}
