import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { Coop } from '../models/coop.model';
import { Nft } from '../models/nft.model';
import { Swap } from '../models/swap.model';

@Injectable({
  providedIn: 'root'
})
export class TzktService {

  private tzktUrlAPI = environment.tzktUrlAPI
  private contract = environment.contract

  constructor(private http: HttpClient) {}


  async getCoopsAddress() {
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

  async getCoop(coopAddress: string) {
    const url = `${this.tzktUrlAPI}/contracts/${coopAddress}/storage`
    return this.http.get<Coop>(url).pipe(
      map((coop: Coop) => {
        coop.contract = coopAddress
        return coop
      }))
  }

  async getWalletNfts(address: string) {
    const url = `${this.tzktUrlAPI}/tokens/balances?account=${address}&limit=1000&token.standard.type=fa2&balance.gt=0`
    return this.http.get<any[]>(url).pipe(
      map((nftRes) => {
        let nfts: Nft[] = []
        nftRes.forEach(nftRes => {
          const nft: Nft = nftRes['token']
          const metadata = nft.metadata
          console.log(metadata)
          if ('artifactUri' in metadata) {
            let artifactUri = metadata.artifactUri
            artifactUri = artifactUri.replace("ipfs://", "")
  
            const url = 'https://ipfs.io/ipfs/' + artifactUri
            nft.metadata.artifactUri = url
          } else {
            nft.metadata.artifactUri = ''
          }
          
          nfts.push(nft)
        })
        console.log(nfts)
        return nfts
      }))
    
  }

  async getNft(fa2_address: string, objkt_id: number) {
    const url = `${this.tzktUrlAPI}/tokens/?contract=${fa2_address}&tokenId=${objkt_id}`
    return this.http.get<any[]>(url).pipe(
      map((nftRes) => {
        const nft: Nft = nftRes[0]
        console.log(nft)
        
        const metadata = nft.metadata
        if ('artifactUri' in metadata) {
          let artifactUri = nft.metadata['artifactUri']
          artifactUri = artifactUri.replace("ipfs://", "")

          const url = 'https://ipfs.io/ipfs/' + artifactUri
          nft.metadata.artifactUri = url
        } else {
          nft.metadata.artifactUri = ''
        }

        return nft
      }))
    
  }


  async getCoopNfts(address: string) {
    return (await this.getBigmapOfContract(this.contract, 'swaps')).pipe(
      map(swaps => {
      console.log(swaps)
      let nfts: Nft[] = []
      swaps.forEach(async swapsRes => {
        const swap: Swap = swapsRes.value
        swap.swap_id = swapsRes.key
        console.log(swap)
        if (swap.coop_address == address) {
          const fa2_address = swap.fa2
          const objkt_id = swap.objkt_id;
          (await this.getNft(fa2_address, objkt_id)).subscribe(nft => {
            nft.swap = swap
            nfts.push(nft)
          })
        }
      })
      return nfts
    }))

    
  }

  

  async getCrowdfundingCategories() {

    return (await this.getContractStorageFieldAPI(this.contract, 'categories')).pipe(
      map((categoryList: string[]) => {
        return categoryList
      }))
  }


  async getContractStorageFieldAPI(address: string, fieldName: string) {
    const url = `${this.tzktUrlAPI}/contracts/${address}/storage/?path=${fieldName}`
    return this.http.get<string[]>(url)
  }


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

  async getBigmapOfContract(address: string, name: string) {
    const url = `${this.tzktUrlAPI}/contracts/${address}/bigmaps/${name}/keys`
    console.log(url)
    return this.http.get<any[]>(url)
  }
  
}
