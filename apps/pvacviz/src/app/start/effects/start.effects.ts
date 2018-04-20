import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { async } from 'rxjs/scheduler/async';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import {
  debounceTime,
  map,
  switchMap,
  skip,
  takeUntil,
  catchError,
} from 'rxjs/operators';

import { File, Files } from '../../core/models/file.model';
import { InputService } from '../../core/services/inputs.service';
import { ProcessService } from '../../core/services/process.service';
import {
  StartActionTypes,
  StartActions,
  LoadInputs,
  LoadInputsSuccess,
  LoadInputsFail,
  StartProcess,
  StartProcessSuccess,
  StartProcessFail
} from '../actions/start.actions';
import { ApiStartResponse } from '../../core/models/api-responses.model';

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
export class StartEffects {
  constructor(
    private actions$: Actions,
    private inputs: InputService,
    private processes: ProcessService
  ) { }

  @Effect()
  search$: Observable<Action> = this.actions$.pipe(
    ofType<LoadInputs>(StartActionTypes.LoadInputs),
    switchMap(action => {
      return this.inputs
        .query()
        .pipe(
          map((files: Files) => new LoadInputsSuccess(files)),
          catchError(err => of(new LoadInputsFail(err)))
        );
    })
  );

  @Effect()
  start$: Observable<Action> = this.actions$.pipe(
    ofType<StartProcess>(StartActionTypes.StartProcess),
    switchMap(action => {
      return this.processes
        .start(action.payload)
        .pipe(
          map((response: ApiStartResponse) => new StartProcessSuccess(response.processid)),
          catchError(err => of(new StartProcessFail(err)))
        );
    })
  );
}
