import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import * as fromLayout from './layout.reducer';
import * as fromProcesses from './processes.reducer';

import { map, filter } from 'lodash-es';

export interface CoreState {
  layout: fromLayout.State;
  processes: fromProcesses.State;
}

export interface State extends fromRoot.State {
  core: CoreState;
}

export const reducers = {
  layout: fromLayout.reducer,
  processes: fromProcesses.reducer
}

/**
 * A selector function is a map function factory. We pass it parameters and it
 * returns a function that maps from the larger state tree into a smaller
 * piece of state. This selector simply selects the `processes` state.
 *
 * Selectors are used with the `select` operator.
 *
 * ```ts
 * class MyComponent {
 *   constructor(state$: Observable<State>) {
 *     this.processeState$ = state$.pipe(select(getProcesseState));
 *   }
 * }
 * ```
 */

/**LayoutActions
 * The createFeatureSelector function selects a piece of state from the root of the state object.
 * This is used for selecting feature states that are loaded eagerly or lazily.
 */

export const getCoreState = createFeatureSelector<CoreState>('core');

export const getCollapsed = createSelector(
  getCoreState,
  core => core.layout.collapsed
);

/**
 * Every reducer module exports selector functions, however child reducers
 * have no knowledge of the overall state tree. To make them usable, we
 * need to make new selectors that wrap them.
 *
 * The createSelector function creates very efficient selectors that are memoized and
 * only recompute when arguments change. The created selectors can also be composed
 * together to select different pieces of state.
 */
export const getProcessesState = createSelector(
  getCoreState,
  core => core.processes
);

/**
 * Adapters created with @ngrx/entity generate
 * commonly used selector functions including
 * getting all ids in the record set, a dictionary
 * of the records by id, an array of records and
 * the total number of records. This reduces boilerplate
 * in selecting records from the entity state.
 */
export const {
  selectEntities: getProcesses,
  selectAll: getAllProcesses,
} = fromProcesses.adapter.getSelectors(getProcessesState);

export const getApiProcessesMeta = createSelector(
  getCoreState,
  core => core.processes.meta
)

export const getRouteProcessId = createSelector(
  fromRoot.getRouterState,
  router => router.state.params.processId
)

export const getSelectedProcess = createSelector(
  getProcesses,
  getRouteProcessId,
  (processes, processId) => { return processes[processId]; }
);

export const getProcessesWithVisualizableFiles = createSelector(
  getAllProcesses,
  (processes) => {
    return map(processes)
      .filter((proc) => {
        const vizFiles = filter(proc.files, (file) => {
          return (file.display_name.includes('final\.tsv') || file.display_name.includes('combined\.parsed\.tsv'));
        });
        return vizFiles.length > 0;
        // console.log('proc!');
        // return filter(proc.files, (file) => {
        //   return (file.display_name.includes('final\.tsv') || file.display_name.includes('combined\.parsed\.tsv' ));
        // }) > 0;
      });
  })
