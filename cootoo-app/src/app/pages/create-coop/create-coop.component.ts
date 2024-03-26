import { Component } from '@angular/core';
import { TaquitoService } from 'src/app/services/taquito.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Coop } from 'src/app/models/coop.model';
// import { IpfsService } from 'src/app/services/ipfs.service';

@Component({
  selector: 'app-create-coop',
  templateUrl: './create-coop.component.html',
  styleUrls: ['./create-coop.component.scss']
})

export class CreateCoopComponent {

  form = this.fb.group({
    coop_share: new FormControl<number>(0, Validators.required),
    members: this.fb.array([]),
    name: new FormControl<string>(""),
    description: new FormControl<string>(""),
    image: new FormControl<string>(""),
    tez_limit: new FormControl<number>(0, Validators.required),
    // tags: this.fb.array([])
  });

  // public title: string = ""
  // public description: string = ""
  

  public uploadedFileResult:  string | ArrayBuffer | null = ""
  public uploadedFile!: File
  // private fileList = []
  // private fileSize: number

  private fileHash: string = ""
  private metadataHash: string = ""

  formValue: Coop = new Coop()

  constructor(
    private taquito: TaquitoService,
    private router: Router,
    private fb: FormBuilder,
    // private ipfs: IpfsService
  ){
    this.form.valueChanges.subscribe(_ => {
      this.formValue = this.form.value as Coop;
    });

    this.addMember()
  }

  get members() {
    return this.form.controls["members"] as FormArray;
  }


  addMember() {
    const memberForm = this.fb.group({
        address: ['', Validators.required]
    });
  
    this.members.push(memberForm);
  }

  deleteMember(memberIndex: number) {
    this.members.removeAt(memberIndex);
  }


  onFileUpload(e: any) {
    
    console.log(e.target.files)

    if (e.target) {
      this.uploadedFile = e.target.files[0]
    }
    

    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      // console.log(fileReader.result);
      this.uploadedFileResult = fileReader.result
      console.log(typeof this.uploadedFileResult)
    }
    fileReader.readAsText(this.uploadedFile);
    // fileReader.readAsArrayBuffer(this.uploadedFile)

    // this.ipfs.testAuthentication()
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
      console.log(this.formValue)
      const coop_share = 10 * this.formValue.coop_share
      const tezLimit = 10 * this.formValue.tez_limit
      const members: string[] = []
      this.members.value.forEach((member:any) => members.push(member.address))
      console.log(members)

      // let url = this.formValue.url;
      // if (url && url.indexOf('://') === -1) {
      //   url = `https://${url}`;
      // }
      // const finalUrl = url ? new URL(url).href : ''

      // METADATA
      // const file = this.uploadedFile

      // if (!file){
      //   console.log('Please insert a file')
      //   // this.dialogService.open(dialog, { context: 'Please insert a file' });
      //   return
      // }

      // // checks file size limit of 40MB
      // const filesize_float = (file.size / 1024 / 1024)
      
      // if (filesize_float < 40) {

      // await this.ipfs.pinFileToIPFS(file).then((data: any) => {
      //   this.fileHash = data['IpfsHash'];
      // })

      // const fileCid = `ipfs://${this.fileHash}`
      // console.log(this.fileHash)
      // console.log(fileCid)

      const jsonMeta = ({
        name: this.formValue.name,
        description: this.formValue.description, 
        image: this.formValue.image,
        // tags: this.formValue.tags,
        // artifactUri: fileCid,
        source: {
          "tools": ["SmartPy"],
          "location": "https://github.com/STATELESSART/Tezos/blob/main/smartpy_contract.py"
        }
      })

      console.log(jsonMeta)

      // await this.ipfs.pinJSONToIPFS(jsonMeta).then((data: any) => {
      //   this.metadataHash = data['IpfsHash'];
      // })

      // const cid = `ipfs://${this.metadataHash}`
      // console.log(this.metadataHash)
      // console.log(cid)

      await this.taquito.createCoop(coop_share, members, JSON.stringify(jsonMeta), tezLimit).then(data => {
        data.subscribe(async (originatedAddress: string | object) => {
          // success
          if (typeof originatedAddress == 'string') {
            // this.closeDialog(loadingDialog)
            this.router.navigate(['coop/' + originatedAddress])
          } else {
            const message = JSON.stringify(originatedAddress)
            console.log(message)
            // this.closeDialog(loadingDialog)
            // this.openDialog(true, false, message, false)
          }
        })
      })
      
    // } else {
    //   alert(`File too big (${filesize_float.toFixed(4)}). Limit is currently set at 40MB`)
    // }

      

    })
  }

}
