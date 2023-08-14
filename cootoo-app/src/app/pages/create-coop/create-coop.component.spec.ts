import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCoopComponent } from './create-coop.component';

describe('CreateCoopComponent', () => {
  let component: CreateCoopComponent;
  let fixture: ComponentFixture<CreateCoopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateCoopComponent]
    });
    fixture = TestBed.createComponent(CreateCoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
