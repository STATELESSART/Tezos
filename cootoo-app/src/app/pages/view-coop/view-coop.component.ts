import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Coop } from 'src/app/models/coop.model';
import { Nft } from 'src/app/models/nft.model';
import { TaquitoService } from 'src/app/services/taquito.service';
import { TzktService } from 'src/app/services/tzkt.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';


@Component({
  selector: 'app-view-coop',
  templateUrl: './view-coop.component.html',
  styleUrls: ['./view-coop.component.scss']
})
export class ViewCoopComponent implements OnInit {

  form = new FormGroup({
    member_address: new FormControl<string>('', Validators.required)
  });

  coop: Coop = new Coop()
  coopNfts: Nft[] = []

  constructor(
    private route: ActivatedRoute,
    private tzkt: TzktService,
    private taquito: TaquitoService
  ){}

  async ngOnInit() {

    this.route.params.subscribe(async (params: Params) => {
      this.coop.contract = params['id'];

      (await this.tzkt.getCoop(this.coop.contract)).subscribe(coop => {
        this.coop = coop
      });

      (await this.tzkt.getCoopNfts(this.coop.contract)).subscribe(nfts => {
          this.coopNfts = nfts
      })
    });

  }


  addMember() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      const member_address = this.form.value.member_address
      
      if (member_address) {
        

        await this.taquito.addMember(this.coop.contract, member_address).then(([fail, errorMessage]) => {
          if (!fail) {
            const dialogMessage = 'Sucess add'
            console.log(dialogMessage)
            // this.successDialog(loadingDialog, dialogMessage)
          } else {
            console.log(errorMessage)
            // this.failDialog(loadingDialog, errorMessage)
          }
        })

      }

      

    })

  }



}
