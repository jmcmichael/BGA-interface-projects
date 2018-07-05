import { Action } from '@ngrx/store';
import { Process } from '../models/process.model';
import { ApiProcessesResponse } from '../models/api-responses.model';

export enum ProcessActionTypes {
  Load = '[Processes] Load Processes',
  LoadSuccess = '[Processes] Load Processes Success',
  LoadFail = '[Processes] Load Processes Fail',

  Remove = '[Processes] Remove Process',

  LoadDetail = '[Processes] Load Process Detail',
  LoadDetailSuccess = '[Processes] Load Process Detail Success',
  LoadDetailFail = '[Processes] Load Process Detail Fail',

  Archive = '[Processes] Archive Process',
  ArchiveSuccess = '[Processes] Archive Process Success',
  ArchiveFail = '[Processes] Archive Process Fail'
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class Load implements Action {
  readonly type = ProcessActionTypes.Load;

  constructor() { }
}

export class LoadSuccess implements Action {
  readonly type = ProcessActionTypes.LoadSuccess;

  constructor(public payload: ApiProcessesResponse) { }
}

export class LoadFail implements Action {
  readonly type = ProcessActionTypes.LoadFail;

  constructor(public payload: any) { }
}

export class Remove implements Action {
  readonly type = ProcessActionTypes.Remove;

  constructor(public payload: number) { }
}

export class LoadDetail implements Action {
  readonly type = ProcessActionTypes.LoadDetail;

  constructor() { }
}

export class LoadDetailSuccess implements Action {
  readonly type = ProcessActionTypes.LoadDetailSuccess;

  constructor(public payload: Process) { }
}

export class LoadDetailFail implements Action {
  readonly type = ProcessActionTypes.LoadDetailFail;

  constructor(public payload: any) { }
}

export class Archive implements Action {
  readonly type = ProcessActionTypes.Archive;

  constructor(public payload?: number) { }
}

export class ArchiveSuccess implements Action {
  readonly type = ProcessActionTypes.ArchiveSuccess;

  constructor(public payload: { id: number, message: any }) { }
}

export class ArchiveFail implements Action {
  readonly type = ProcessActionTypes.ArchiveFail;

  constructor(public payload: any) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type ProcessActions =
  Load | LoadSuccess | LoadFail | Remove
  | LoadDetail | LoadDetailSuccess | LoadDetailFail
  | Archive | ArchiveSuccess | ArchiveFail;
