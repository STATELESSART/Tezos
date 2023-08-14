import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapNftComponent } from './swap-nft.component';

describe('SwapNftComponent', () => {
  let component: SwapNftComponent;
  let fixture: ComponentFixture<SwapNftComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SwapNftComponent]
    });
    fixture = TestBed.createComponent(SwapNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
