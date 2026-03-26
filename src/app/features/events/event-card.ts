import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, input, output, computed, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-card',
  imports: [RouterLink, DatePipe, NgOptimizedImage],
  template: `
    <div
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <!-- Thumbnail Image -->
      <div class="relative h-48 w-full bg-gray-200">
        <img
          [ngSrc]="image()"
          width="500"
          height="200"
          priority
          class="object-cover w-full h-full max-h-full max-w-full"
          alt="Event Thumbnail"
        />
      </div>

      <!-- Date & Days Until -->
      <div class="p-6">
        <!-- Date -->
        <div class="flex justify-between items-center mt-4">
          <p class="text-sm text-blue-600 font-semibold mb-2">
            {{ (date() | date: 'EEEE dd MMMM yyyy, h:mm a') || 'TBA' }}
          </p>

          <!-- Days Until (Badge) -->
          @let days = daysUntil();
          @if (days !== null) {
            <div
              class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
            >
              @if (days > 0) {
                In {{ days }} Days
              } @else if (days < 0) {
                Past event
              } @else {
                Happening Now!
              }
            </div>
          }
        </div>

        <!-- Title -->
        <h3 class="text-xl font-bold text-gray-800 my-2">{{ title() }}</h3>

        <!-- Buttons -->
        <div class="flex justify-between items-center mt-4">
          <!-- Like Button -->
          <button
            (click)="toggleFavourite()"
            [class.text-red-500]="isFavourite()"
            class="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <span>{{ isFavourite() ? '♥' : '♡' }}</span>
            Like
          </button>

          <!-- Remove Button -->
          <button
            class="text-gray-400 text-sm hover:text-gray-600 cursor-pointer"
            (click)="removeEvent()"
          >
            Remove
          </button>
        </div>

        <!-- Details Button (Footer) -->
        <div class="mt-4 pt-4 border-t border-gray-100 text-right">
          <a
            [routerLink]="['/event', id()]"
            class="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            View Details →
          </a>
        </div>
      </div>
    </div>
  `,
})
export class EventCard {
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly image = input.required<string>();
  readonly date = input<string>();

  daysUntil = computed(() => {
    const eventDate = this.date();
    if (!eventDate) return null;

    const today = new Date();
    const target = new Date(eventDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  });

  initalLike = input(false);
  isFavourite = linkedSignal(() => this.initalLike());
  toggleFavourite() {
    this.isFavourite.update((val) => !val);
  }

  delete = output<void>();

  removeEvent() {
    this.delete.emit();
  }
}
