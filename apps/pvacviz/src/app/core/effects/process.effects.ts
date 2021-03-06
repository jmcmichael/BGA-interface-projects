import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { Action, Store, select } from '@ngrx/store';

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

import { Process } from '@pvz/core/models/process.model';
import { ProcessService } from '@pvz/core/services/process.service';
import { ApiProcessesResponse } from '@pvz/core/models/api-responses.model';
import { ApiMeta } from '@pvz/core/models/api-responses.model';
import {
  ProcessActionTypes,
  ProcessActions,
  Load,
  LoadSuccess,
  LoadFail,
  LoadDetail,
  LoadDetailSuccess,
  LoadDetailFail,
  Stop,
  StopSuccess,
  StopFail,
  Restart,
  RestartSuccess,
  RestartFail,
  Archive,
  ArchiveSuccess,
  ArchiveFail,
  Delete,
  DeleteSuccess,
  DeleteFail,
  Export,
  ExportSuccess,
  ExportFail,
  Remove
} from '@pvz/core/actions/process.actions';

import * as fromRoot from '@pvz/reducers';
import * as fromCore from '@pvz/core/reducers';

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
  processesMeta$: Observable<ApiMeta>; // paging data from processes endpoint request
  constructor(
    private actions$: Actions,
    private processes: ProcessService,
    private store: Store<fromRoot.State>
  ) {
    this.processesMeta$ = store.pipe(select(fromCore.getProcessesMeta));
  }

  @Effect()
  query$: Observable<Action> = this.actions$.pipe(
    ofType<Load>(ProcessActionTypes.Load),
    switchMap(action => {
      return this.processes
        .query(action.payload)
        .pipe(
          map((response: ApiProcessesResponse) => new LoadSuccess(response)),
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

  @Effect()
  export$: Observable<Action> = this.actions$.pipe(
    ofType<Export>(ProcessActionTypes.Export),
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
        .export(processId)
        .pipe(
          map((message: string) => {
            return new ExportSuccess({ id: processId, message: message })
          }),
          catchError(err => of(new ExportFail(err)))
        )
    })
  );

  @Effect()
  delete$: Observable<Action> = this.actions$.pipe(
    ofType<Delete>(ProcessActionTypes.Delete),
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
        .delete(processId)
        .pipe(
          map((message: string) => {
            return new DeleteSuccess({ id: processId, message: message })
          }),
          catchError(err => of(new DeleteFail(err)))
        )
    })
  );

  @Effect()
  stop$: Observable<Action> = this.actions$.pipe(
    ofType<Stop>(ProcessActionTypes.Stop),
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
        .stop(processId)
        .pipe(
          map((message: string) => {
            return new StopSuccess({ id: processId, message: message })
          }),
          catchError(err => of(new StopFail(err)))
        )
    })
  );

  @Effect()
  restart$: Observable<Action> = this.actions$.pipe(
    ofType<Restart>(ProcessActionTypes.Restart),
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
        .restart(processId)
        .pipe(
          map((message: string) => {
            return new RestartSuccess({ id: processId, message: message })
          }),
          catchError(err => of(new RestartFail(err)))
        )
    })
  );

}
