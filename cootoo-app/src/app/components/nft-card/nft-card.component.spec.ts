import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftCardComponent } from './nft-card.component';

describe('NftCardComponent', () => {
  let component: NftCardComponent;
  let fixture: ComponentFixture<NftCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NftCardComponent]
    });
    fixture = TestBed.createComponent(NftCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
