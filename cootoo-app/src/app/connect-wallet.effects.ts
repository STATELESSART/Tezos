import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { switchMap } from 'rxjs/operators'
import * as actions from './connect-wallet.actions'
import { TaquitoService } from './services/taquito.service'

@Injectable()
export class ConnectWalletEffects {

  constructor(private actions$: Actions,
              private readonly taquito: TaquitoService) {}

  setupBeacon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.setupBeacon),
      switchMap(() => {
        return this.taquito
          .setupBeaconWallet()
          .then((accountInfo) => {
            if (accountInfo !== undefined) {
              return actions.connectWalletSuccess({ accountInfo })
            } else {
              return actions.setupBeaconSuccess()
            }
          })
          .catch((error) => actions.connectWalletFailure({ error }))
      })
    )
  )

  connectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.connectWallet),
      switchMap(() => {
        return this.taquito
          .requestPermission()
          .then((accountInfo) => actions.connectWalletSuccess({ accountInfo }))
          .catch((error) => actions.connectWalletFailure({ error }))
      })
    )
  )

  disconnectWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.disconnectWallet),
      switchMap(() => {
        return this.taquito
          .reset()
          .then(() => actions.disconnectWalletSuccess())
          .catch((error) => actions.disconnectWalletFailure({ error }))
      })
    )
  )
}
