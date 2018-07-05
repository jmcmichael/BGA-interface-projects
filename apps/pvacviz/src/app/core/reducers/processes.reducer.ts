import { createSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import 'rxjs/add/observable/of';
import { Process } from '../models/process.model';
import { ProcessActions, ProcessActionTypes } from '../actions/process.actions';

import { ApiMeta } from '../models/api-responses.model';

/**
 * @ngrx/entity provides a predefined interface for handling
 * a structured dictionary of records. This interface
 * includes an array of ids, and a dictionary of the provided
 * model type by id. This interface is then extended to include
 * any additional interface properties.
 */
export interface State extends EntityState<Process> {
  loading: boolean;
  loaded: boolean;
  error: string;
  meta: ApiMeta;
}

/**
 * createEntityAdapter creates many an object of helper
 * functions for single or multiple operations
 * against the dictionary of records. The configuration
 * object takes a record id selector function and
 * a sortComparer option which is set to a compare
 * function if the records are to be sorted.
 */
export const adapter: EntityAdapter<Process> = createEntityAdapter<Process>({
  selectId: (process: Process) => process.id,
  sortComparer: false,
});

/**
 * getInitialState returns the default initial state
 * for the generated entity state. Initial state
 * additional properties can also be defined.
 */
export const initialState: State = adapter.getInitialState({
  loading: false,
  loaded: false,
  meta: null,
  error: ''
});

export function reducer(state = initialState, action: ProcessActions): State {
  switch (action.type) {

    case ProcessActionTypes.Load:
      return {
        ...state,
        loading: true,
      };

    case ProcessActionTypes.LoadSuccess:
      return {
        /**
         * The addMany function provided by the created adapter
         * adds many records to the entity dictionary
         * and returns a new state including those records. If
         * the collection is to be sorted, the adapter will
         * sort each record upon entry into the sorted array.
         */
        ...adapter.addMany(action.payload.result, state),
        loading: false,
        loaded: true,
        meta: action.payload._meta
      };

    case ProcessActionTypes.LoadFail:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.payload
      }

    case ProcessActionTypes.Remove:
      return adapter.removeOne(action.payload, state);

    case ProcessActionTypes.LoadDetail:
      return {
        ...state,
        loading: true,
      };

    case ProcessActionTypes.LoadDetailSuccess:
      return {
        ...adapter.upsertOne({ id: action.payload.id, changes: action.payload }, state),
        loading: false,
        loaded: true
      };

    case ProcessActionTypes.LoadDetailFail:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.payload
      }
    default:
      return state;
  }
}
