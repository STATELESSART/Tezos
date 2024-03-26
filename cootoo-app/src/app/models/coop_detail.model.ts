
import { Coop } from "./coop.model";
import { Swap, SwapParam } from "./swap.model";

export class CoopDetail extends Coop {
  swaps: SwapParam[] = []

}

export class RestResponseDetail {
  coop: CoopDetail[] = []
} 