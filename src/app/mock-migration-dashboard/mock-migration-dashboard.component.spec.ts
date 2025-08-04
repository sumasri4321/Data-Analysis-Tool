import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockMigrationDashboardComponent } from './mock-migration-dashboard.component';

describe('MockMigrationDashboardComponent', () => {
  let component: MockMigrationDashboardComponent;
  let fixture: ComponentFixture<MockMigrationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockMigrationDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MockMigrationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
