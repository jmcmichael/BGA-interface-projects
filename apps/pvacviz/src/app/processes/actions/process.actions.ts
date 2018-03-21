import { Action } from '@ngrx/store';
import { Process } from '../models/process.model';

export enum ProcessActionTypes {
  Load = '[Process] Load',
  LoadSuccess = '[Process] Load Success',
  LoadFail = '[Process] Load Fail',
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

  constructor(public id: number) { }
}

export class LoadSuccess implements Action {
  readonly type = ProcessActionTypes.LoadSuccess;

  constructor(public payload: Process) { }
}

export class LoadFail implements Action {
  readonly type = ProcessActionTypes.LoadFail;

  constructor(public payload: any) { }
}


/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type ProcessActions = Load | LoadSuccess | LoadFail;