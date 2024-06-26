import { Injectable } from '@angular/core';
import { MichelsonMap, OpKind, TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { char2Bytes } from '@taquito/utils';
import { NetworkType, AccountInfo } from '@airgap/beacon-wallet'
import { BeaconEvent } from '@airgap/beacon-dapp';
import { Store } from '@ngrx/store'
import { State } from 'src/app/app.reducer'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { TzktService } from './tzkt.service';
import { environment } from 'src/environments/environment';
import { SwapParam } from '../models/swap.model';
 
@Injectable({
  providedIn: 'root',
})
export class TaquitoService {
  
  public network = {
    type: NetworkType.GHOSTNET,
    rpcUrl: 'https://ghostnet.ecadinfra.com'
  }

  private taquito: TezosToolkit = new TezosToolkit(this.network.rpcUrl);
  public wallet: BeaconWallet
  public accountInfo$: Observable<AccountInfo | undefined>
  private _accountInfo: BehaviorSubject<AccountInfo | undefined> = new BehaviorSubject<AccountInfo | undefined>(undefined)

  public contract = environment.contract
  public originatedContract!: string;
  private numBlocks = 1

  public options = {
    name: environment.appName,
    iconUrl: environment.iconForWalletUrl,
    preferredNetwork: this.network.type,
  };

  constructor(
    private readonly store$: Store<State>,
    private tzkt: TzktService
  ) {
    
    this.wallet = new BeaconWallet(this.options)
    this.wallet.client.subscribeToEvent(
      BeaconEvent.ACTIVE_ACCOUNT_SET,
      async (activeAccount: any) => {
        console.log('NEW ACTIVEACCOUNT SET', activeAccount);
      }
    )
    this.taquito.setWalletProvider(this.wallet)

    // Handle aborted event emitted by the SDK
    this.wallet.client.subscribeToEvent(
      BeaconEvent.OPERATION_REQUEST_ERROR,
      (e: any) => {
        console.log(e)
      }
    )

    this.store$
      .select(
        (state: any) => (state as any).app.connectedWallet as AccountInfo | undefined
      )
      .subscribe((accountInfo: any) => {
        this._accountInfo.next(accountInfo)
      })

    this.accountInfo$ = this._accountInfo.asObservable()

  }
  

  // -------AUTH---------

  async setupBeaconWallet(): Promise<AccountInfo | undefined> {
    try {
      return await this.wallet.client.getActiveAccount()
    } catch (error) {
      console.error('Setting up BeaconWallet failed: ', error)
      return undefined
    }
  }

  async requestPermission(): Promise<AccountInfo | undefined> {
    await this.wallet.requestPermissions({ network: this.network })
    return this.wallet.client.getActiveAccount()
  }

  async reset(): Promise<void> {
    return this.wallet.clearActiveAccount()
  }


  // ----- MARKETPLACE CONTRACT ------  

  async createCoop(coop_share: number, members: string[], metadata: string, tezLimit: number) {

    this.taquito.setProvider({ wallet: this.wallet });

    let metadataMap = {
      "": char2Bytes('tezos-storage:content'), 
      "content": char2Bytes(metadata)}
    try {
      return await this.taquito.wallet.at(this.contract)
        .then((c: any) => c.methods.create_coop(
            coop_share,
            members,
            MichelsonMap.fromLiteral(metadataMap),
            tezLimit
          )
          .send()
      ).then((op: any) => {
        return op.confirmation(this.numBlocks+1).then(async () => {
          return (await this.tzkt.getOriginatedContractAddressFromHash(op.opHash))
        })
      })

    } catch (e) {
      return of(e)
    }
  
  }


  async swapv2(swap: SwapParam, walletAddress: string) { //fa2Address, contractAddress, royalties, objkt_amount, xtz_per_objkt, objkt_id, creator, ownerAddress) {
    // If using proxy: both calls are made through this.state.proxyAddress:
    // const objktsAddress = this.state.proxyAddress || this.state.objkts;
    // const marketplaceAddress = this.state.proxyAddress || this.state.v2;
    // const ownerAddress = this.state.proxyAddress || from;

    const fa2 = await this.taquito.wallet.at(swap.fa2_address)
    const marketplace = await this.taquito.wallet.at(swap.coop_address)

    const operatorParamsAdd = [{
      add_operator: {
          owner: walletAddress,
          operator: swap.coop_address,
          token_id: swap.objkt_id
      }
    }]

    const operatorParamsRemove = [{
      remove_operator: {
          owner: walletAddress,
          operator: swap.coop_address,
          token_id: swap.objkt_id
      }
    }]

    const list: any[] = [
      
      {
        kind: OpKind.TRANSACTION,
        ...fa2.methods['update_operators'](
          operatorParamsAdd
        ).toTransferParams()
      },
      {
        kind: OpKind.TRANSACTION,
        ...marketplace.methodsObject['swap'](swap).toTransferParams()
      },
      {
        kind: OpKind.TRANSACTION,
        ...fa2.methods['update_operators'](
          operatorParamsRemove
        ).toTransferParams()
      },
    ]

    try{
      return await this.taquito.wallet.batch(list).send().then((op: any) => {
        return op.confirmation(this.numBlocks).then(async () => {
          return [false, 'success']
        })
      })
    } catch (e) {
      const fail = true
      return [fail, e]
    }
}


  // async updateOperatorFA2(swap: SwapParam, walletAddress: string) {

  //   this.taquito.setProvider({ wallet: this.wallet });

  //   const operatorParams = [{
  //     add_operator: {
  //         owner: walletAddress,
  //         operator: this.contract,
  //         token_id: swap.objkt_id
  //     }
  //   }]

  //   try {
  //     return await this.taquito.wallet.at(swap.fa2_address)
  //       .then((c: any) => c.methodsObject.update_operators(
  //         operatorParams
  //         )
  //         .send()
  //     ).then((op: any) => {
  //       return op.confirmation(this.numBlocks).then(async () => {
  //         return [false, 'success']
  //       })
  //     })

  //   } catch (e) {
  //     const fail = true
  //     return [fail, e]
  //   }

  // }


  // async swap(coop_address: string, creator: string, fa2_address: string, 
  //     objkt_id: number, objkt_amount: number, xtz_per_objkt: number, royalties: number) {
  // async swap(swap: SwapParam) {

  //   this.taquito.setProvider({ wallet: this.wallet });

  //   try {
  //     return await this.taquito.wallet.at(this.contract)
  //       .then((c: any) => c.methodsObject.swap(
  //         swap
  //         )
  //         .send({ amount: 0 })
  //     ).then((op: any) => {
  //       return op.confirmation(this.numBlocks).then(async () => {
  //         return [false, 'success']
  //       })
  //     })

  //   } catch (e) {
  //     const fail = true
  //     return [fail, e]
  //   }
  
  // }


  async collect(coopAddress: string, swapId: number, swapAmount: number) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(coopAddress)
        .then((c: any) => c.methodsObject.collect(
          swapId
          )
          .send({ amount: swapAmount / 1000000 })
      ).then((op: any) => {
        return op.confirmation(this.numBlocks).then(async () => {
          return [false, 'success']
        })
      })

    } catch (e) {
      const fail = true
      return [fail, e]
    }
  
  }



  // ------- INDIVIDUAL COOP CONTRACT ------- 

  async addMembers(coopAddress: string, addressList: string[]) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(coopAddress)
        .then((c: any) => c.methods.add_members(
          addressList
        )
          .send()
      ).then((op: any) => {
        return op.confirmation(this.numBlocks).then(() => {
          return [false, 'success']
        })
      })
    } catch (e) {
      const fail = true
      return [fail, e]
    }
  }

  async deleteMember(coopAddress: string, memberAddress: string) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(coopAddress)
        .then((c: any) => c.methods.delete_member(
          memberAddress
        )
          .send()
      ).then((op: any) => {
        return op.confirmation(this.numBlocks).then(() => {
          return [false, 'success']
        })
      })
    } catch (e) {
      const fail = true
      return [fail, e]
    }
  }

  async changeCoopShare(coopAddress: string, newcoop_share: number) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(coopAddress)
        .then((c: any) => c.methods.change_coop_share(
          newcoop_share
        )
          .send()
      ).then((op: any) => {
        return op.confirmation(this.numBlocks).then(() => {
          return [false, 'success']
        })
      })
    } catch (e) {
      const fail = true
      return [fail, e]
    }
  }
 
}
