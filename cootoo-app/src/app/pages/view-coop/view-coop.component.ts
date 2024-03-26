import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Coop, Member } from 'src/app/models/coop.model';
import { Nft } from 'src/app/models/nft.model';
import { TaquitoService } from 'src/app/services/taquito.service';
import { TzktService } from 'src/app/services/tzkt.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl, FormBuilder, FormArray } from '@angular/forms';
// import { IndexerService } from 'src/app/services/indexer.service';
import { Observable, map, of } from 'rxjs'
import { CoopDetail } from 'src/app/models/coop_detail.model';

@Component({
  selector: 'app-view-coop',
  templateUrl: './view-coop.component.html',
  styleUrls: ['./view-coop.component.scss']
})
export class ViewCoopComponent implements OnInit {

  form = new FormGroup({
    members: this.fb.array([])
  });

  deleteForm = new FormGroup({
    memberAddress: new FormControl<string>('', Validators.required)
  });

  formValue: Member[] = []
  deleteFormValue: string = ''

  
  coop: CoopDetail = new CoopDetail
  // coopNfts: Nft[] = []
  coopAddress: string = ''

  constructor(
    private route: ActivatedRoute,
    private tzkt: TzktService,
    private taquito: TaquitoService,
    private fb: FormBuilder,
    // private indexer: IndexerService
  ){
    this.form.valueChanges.subscribe(_ => {
      this.formValue = this.form.value.members as Member[];
    });

    this.deleteForm.valueChanges.subscribe(_ => {
      this.deleteFormValue = this.deleteForm.value.memberAddress as string;
    });
  }


  get members() {
    return this.form.controls["members"] as FormArray;
  }


  addMemberToForm() {
    const memberForm = this.fb.group({
        address: ['', Validators.required]
    });
  
    this.members.push(memberForm);
  }

  deleteMemberFromForm(memberIndex: number) {
    this.members.removeAt(memberIndex);
  }


  ngOnInit() {

    this.route.params.subscribe(async (params: Params) => {
      this.coopAddress = params['id'];

      (this.tzkt.getCoopDetail(params['id'])).subscribe(coop => {
        console.log(coop)
        this.coop = coop
      })
      
      // pipe(
      //   map(coop => {
      //   console.log(coop)
      //   // coop.then(coop => {
      //   //   coop.subscribe(coop => {
      //   //     this.coop = coop
      //   //     console.log(this.coop)
      //   //   })
          
      //   // })
        
      // }))
      
      // .subscribe(coop => {
      //   if (coop) {
      //     this.coop = coop
      //   }
      //   console.log(coop)
        
      // });

      // (await this.tzkt.getCoopNfts(this.coop.address)).subscribe(nfts => {
      //     this.coopNfts = nfts
      // })
    });

    this.addMemberToForm()

  }


  addMembers() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      const membersForm = this.formValue
      const members: string[] = []
      membersForm.forEach(member => members.push(member.address))
      
      console.log(membersForm)

      if (members.length > 0) {

        await this.taquito.addMembers(this.coopAddress, members).then(([fail, errorMessage]) => {
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


  deleteMember() {

    this.taquito.accountInfo$.subscribe(async accountInfo => {
      if (!accountInfo) {
        accountInfo = await this.taquito.requestPermission()
      }

      const address = this.deleteFormValue
       

      await this.taquito.deleteMember(this.coopAddress, address).then(([fail, errorMessage]) => {
        if (!fail) {
          const dialogMessage = 'Sucess add'
          console.log(dialogMessage)
          // this.successDialog(loadingDialog, dialogMessage)
        } else {
          console.log(errorMessage)
          // this.failDialog(loadingDialog, errorMessage)
        }
      })
      
    })

  }



}
