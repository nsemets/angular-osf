import { Action, State, StateContext } from '@ngxs/store';
import { append, patch } from '@ngxs/store/operators';

import { finalize, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { MetadataService } from '@osf/features/project/metadata/services/metadata.service';
import {
  AddCedarMetadataRecordToState,
  CreateCedarMetadataRecord,
  GetCedarMetadataRecords,
  GetCedarMetadataTemplates,
  GetCustomItemMetadata,
  GetFundersList,
  MetadataStateModel,
  ResetCustomItemMetadata,
  UpdateCedarMetadataRecord,
  UpdateCustomItemMetadata,
} from '@osf/features/project/metadata/store';

import { CedarMetadataRecord, CedarMetadataRecordData, CedarMetadataRecordJsonApi, CrossRefFunder } from '../models';

const initialState: MetadataStateModel = {
  customItemMetadata: null,
  customItemMetadataLoading: false,
  fundersList: [] as CrossRefFunder[],
  loading: false,
  fundersLoading: false,
  error: null,
  cedarTemplates: null,
  cedarTemplatesLoading: false,
  cedarRecord: null,
  cedarRecordLoading: false,
  cedarRecords: [] as CedarMetadataRecordData[],
  cedarRecordsLoading: false,
};

@State<MetadataStateModel>({
  name: 'metadata',
  defaults: initialState,
})
@Injectable()
export class ProjectMetadataState {
  private readonly metadataService = inject(MetadataService);

  @Action(GetCustomItemMetadata)
  getCustomItemMetadata(ctx: StateContext<MetadataStateModel>, action: GetCustomItemMetadata) {
    ctx.patchState({
      loading: true,
      error: null,
    });

    return this.metadataService.getCustomItemMetadata(action.guid).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            customItemMetadata: response.data.attributes,
            loading: false,
          });
        },
        error: (error) => {
          ctx.patchState({
            error: error.message || 'Failed to load metadata',
            loading: false,
          });
        },
      }),
      finalize(() => ctx.patchState({ loading: false }))
    );
  }

  @Action(UpdateCustomItemMetadata)
  updateCustomItemMetadata(ctx: StateContext<MetadataStateModel>, action: UpdateCustomItemMetadata) {
    ctx.patchState({
      loading: true,
      error: null,
    });

    return this.metadataService.updateCustomItemMetadata(action.guid, action.metadata).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            customItemMetadata: response.data.attributes,
            loading: false,
          });
        },
        error: (error) => {
          ctx.patchState({
            error: error.message || 'Failed to update metadata',
            loading: false,
          });
        },
      }),
      finalize(() => ctx.patchState({ loading: false }))
    );
  }

  @Action(GetFundersList)
  getFundersList(ctx: StateContext<MetadataStateModel>, action: GetFundersList) {
    ctx.patchState({
      fundersLoading: true,
      error: null,
    });

    return this.metadataService.getFundersList(action.search).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            fundersList: response.message.items,
            fundersLoading: false,
          });
        },
        error: (error) => {
          ctx.patchState({
            error: error.message,
            fundersLoading: false,
          });
        },
      }),
      finalize(() => ctx.patchState({ fundersLoading: false }))
    );
  }

  @Action(GetCedarMetadataTemplates)
  getCedarMetadataTemplates(ctx: StateContext<MetadataStateModel>, action: GetCedarMetadataTemplates) {
    ctx.patchState({
      cedarTemplatesLoading: true,
      error: null,
    });

    return this.metadataService.getMetadataCedarTemplates(action.url).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            cedarTemplates: response,
            cedarTemplatesLoading: false,
          });
        },
        error: (error) => {
          ctx.patchState({
            error: error.message || 'Failed to load CEDAR templates',
            cedarTemplatesLoading: false,
          });
        },
      }),
      finalize(() => ctx.patchState({ cedarTemplatesLoading: false }))
    );
  }

  @Action(ResetCustomItemMetadata)
  resetCustomItemMetadata(ctx: StateContext<MetadataStateModel>) {
    ctx.setState({
      customItemMetadata: null,
      customItemMetadataLoading: false,
      fundersList: [],
      loading: false,
      fundersLoading: false,
      error: null,
      cedarTemplates: null,
      cedarTemplatesLoading: false,
      cedarRecord: null,
      cedarRecordLoading: false,
      cedarRecords: [],
      cedarRecordsLoading: false,
    });
  }

  @Action(GetCedarMetadataRecords)
  getCedarMetadataRecords(ctx: StateContext<MetadataStateModel>, action: GetCedarMetadataRecords) {
    ctx.patchState({ cedarRecordsLoading: true });
    return this.metadataService.getMetadataCedarRecords(action.projectId).pipe(
      tap((response: CedarMetadataRecordJsonApi) => {
        ctx.patchState({
          cedarRecords: response.data,
          cedarRecordsLoading: false,
        });
      })
    );
  }

  @Action(CreateCedarMetadataRecord)
  createCedarMetadataRecord(ctx: StateContext<MetadataStateModel>, action: CreateCedarMetadataRecord) {
    return this.metadataService.createMetadataCedarRecord(action.record).pipe(
      tap((response: CedarMetadataRecord) => {
        ctx.dispatch(new AddCedarMetadataRecordToState(response.data));
      })
    );
  }

  @Action(UpdateCedarMetadataRecord)
  updateCedarMetadataRecord(ctx: StateContext<MetadataStateModel>, action: UpdateCedarMetadataRecord) {
    return this.metadataService.updateMetadataCedarRecord(action.record, action.recordId).pipe(
      tap((response: CedarMetadataRecord) => {
        // Update the existing record in state
        const state = ctx.getState();
        const updatedRecords = state.cedarRecords.map((record) =>
          record.id === action.recordId ? response.data : record
        );
        ctx.patchState({
          cedarRecords: updatedRecords,
        });
      })
    );
  }

  @Action(AddCedarMetadataRecordToState)
  addCedarMetadataRecordToState(ctx: StateContext<MetadataStateModel>, action: AddCedarMetadataRecordToState) {
    ctx.setState(
      patch({
        cedarRecords: append([action.record]),
      })
    );
  }
}
