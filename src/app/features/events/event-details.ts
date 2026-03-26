import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsService } from '../../core/events.sevice';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto min-h-[600px]">
      <!-- Back Button -->
      <a routerLink="/" class="text-blue-600 hoover:underline mb-6 inline-block">
        ← Back to Events
      </a>

      <!-- Loading -->
      @if (eventResource.isLoading()) {
        <div class="animate-pulse h-64 bg-gray-100 rounded-lg"></div>
      }

      <!-- Error -->
      @if (eventResource.error()) {
        <div class="text-red-600 p-4 bg-red-50 rounded">Event not found.</div>
      }

      <!-- Data -->
      @if (eventResource.hasValue()) {
        @let event = eventResource.value()!;
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[600px]">
          <!-- Left Side   -->
          <div class="md:col-span-2 space-y-4">
            <!-- Title   -->
            <h1 class="text-4xl font-bold text-gray-900">{{ event.title }}r</h1>

            <!-- Date   -->
            <p class="test-gray-500 text-lg">
              {{ event.date | date: 'fullDate' }} • {{ event.location }}
            </p>

            <!-- Description   -->
            <p class="text-gray-700 leading-relaxed text-lg">
              {{ event.description }}
            </p>
          </div>

          <!-- Right Side -->
          <div class="bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
            <!-- Image   -->
            @defer (hydrate on viewport) {
              <div class="h-48 bg-gray-200 rounded mb-4 overflow-hidden">
                <img
                  [src]="'/images/venue-map.png'"
                  class="w-full h-full object-cover"
                  alt="Event Map"
                />
              </div>
            } @placeholder {
              <div
                class="h-140 bg-gray-100 rounded mb-4 flex items-center justify-center border-2 border-dashed border-gray-300"
              >
                <span class="test-gray-400">Map Loading...</span>
              </div>
            }

            <!-- Button   -->
            @defer (hydrate on interaction) {
              <button
                (click)="addToCart()"
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition"
              >
                Buy Tickets
              </button>
            } @placeholder {
              <button class="w-full bg-blue-600 test-white py-3 rounded-lg font-bold opacity-90">
                Buy Ticket
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class EventDetails {
  private readonly cartService = inject(CartService);

  readonly id = input.required<string>();

  addToCart() {
    this.cartService.addTicket(this.id());
  }

  private readonly eventService = inject(EventsService);

  readonly eventResource = this.eventService.getEventResource(this.id);
}
