import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authrizeGuard } from './authrize.guard';

describe('authrizeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authrizeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
