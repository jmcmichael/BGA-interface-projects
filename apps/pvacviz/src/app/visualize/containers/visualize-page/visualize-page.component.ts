import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { filter, map } from 'rxjs/operators';

import { File } from '../../../core/models/file.model';
import { Process } from '../../../core/models/process.model';
import * as dropbox from '../../../core/actions/dropbox.actions';
import * as processes from '../../../core/actions/process.actions';
import * as fromCore from '../../../core/reducers';

@Component({
  selector: 'pvz-visualize-page',
  templateUrl: './visualize-page.component.html',
  styleUrls: ['./visualize-page.component.scss']
})
export class VisualizePageComponent implements OnInit {
  processes$: Observable<Process[]>;
  processesWithVisualizableFiles$: Observable<Process[]>;
  dropboxFiles$: Observable<File[]>;

  constructor(private store: Store<fromCore.State>) {
    this.processes$ = store.pipe(select(fromCore.getAllProcesses));
    this.processesWithVisualizableFiles$ = store.pipe(select(fromCore.getProcessesWithVisualizableFiles));
    // this.dropboxFiles$ = store.pipe(select(fromCore.getAllDropboxFiles));
    this.dropboxFiles$ = store.pipe(select(fromCore.getDropboxVisualizableFiles));
  }

  ngOnInit() {
    this.store.dispatch(new processes.Load());
    this.store.dispatch(new dropbox.Load());
  }

  reload() {
    this.store.dispatch(new processes.Load());
  }
}
