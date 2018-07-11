import { Action } from '@ngrx/store';
import { File } from '../models/file.model';

export enum DropboxActionTypes {
  Load = '[Dropboxes] Load Dropbox Files',
  LoadSuccess = '[Dropboxes] Load Dropbox Files Success',
  LoadFail = '[Dropboxes] Load Dropbox Files Fail',
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class Load implements Action {
  readonly type = DropboxActionTypes.Load;

  constructor() { }
}

export class LoadSuccess implements Action {
  readonly type = DropboxActionTypes.LoadSuccess;

  constructor(public payload: File[]) { }
}

export class LoadFail implements Action {
  readonly type = DropboxActionTypes.LoadFail;

  constructor(public payload: any) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type DropboxActions =
  Load | LoadSuccess | LoadFail;
