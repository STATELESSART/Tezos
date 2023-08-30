export class Coop {
    contract!: string;
    coop_share!: number;
    manager!: string;
    members!: Member[];
    proposed_manager!: string;
  } 


  export class Member {
    address!: string
  }