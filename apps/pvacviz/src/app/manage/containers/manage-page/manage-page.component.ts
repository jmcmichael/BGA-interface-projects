import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { filter, map } from 'rxjs/operators';

import { Process } from '../../../core/models/process.model';
import { ApiMeta } from '../../../core/models/api-responses.model';
import * as processes from '../../../core/actions/process.actions';
import * as fromCore from '../../../core/reducers';

@Component({
  selector: 'pvz-manage-page',
  templateUrl: './manage-page.component.html',
  styleUrls: ['./manage-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ManagePageComponent implements OnInit {

  processes$: Observable<Process[]>;
  processesMeta$: Observable<ApiMeta>;
  inputFiles$: Observable<string[]>;

  constructor(private store: Store<fromCore.State>) {
    this.processes$ = store.pipe(select(fromCore.getAllProcesses));
    this.processesMeta$ = store.pipe(select(fromCore.getApiProcessesMeta))
    this.inputFiles$ = this.processes$.pipe(filter(val => !!val), map(
      (processes) => {
        return processes.map((process) => {
          return process.parameters.input
            .split('/')
            .slice(-2)
            .join('/');
        })
      }
    ))
  }

  ngOnInit() {
    this.store.dispatch(new processes.Load());
  }

  reload() {
    this.store.dispatch(new processes.Load());
  }

  archive(id) {
    this.store.dispatch(new processes.Archive(id));
  }
}
