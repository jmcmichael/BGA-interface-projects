import { createSelector, combineReducers, Action } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import {
  createFormGroupState,
  createFormStateReducerWithUpdate,
  formGroupReducer,
  FormGroupState,
  Boxed,
  box,
  unbox,
  validate,
  updateGroup,
  compose,
  updateArray
} from 'ngrx-forms';
import { required, minLength, lessThanOrEqualTo, greaterThan } from 'ngrx-forms/validation';

import { File, Files } from '@pvz/core/models/file.model';
import { Allele } from '@pvz/core/models/api-responses.model';
import { StartActions, StartActionTypes, StartProcessSuccess, SetSubmittedValueAction } from '@pvz/start/actions/start.actions';
import { ApiStartResponse } from '@pvz/core/models/api-responses.model';

export interface StartFormGroupValue {
  'allele_specific_cutoffs': boolean;
  'alleles': Boxed<string[]>;
  'binding_threshold': number;
  'downstream_sequence_length': number;
  'epitope_lengths': Boxed<string[]>;
  'expn_val': number;
  'fasta_size': number;
  'force': boolean;
  'iedb_install_dir': string;
  'iedb_retries': number;
  'input': string;
  'keep_tmp_files': boolean;
  'maximum_transcript_support_level': number,
  'minimum_fold_change': number;
  'net_chop_method': string;
  'net_chop_threshold': number;
  'netmhc_stab': boolean;
  'normal_cov': number;
  'normal_vaf': number;
  'pass_only': boolean;
  'peptide_sequence_length': number;
  'phased_proximal_variants_vcf': string,
  'prediction_algorithms': Boxed<string[]>;
  'samplename': string;
  'tdna_cov': number;
  'tdna_vaf': number;
  'top_score_metric': string;
  'trna_cov': number;
  'trna_vaf': number;
}
export const StartFormGroupInitialState = {
  'allele_specific_cutoffs': false,
  'alleles': box([]),
  'binding_threshold': 500,
  'downstream_sequence_length': 1000,
  'epitope_lengths': box(['10']),
  'expn_val': 1,
  'fasta_size': 200,
  'force': false,
  'iedb_install_dir': '',
  'iedb_retries': 5,
  'input': null,
  'keep_tmp_files': false,
  'maximum_transcript_support_level': 1,
  'minimum_fold_change': 0,
  'net_chop_method': '',
  'net_chop_threshold': 0.5,
  'netmhc_stab': false,
  'normal_cov': 5,
  'normal_vaf': 0.02,
  'pass_only': false,
  'peptide_sequence_length': 21,
  'phased_proximal_variants_vcf': null,
  'prediction_algorithms': box([]),
  'samplename': '',
  'tdna_cov': 10,
  'tdna_vaf': 0.25,
  'top_score_metric': 'median',
  'trna_cov': 10,
  'trna_vaf': 0.25,
}
// TODO keep checking for v3.1.0, which adds transparent validation for boxed values:
// https://github.com/MrWolfZ/ngrx-forms/issues/96
export const validateAndUpdateFormState = updateGroup<StartFormGroupValue>({
  input: validate(required),
  samplename: validate((value) => {
    return required(value);
  }, minLength(2)),
  prediction_algorithms: validate((value) => {
    return required(unbox(value));
  }, (value) => {
    return minLength(1)(unbox(value))
  }),
  alleles: validate(value => required(unbox(value)), value => minLength(1)(unbox(value))),
  epitope_lengths: validate(value => required(unbox(value)), value => minLength(1)(unbox(value)))
});

export const FORM_ID = 'startForm';
export const INITIAL_STATE = validateAndUpdateFormState(createFormGroupState<StartFormGroupValue>(FORM_ID, StartFormGroupInitialState));

// validation
export const updateStartFormGroup = createFormStateReducerWithUpdate<StartFormGroupValue>(validateAndUpdateFormState);

/**
 * FORM STATE AND REDUCER
 * Stores the form data itself
 **/
export interface FormState {
  state: FormGroupState<StartFormGroupValue>;
  submittedValue: StartFormGroupValue | undefined;
}


const formReducers = combineReducers<FormState, any>({
  state(s = INITIAL_STATE, a: Action) {
    return updateStartFormGroup(s, a);
  },
  submittedValue(s: StartFormGroupValue | undefined, a: SetSubmittedValueAction) {
    switch (a.type) {
      case SetSubmittedValueAction.TYPE:
        return a.submittedValue;

      default:
        return s;
    }
  },
});

export function formReducer(s: FormState, a: Action) {
  return formReducers(s, a);
}

/**
 * FORM POST STATE AND REDUCER
 * Stores info related to submitting the start form, errors, etc.
 **/
export interface PostState extends ApiStartResponse {
  submitting: boolean;
  submitted: boolean;
  error: boolean;
}

// set initial form post state
export const initialState: PostState = {
  submitting: false,
  submitted: false,
  status: null,
  message: null,
  processid: null,
  error: false,
};

// form post reducers
export function postReducer(state = initialState, action: StartActions): PostState {
  switch (action.type) {

    case StartActionTypes.StartProcess:
      return {
        ...state,
        submitting: true,
      }

    case StartActionTypes.StartProcessSuccess:
      return {
        ...state,
        submitting: false,
        submitted: true,
        status: action.payload.status,
        message: action.payload.message,
        processid: action.payload.processid
      }

    case StartActionTypes.StartProcessFail:
      return {
        ...state,
        submitting: false,
        submitted: true,
        error: true,
        status: action.payload.status,
        message: action.payload.message
      }

    case StartActionTypes.MarkAsUnsubmitted:
      return {
        ...state,
        submitting: false,
        submitted: false,
        error: false,
        status: null,
        message: null
      }

    default:
      return state;
  }
}
