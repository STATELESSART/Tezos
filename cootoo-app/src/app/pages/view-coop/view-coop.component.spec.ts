import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCoopComponent } from './view-coop.component';

describe('ViewCoopComponent', () => {
  let component: ViewCoopComponent;
  let fixture: ComponentFixture<ViewCoopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCoopComponent]
    });
    fixture = TestBed.createComponent(ViewCoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
