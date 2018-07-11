import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ClarityModule } from '@clr/angular';

import { LayoutComponent } from './containers/layout/layout.component';
import { NotFoundComponent } from './containers/not-found/not-found.component';

import { ProcessService } from './services/process.service';
import { InputService } from './services/inputs.service';
import { DropboxService } from './services/dropbox.service';

import { ProcessEffects } from './effects/process.effects';
import { DropboxEffects } from './effects/dropbox.effects';

import { reducers } from './reducers';

export const COMPONENTS = [
  LayoutComponent,
  NotFoundComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    StoreModule.forFeature('core', reducers),
    EffectsModule.forFeature([ProcessEffects, DropboxEffects])
  ],
  providers: [
    ProcessService,
    InputService,
    DropboxService
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS
})

export class CoreModule {
  static forRoot() {
    return {
      ngModule: CoreModule,
      providers: [],
    };
  }
}
