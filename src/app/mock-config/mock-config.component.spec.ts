import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockConfigComponent } from './mock-config.component';

describe('MockConfigComponent', () => {
  let component: MockConfigComponent;
  let fixture: ComponentFixture<MockConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MockConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
