export class Profile {
    address: string;
    twitterURL: string ='';
    alias: string = '';
    description: string = '';
    website: string = '';
    logoURL: string = '';
    ethAddress: string = '';
    exists: boolean = false;
    githubURL: string = '';

    constructor(address: string)  {
      this.address = address;
     }
  }