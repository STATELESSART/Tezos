import { Component, OnInit } from '@angular/core';
import { TzktService } from 'src/app/services/tzkt.service';
import { Coop } from 'src/app/models/coop.model';
import { TaquitoService } from 'src/app/services/taquito.service';
import { Observable, map, of } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Swap, SwapParam } from 'src/app/models/swap.model';
import { Nft } from 'src/app/models/nft.model';
import { IndexerService } from 'src/app/services/indexer.service';

@Component({
  selector: 'app-swap-nft',
  templateUrl: './swap-nft.component.html',
  styleUrls: ['./swap-nft.component.scss']
})
export class SwapNftComponent implements OnInit {

  form = new FormGroup({
    coop_address: new FormControl<string>('', Validators.required),
    creator: new FormControl<string>(''),
    fa2_address: new FormControl<string>(''), 
    objkt_id: new FormControl<number>(0), 
    objkt_amount: new FormControl<number>(0, Validators.required), 
    xtz_per_objkt: new FormControl<number>(0, Validators.required),
    royalties: new FormControl<number>(0, Validators.required),
  });

  formValue: SwapParam = new SwapParam()

  constructor(
    private tzkt: TzktService,
    private taquito: TaquitoService,
    private route: ActivatedRoute,
    private indexer: IndexerService
    // public router: Router,
  ){
    this.form.valueChanges.subscribe(_ => {
      this.formValue = this.form.value as SwapParam;
    });
  }

  coopsAddress: string[] = []
  // nft: Nft = new Nft()

  nft: Observable<Nft> = of(new Nft())
  swapParam: SwapParam = new SwapParam()


  async ngOnInit() {

    this.route.params.subscribe(async (params: Params) => {    

      (await this.getNft(params['fa2_address'], params['objkt_id'])).subscribe(nft => {
        this.swapParam.objkt_id = parseInt(params['objkt_id']);
        this.swapParam.fa2_address = params['fa2_address'];
        this.swapParam.creator = nft.creator.address;
        console.log(this.swapParam)
      })
      
    });
    
    // get coops which the user belongs to
    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      if (accountInfo) {
        const address = accountInfo.address;

        (await this.indexer.getMemberCoops(address)).subscribe(memberCoops => {
          memberCoops.forEach(member => {
            this.coopsAddress.push(member.coop.address)
          });
        })
      }

    });


  }


  swap() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      if (accountInfo) {
        const address = accountInfo.address
      
        // const loadingDialog = this.openDialog(false, false, '', true)

        // const swap = this.formValue
        this.swapParam.coop_address = this.formValue.coop_address
        // const creator = this.formValue.creator
        // const fa2_address = this.formValue.fa2_address
        // const objkt_id = this.formValue.objkt_id
        this.swapParam.objkt_amount = this.formValue.objkt_amount
        this.swapParam.xtz_per_objkt = 1000000 * this.formValue.xtz_per_objkt
        this.swapParam.royalties = 10 * this.formValue.royalties

        await this.taquito.swapv2(this.swapParam, address).then(([fail, errorMessage]) => {
          if (!fail) {
            const dialogMessage = 'swap success'
            console.log(dialogMessage)
            // this.successDialog(loadingDialog, dialogMessage)
          } else {
            console.log(errorMessage)
            // this.failDialog(loadingDialog, errorMessage)
          }
        })

        // await this.taquito.updateOperatorFA2(this.swapParam, address).then(([fail, errorMessage]) => {
        //   if (!fail) {
        //     const dialogMessage = 'Update operator success'
        //     console.log(dialogMessage)
        //     // this.successDialog(loadingDialog, dialogMessage)
        //   } else {
        //     console.log(errorMessage)
        //     // this.failDialog(loadingDialog, errorMessage)
        //   }
        // })

        // await this.taquito.swap(this.swapParam).then(([fail, errorMessage]) => {
        //   if (!fail) {
        //     const dialogMessage = 'Sucess swap'
        //     console.log(dialogMessage)
        //     // this.successDialog(loadingDialog, dialogMessage)
        //   } else {
        //     console.log(errorMessage)
        //     // this.failDialog(loadingDialog, errorMessage)
        //   }
        // })

      }

      

    })
  }

  async getNft(fa2_address: string, objkt_id: number) {
    // (await this.tzkt.getNft(fa2_address, objkt_id)).subscribe(nft => {
    //   console.log(nft)
    //   this.nft = nft
    // })

    // TODO: fetch from indexer first?
    return this.nft = (await this.tzkt.getNft(fa2_address, objkt_id))
  }


}
