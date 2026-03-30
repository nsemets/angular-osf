import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { type Mock, vi } from 'vitest';

import { Type } from '@angular/core';

type OpenFn = (component: Type<any>, config?: any) => DynamicDialogRef<any>;
type GetInstanceFn = (ref: DynamicDialogRef<any>) => any;

export class DialogServiceMockBuilder {
  private openSpy: Mock<OpenFn> = vi.fn();
  private getInstanceSpy: Mock<GetInstanceFn> = vi.fn();

  static create(): DialogServiceMockBuilder {
    return new DialogServiceMockBuilder();
  }

  withOpenMock(mockFn?: Mock<OpenFn>): DialogServiceMockBuilder {
    this.openSpy = mockFn || vi.fn().mockReturnValue({} as DynamicDialogRef<any>);
    return this;
  }

  withGetInstanceMock(mockFn?: Mock<GetInstanceFn>): DialogServiceMockBuilder {
    this.getInstanceSpy = mockFn || vi.fn();
    return this;
  }

  withOpenReturning(ref: DynamicDialogRef<any>): DialogServiceMockBuilder {
    this.openSpy = vi.fn().mockReturnValue(ref);
    return this;
  }

  withOpenThrowing(error: Error): DialogServiceMockBuilder {
    this.openSpy = vi.fn().mockImplementation(() => {
      throw error;
    });
    return this;
  }

  build(): Partial<DialogService> {
    return {
      open: this.openSpy,
      getInstance: this.getInstanceSpy,
      dialogComponentRefMap: new Map(),
    };
  }
}

export const DialogServiceMock = {
  create() {
    return DialogServiceMockBuilder.create();
  },

  withOpenMock(mockFn?: Mock<OpenFn>) {
    return DialogServiceMockBuilder.create().withOpenMock(mockFn);
  },

  withGetInstanceMock(mockFn?: Mock<GetInstanceFn>) {
    return DialogServiceMockBuilder.create().withGetInstanceMock(mockFn);
  },

  withOpenReturning(ref: DynamicDialogRef<any>) {
    return DialogServiceMockBuilder.create().withOpenReturning(ref);
  },

  withOpenThrowing(error: Error) {
    return DialogServiceMockBuilder.create().withOpenThrowing(error);
  },
};
