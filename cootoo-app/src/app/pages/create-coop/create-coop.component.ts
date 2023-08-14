import { Component } from '@angular/core';
import { TaquitoService } from 'src/app/services/taquito.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Coop } from 'src/app/models/coop.model';

@Component({
  selector: 'app-create-coop',
  templateUrl: './create-coop.component.html',
  styleUrls: ['./create-coop.component.scss']
})

export class CreateCoopComponent {

  form = new FormGroup({
    coop_share: new FormControl<number>(0, Validators.required)
  });

  formValue: Coop = new Coop()

  constructor(
    private taquito: TaquitoService,
    public router: Router,
  ){
    this.form.valueChanges.subscribe(_ => {
      this.formValue = this.form.value as Coop;
    });
  }


  createCoop() {

    this.taquito.accountInfo$.subscribe(async (accountInfo) => {
      if (!accountInfo) {
        await this.taquito.requestPermission()
      }

      // const loadingDialog = this.openDialog(false, false, '', true)

      // const goal = this.formValue.goal * 1000000
      // const title = this.formValue.title
      // const description = this.formValue.description
      // const ascii = this.asciiText
      // const category = this.formValue.category
      const coopShare = 10 * this.formValue.coop_share

      // let url = this.formValue.url;
      // if (url && url.indexOf('://') === -1) {
      //   url = `https://${url}`;
      // }
      // const finalUrl = url ? new URL(url).href : ''

      await this.taquito.createCoop(coopShare).then(data => {
        data.subscribe(async (originatedAddress: string | object) => {
          // success
          if (typeof originatedAddress == 'string') {
            // this.closeDialog(loadingDialog)
            this.router.navigate(['view/' + originatedAddress])
          } else {
            const message = JSON.stringify(originatedAddress)
            console.log(message)
            // this.closeDialog(loadingDialog)
            // this.openDialog(true, false, message, false)
          }
        })
      })

    })
  }

}
