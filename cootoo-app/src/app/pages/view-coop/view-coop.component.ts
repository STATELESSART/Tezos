import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Coop, Member } from 'src/app/models/coop.model';
import { Nft } from 'src/app/models/nft.model';
import { TaquitoService } from 'src/app/services/taquito.service';
import { TzktService } from 'src/app/services/tzkt.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl, FormBuilder, FormArray } from '@angular/forms';


@Component({
  selector: 'app-view-coop',
  templateUrl: './view-coop.component.html',
  styleUrls: ['./view-coop.component.scss']
})
export class ViewCoopComponent implements OnInit {

  form = new FormGroup({
    members: this.fb.array([])
  });

  formValue: Member[] = []

  coop: Coop = new Coop()
  coopNfts: Nft[] = []

  constructor(
    private route: ActivatedRoute,
    private tzkt: TzktService,
    private taquito: TaquitoService,
    private fb: FormBuilder
  ){
    this.form.valueChanges.subscribe(_ => {
      this.formValue = this.form.value.members as Member[];
    });
  }


  get members() {
    return this.form.controls["members"] as FormArray;
  }


  addMemberForm() {
    const memberForm = this.fb.group({
        address: ['', Validators.required]
    });
  
    this.members.push(memberForm);
  }

  deleteMember(memberIndex: number) {
    this.members.removeAt(memberIndex);
  }


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

    this.addMemberForm()

  }


  addMembers() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      const members_form = this.formValue
      const members: string[] = []
      members_form.forEach(member => members.push(member.address))
      
      console.log(members_form)

      if (members.length > 0) {

        await this.taquito.addMembers(this.coop.contract, members).then(([fail, errorMessage]) => {
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
