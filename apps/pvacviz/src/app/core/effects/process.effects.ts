import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { async } from 'rxjs/scheduler/async';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import {
  map,
  switchMap,
  catchError,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import { Process } from '../models/process.model';
import { ApiProcessesResponse } from '../models/api-responses.model';
import { ProcessService } from '../services/process.service';


import {
  ProcessActionTypes,
  ProcessActions,
  Load,
  LoadSuccess,
  LoadFail,
  Remove,
  LoadDetail,
  LoadDetailSuccess,
  LoadDetailFail,
  Archive,
  ArchiveSuccess,
  ArchiveFail
} from '../actions/process.actions';

import * as fromRoot from '../../reducers';
import { Store, select } from '@ngrx/store';

/**
 * Effects offer a way to isolate and easily test side-effects within your
 * application.
 *
 * If you are unfamiliar with the operators being used in these examples, please
 * check out the sources below:
 *
 * Official Docs: http://reactivex.io/rxjs/manual/overview.html#categories-of-operators
 * RxJS 5 Operators By Example: https://gist.github.com/btroncone/d6cf141d6f2c00dc6b35
 */

@Injectable()
export class ProcessEffects {
  constructor(
    private actions$: Actions,
    private processes: ProcessService,
    private store: Store<fromRoot.State>
  ) { }

  @Effect()
  query$: Observable<Action> = this.actions$.pipe(
    ofType<Load>(ProcessActionTypes.Load),
    switchMap(query => {
      return this.processes
        .query()
        .pipe(
          map((result: ApiProcessesResponse) => new LoadSuccess(result)),
          catchError(err => of(new LoadFail(err)))
        );
    })
  );

  @Effect()
  get$: Observable<Action> = this.actions$.pipe(
    ofType<LoadDetail>(ProcessActionTypes.LoadDetail),
    withLatestFrom(
      this.store.select(fromRoot.getRouterState),
      (action, router) => {
        return router.state.params.processId
      }
    ),
    switchMap(processId => {
      return this.processes
        .get(processId)
        .pipe(
          map((process: Process) => {
            return new LoadDetailSuccess(process)
          }),
          catchError(err => of(new LoadDetailFail(err)))
        )
    })
  )

  // if action payload contains a processId, it is used
  // otherwise the router state processId is used.
  @Effect()
  archive$: Observable<Action> = this.actions$.pipe(
    ofType<Archive>(ProcessActionTypes.Archive),
    withLatestFrom(
      this.store.select(fromRoot.getRouterState),
      (action, router) => {
        return [action.payload, router.state.params.processId]
      }
    ),
    switchMap((processIds) => {
      const payloadProcessId = processIds[0];
      const routeProcessId = processIds[1];
      const processId = payloadProcessId ? payloadProcessId : routeProcessId;

      return this.processes
        .archive(processId)
        .pipe(
          map((message: string) => {
            return new ArchiveSuccess({ id: processId, message: message })
          }),
          catchError(err => of(new ArchiveFail(err)))
        )
    })
  );

  // TODO see if this is the idiomatic way of chaining actions after a successful call.
  // I have a feeling that effects requiring a subsequent refresh should dispatch the
  // action themselves (e.g. archive$ effect). See:
  // https://github.com/ngrx/platform/issues/468
  // https://stackoverflow.com/questions/47554267/dispatch-multiple-action-from-one-effect
  @Effect()
  requery$: Observable<Action> = this.actions$.pipe(
    ofType<ArchiveSuccess>(ProcessActionTypes.ArchiveSuccess),
    switchMap((action) => {
      return of(new Remove(action.payload.id))
    })
  );

}
