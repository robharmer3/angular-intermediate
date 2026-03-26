import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { EventDetails } from './event-details';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeferBlockState } from '@angular/core/testing';

import { API_URL } from '../../core/tokens';

describe('EventDetails', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [EventDetails],
      providers: [
        { provide: API_URL, useValue: 'http://localhost:3000' },
        provideRouter([]),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EventDetails);
    const httpMock = TestBed.inject(HttpTestingController);

    // Set required input
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();

    return { fixture, httpMock };
  }

  it('renders map only when deferred block completes', async () => {
    const { fixture, httpMock } = await setup();

    // 1. Handle CartStore initialization (it loads tickets)
    const ticketsReq = httpMock.expectOne('http://localhost:3000/tickets');
    ticketsReq.flush([]);

    // 2. Handle EventDetails data fetching
    const req = httpMock.expectOne('http://localhost:3000/events/1');
    req.flush({
      id: '1',
      title: 'Test Event',
      date: new Date().toISOString(),
      location: 'Test Location',
      description: 'Test Description',
      speakers: [],
      image: 'test.jpg',
    });
    fixture.detectChanges(); // Update view with data
    await fixture.whenStable(); // Wait for signals to settle
    fixture.detectChanges(); // Update view again for content projection

    // 1. Get all defer blocks
    const deferBlocks = await fixture.getDeferBlocks();
    const mapBlock = deferBlocks[0];

    // Switch to Venue tab to render the defer block placeholder
    const tabs = fixture.nativeElement.querySelectorAll('button');
    // Helper to find tab by text content (trimming whitespace)
    const venueTab = Array.from(tabs).find(
      (t: any) => t.textContent.trim() === 'Venue',
    ) as HTMLElement;

    if (!venueTab) throw new Error('Venue tab not found');

    venueTab.click();
    fixture.detectChanges();
    await fixture.whenStable();

    // 2. Verify Placeholder State
    expect(fixture.nativeElement.textContent).toContain('Loading Map...');
    expect(fixture.nativeElement.textContent).not.toContain('Heavy Map Loaded');

    // 3. Force Render (Simulate Viewport Entry)
    await mapBlock.render(DeferBlockState.Complete);

    // 4. Verify Final State
    expect(fixture.nativeElement.textContent).not.toContain('Loading Map...');
    expect(fixture.nativeElement.querySelector('img[src="/images/venue-map.png"]')).toBeTruthy();
  });
});
