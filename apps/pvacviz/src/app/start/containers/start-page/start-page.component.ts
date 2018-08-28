import { Component, Input, forwardRef, OnInit } from '@angular/core';

import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { map, filter, take, startWith, withLatestFrom, debounceTime, tap, switchMap, distinctUntilChanged } from 'rxjs/operators';

import { Store, select, createSelector } from '@ngrx/store';

import { FormGroupState, ResetAction, SetValueAction, FormControlState, unbox } from 'ngrx-forms';

import { StartFormGroupValue, StartFormGroupInitialState } from '@pvz/start/models/start-form.models';

import { File, Files } from '@pvz/core/models/file.model';
import { ProcessParameters } from '@pvz/core/models/process-parameters.model';
import { Algorithm, Allele, ApiMeta } from '@pvz/core/models/api-responses.model';
import { InputService } from '@pvz/core/services/inputs.service';

import * as fromInputsActions from '@pvz/start/actions/inputs.actions';
import * as fromAllelesActions from '@pvz/start/actions/alleles.actions';
import * as fromAlgorithmsActions from '@pvz/start/actions/algorithms.actions';
import * as fromStartActions from '@pvz/start/actions/start.actions';
import * as fromStart from '@pvz/start/reducers';
// TODO: move SetSubmittedValueAction to start/reducers/index to be included with fromStart
import { SetSubmittedValueAction, INITIAL_STATE } from '@pvz/start/reducers/start.reducer';
import { combineLatest } from '../../../../../../../node_modules/rxjs';

@Component({
  selector: 'pvz-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {
  private subscriptions = [];

  inputs$: Observable<Files>;
  algorithms$: Observable<Array<Algorithm>>;
  alleles$: Observable<Array<Allele>>;
  // BehaviorSubject w/ initial value provided here, or withLatestFrom operators won't fire
  allelesTypeahead$ = new BehaviorSubject<string>('');
  allelesScrollToEnd$ = new Subject<any>();
  allelesMeta$: Observable<ApiMeta>;

  predictionAlgorithms$: Observable<Array<string>>;
  selectedAlgorithms$: Observable<Array<Algorithm>>;

  netChopMethodOptions;
  topScoreMetricOptions;



  formState$: Observable<FormGroupState<StartFormGroupValue>>;
  submittedValue$: Observable<StartFormGroupValue | undefined>;
  newProcessId$: Observable<number>;

  postSubmitting$: Observable<boolean>;
  postSubmitted$: Observable<boolean>;
  postMessage$: Observable<string>;
  postError$: Observable<boolean>;

  constructor(
    private store: Store<fromStart.State>,
  ) {
    this.formState$ = store.pipe(select(fromStart.getFormState), map(s => s.state));
    this.submittedValue$ = store.pipe(select(fromStart.getSubmittedValue),
      filter(v => v !== undefined && v !== null));

    // TODO do this grouping in the service or create a new selector in start.reducer
    this.inputs$ = store.pipe(select(fromStart.getAllInputs), map((inputs) => {
      let options = [];
      let dir = '~pVAC-Seq';

      function groupFiles(dir, contents) {
        contents.forEach((item) => {
          if (item.type === "file") {
            let option = {
              display_name: item.display_name,
              fileID: item.fileID,
              directory: dir
            }
            options.push(option);
          } else if (item.type === "directory") {
            dir = dir + '/' + item.display_name;
            groupFiles(dir, item.contents);
          }
        })
      }
      groupFiles(dir, inputs);
      return options;
    }));

    this.algorithms$ = store.pipe(select(fromStart.getAllAlgorithms));
    this.alleles$ = store.pipe(select(fromStart.getAllAlleles))
    this.allelesMeta$ = store.pipe(select(fromStart.getStartState), map(state => state.alleles.meta))

    // TODO: create only one observer for post, access attributes in template, this looks awful
    this.postSubmitting$ = store.pipe(select(fromStart.getStartState), map(state => state.post.submitting));
    this.postSubmitted$ = store.pipe(select(fromStart.getStartState), map(state => state.post.submitted));
    this.postMessage$ = store.pipe(select(fromStart.getStartState), map(state => state.post.message));
    this.postError$ = store.pipe(select(fromStart.getStartState), map(state => state.post.error));
    this.newProcessId$ = store.pipe(select(fromStart.getStartState), map(state => state.post.processid));

    // TODO move to start.reducer
    const getPredictionAlgorithmsState = createSelector(
      fromStart.getFormState,
      form => form.state.value.prediction_algorithms
    );

    // observe form prediction algorithms value, filtering empty arrays
    // dispatch LoadAlleles when prediction_algorithms changes
    this.predictionAlgorithms$ = store.pipe(
      select(getPredictionAlgorithmsState),
      map(s => unbox(s)));

    this.predictionAlgorithms$.subscribe((algorithms) => {
      if (algorithms.length > 0) {
        const req = {
          prediction_algorithms: algorithms.join(',')
        }
        this.store.dispatch(new fromAllelesActions.LoadAlleles(req));
      }
    })
    this.subscriptions.push(this.predictionAlgorithms$);

    // reload alleles when typeahead updates
    this.allelesTypeahead$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      withLatestFrom(this.allelesMeta$, this.predictionAlgorithms$)
    ).subscribe(([term, meta, algorithms]) => {
      const req = {
        prediction_algorithms: algorithms,
        name_filter: term,
        page: 1,
        count: 100
      }
      this.store.dispatch(new fromAllelesActions.LoadAlleles(req))
    });
    this.subscriptions.push(this.allelesTypeahead$);

    // reload alleles when dropdown scrolls to end
    this.allelesScrollToEnd$.pipe(
      withLatestFrom(this.allelesMeta$, this.predictionAlgorithms$, this.allelesTypeahead$)
    ).subscribe(([event, meta, algorithms, term]) => {
      const req = {
        prediction_algorithms: algorithms,
        name_filter: term,
        page: meta.page + 1,
        count: 100
      }
      this.store.dispatch(new fromAllelesActions.LoadAlleles(req))
    });
    this.subscriptions.push(this.allelesScrollToEnd$);

    // fire off submit action when submitValue is updated
    const onSubmitted$ = this.submittedValue$.pipe(withLatestFrom(this.formState$));
    onSubmitted$.subscribe(([formValue, formState]) => {
      const processParameters: ProcessParameters = parseFormParameters(unbox(formValue))
      this.store.dispatch(new fromStartActions.StartProcess(processParameters));
    });
    this.subscriptions.push(onSubmitted$);

    function parseFormParameters(formParameters) {
      formParameters.alleles = formParameters.alleles.join(',')
      formParameters.prediction_algorithms = formParameters.prediction_algorithms.join(',')
      formParameters.epitope_lengths = formParameters.epitope_lengths.join(',')
      // TODO figure out where input is cast to Number before submitting - shouldn't have to cast it here
      formParameters.input = formParameters.input.toString();
      return formParameters as ProcessParameters;
    }

    this.netChopMethodOptions = [
      { label: 'Skip Netchop', value: '' },
      { label: 'C term 3.0', value: 'cterm' },
      { label: '20S 3.0', value: '20s' },
    ];

    this.topScoreMetricOptions = [
      { label: 'Median Score', value: 'median' },
      { label: 'Lowest Score', value: 'lowest' },
    ];
  }

  // fetch more records when select scrolled near end
  onScroll(e) {
    console.log('onScroll -=-=-=-=-=-=-=-=-=-==-');
    console.log(e);
  }

  ngOnInit() {
    this.store.dispatch(new fromInputsActions.LoadInputs());
    this.store.dispatch(new fromAlgorithmsActions.LoadAlgorithms());
  }

  onSubmit() {
    this.subscriptions.push(
      this.formState$.pipe(
        take(1),
        map(fs => new SetSubmittedValueAction(fs.value))).subscribe(this.store));
  }

  reset() {
    this.store.dispatch(new SetValueAction(INITIAL_STATE.id, INITIAL_STATE.value));
    this.store.dispatch(new ResetAction(INITIAL_STATE.id));
  }
  // onSubmit(startParameters): void {
  //   this.store.dispatch(new fromStartActions.StartProcess(startParameters));
  // }

  onDestroy() {
    // unsubscribe from all manual subscriptions
    if (this.subscriptions.length > 0) { this.subscriptions.forEach(sub => sub.unsubscribe()); }
  }
}
