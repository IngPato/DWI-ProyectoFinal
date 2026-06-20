import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { medicoGuardGuard } from './medico-guard-guard';

describe('medicoGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => medicoGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
