import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCoopsComponent } from './explore-coops.component';

describe('ExploreCoopsComponent', () => {
  let component: ExploreCoopsComponent;
  let fixture: ComponentFixture<ExploreCoopsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExploreCoopsComponent]
    });
    fixture = TestBed.createComponent(ExploreCoopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
