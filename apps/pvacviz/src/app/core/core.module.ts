import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ClarityModule } from '@clr/angular';

import { LayoutComponent } from '@pvz/core/containers/layout/layout.component';
import { NotFoundComponent } from '@pvz/core/containers/not-found/not-found.component';

import { ConfigService } from '@pvz/core/services/config.service';
import { ProcessService } from '@pvz/core/services/process.service';
import { AlgorithmsService } from '@pvz/core/services/algorithms.service';
import { AllelesService } from '@pvz/core/services/alleles.service';
import { InputService } from '@pvz/core/services/inputs.service';
import { DropboxService } from '@pvz/core/services/dropbox.service';
import { ProcessEffects } from '@pvz/core/effects/process.effects';
import { DropboxEffects } from '@pvz/core/effects/dropbox.effects';

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
    ConfigService,
    ProcessService,
    AlgorithmsService,
    AllelesService,
    InputService,
    DropboxService,
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
