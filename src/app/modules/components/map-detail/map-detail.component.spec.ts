import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDetailComponent } from './map-detail.component';

describe('MapDetailComponent', () => {
  let component: MapDetailComponent;
  let fixture: ComponentFixture<MapDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
