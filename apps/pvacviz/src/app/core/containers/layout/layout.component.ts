import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { ModalConfig } from '@pvz/core/models/layout.model';
import * as fromCore from '@pvz/core/reducers';
import * as layout from '@pvz/core/actions/layout.actions';

@Component({
  selector: 'pvz-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnDestroy {
  collapsible: boolean = true;
  collapsed$: Observable<boolean>;
  modalOpen$: Observable<boolean>;
  modalOpen: boolean;
  modalConfig$: Observable<ModalConfig>;

  notification: string;
  showNotification: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private store: Store<fromCore.State>,
  ) {

    this.collapsed$ = this.store.pipe(select(fromCore.getCollapsed));
    this.modalOpen$ = this.store.pipe(select(fromCore.getModalOpen));
    this.modalConfig$ = this.store.pipe(select(fromCore.getModalConfig));
  }

  collapseChange($event) {
    $event ? this.store.dispatch(new layout.CollapseSidenav()) : this.store.dispatch(new layout.OpenSidenav());
    this.subscriptions.push(
      this.modalOpen$.subscribe((open) => {
        this.modalOpen = open;
      })
    );
  }

  onCancel() {
    this.modalConfig$.pipe(take(1)).subscribe((modal) => {
      this.store.dispatch(modal.actions.cancel);
    });
  }
  onConfirm() {
    this.modalConfig$.pipe(take(1)).subscribe((modal) => {
      this.store.dispatch(modal.actions.confirm);
    });
    this.store.dispatch(new layout.CloseModal);
  }

  ngOnDestroy() {
    this.subscriptions.map((s) => s.unsubscribe());
  }
}
