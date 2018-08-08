import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { Parameters } from '@pvz/core/models/parameters.model';
import { Observable } from 'rxjs/Observable';

import { combineLatest, filter, map } from 'rxjs/operators';

import { Process } from '@pvz/core/models/process.model';
import * as processes from '@pvz/core/actions/process.actions';
import * as fromCore from '@pvz/core/reducers';

@Component({
  selector: 'pvz-process-page',
  templateUrl: './process-page.component.html',
  styleUrls: ['./process-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProcessPageComponent implements OnInit {

  process$: Observable<Process>;
  status$: Observable<string>;
  log$: Observable<string[]>;
  parameters$: Observable<Parameters>;
  alleles$: Observable<string[]>;
  epitope_lengths$: Observable<number[]>;
  prediction_algorithms$: Observable<string[]>;

  constructor(private store: Store<fromCore.State>) {
    this.process$ = store.pipe(select(fromCore.getSelectedProcess));
    this.status$ = this.process$.pipe(filter(val => !!val), map((process) => {
      return process.running ? 'Running' : process.status === 1 ? 'Completed' : 'Stopped';
    }));
    this.parameters$ = this.process$.pipe(filter(val => !!val), map(process => process.parameters));
    this.log$ = this.process$.pipe(filter(val => !!val), map(process => process.log));
    this.alleles$ = this.parameters$.pipe(filter(val => !!val), map(params => params.alleles));
    this.epitope_lengths$ = this.parameters$.pipe(filter(val => !!val), map(params => params.epitope_lengths));
    this.prediction_algorithms$ = this.parameters$.pipe(filter(val => !!val), map(params => params.prediction_algorithms));
  }

  ngOnInit() {
    this.store.dispatch(new processes.LoadDetail());
  }

  reload() {
    this.store.dispatch(new processes.LoadDetail());
  }

  archive() {
    this.store.dispatch(new processes.Archive());
  }

  restart() {
    console.log('restart process');
  }
}
