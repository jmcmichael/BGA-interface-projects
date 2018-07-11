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
import { DropboxService } from '../../core/services/dropbox.service';
import { ProcessService } from '../../core/services/process.service';
import {
  DropboxActionTypes,
  DropboxActions,
  Load,
  LoadSuccess,
  LoadFail
} from '../actions/dropbox.actions';
import { ApiDropboxResponse } from '../../core/models/api-responses.model';

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
export class DropboxEffects {
  constructor(
    private actions$: Actions,
    private dropbox: DropboxService,
  ) { }

  @Effect()
  search$: Observable<Action> = this.actions$.pipe(
    ofType<Load>(DropboxActionTypes.Load),
    switchMap(action => {
      return this.dropbox
        .query()
        .pipe(
          map((files: Files) => new LoadSuccess(files)),
          catchError(err => of(new LoadFail(err)))
        );
    })
  );
}
