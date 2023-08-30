import { Injectable } from '@angular/core';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType, AccountInfo } from '@airgap/beacon-wallet'
import { BeaconEvent } from '@airgap/beacon-dapp';
import { Store } from '@ngrx/store'
import { State } from 'src/app/app.reducer'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { TzktService } from './tzkt.service';
import { environment } from 'src/environments/environment';
import { Swap } from '../models/swap.model';
 
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

  async createCoop(coopShare: number, members: string[]) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(this.contract)
        .then((c: any) => c.methods.create_coop(
            coopShare,
            members
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

  // async updateOperatorsAndSwap(swap: Swap) {

  //   this.taquito.setProvider({ wallet: this.wallet });

  //   const operatorParams = [{
  //     add_operator: {
  //         owner: this.wallet.getPKH(),
  //         operator: this.contract,
  //         token_id: swap.objkt_id
  //     }
  //   }]

  //   const dappContract = await this.taquito.wallet.at(this.contract);
  //   const FA2Contract = await this.taquito.wallet.at(swap.fa2_address);

  //   try {
  //     return await this.taquito.wallet.batch()
  //     .withContractCall(FA2Contract.methods.update_operators(
  //       operatorParams
  //     ))
  //     .withContractCall(dappContract.methods.mint())
  //     .send()
  //     .then((op: any) => {
  //       return op.confirmation(this.numBlocks+1).then(async () => {
  //         return [false, 'success']
  //       })
  //     })

  //   } catch (e) {
  //     const fail = true
  //     return [fail, e]
  //   }

  // }


  async updateOperatorFA2(swap: Swap, walletAddress: string) {

    this.taquito.setProvider({ wallet: this.wallet });

    const operatorParams = [{
      add_operator: {
          owner: walletAddress,
          operator: this.contract,
          token_id: swap.objkt_id
      }
    }]

    try {
      return await this.taquito.wallet.at(swap.fa2_address)
        .then((c: any) => c.methodsObject.update_operators(
          operatorParams
          )
          .send()
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


  // async swap(coop_address: string, creator: string, fa2_address: string, 
  //     objkt_id: number, objkt_amount: number, xtz_per_objkt: number, royalties: number) {
  async swap(swap: Swap) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(this.contract)
        .then((c: any) => c.methodsObject.swap(
          swap
          )
          .send({ amount: 0 })
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


  async collect(swapId: number, swapAmount: number) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(this.contract)
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

  async addMembers(coop_address: string, address_list: string[]) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(coop_address)
        .then((c: any) => c.methods.add_members(
          address_list
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

  async changeCoopShare(coopAddress: string, newCoopShare: number) {

    this.taquito.setProvider({ wallet: this.wallet });

    try {
      return await this.taquito.wallet.at(coopAddress)
        .then((c: any) => c.methods.change_coop_share(
          newCoopShare
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


  // async sendFunds(address: string, amount: number) {

  //   this.taquito.setProvider({ wallet: this.wallet });

  //   try {
  //     return await this.taquito.wallet.at(address)
  //       .then((c: any) => c.methods.send_funds()
  //         .send({ amount: amount })
  //     ).then((op: any) => {
  //       return op.confirmation(this.numBlocks).then(() => {
  //         return [false, 'success']
  //       })
  //     })
  //   } catch (e) {
  //     const fail = true
  //     return [fail, e]
  //   }
  // }


  // async closeCampaign(address: string) {

  //   this.taquito.setProvider({ wallet: this.wallet });

  //   try {
  //     return await this.taquito.wallet.at(address)
  //       .then((c: any) => c.methods.close_campaign()
  //         .send()
  //     ).then((op: any) => {
  //       return op.confirmation(this.numBlocks).then(() => {
  //         return [false, 'success']
  //       })
  //     })
  //   } catch (e) {
  //     const fail = true
  //     return [fail, e]
  //   }
  // }
 
}
