import { Component, contentChildren, effect, inject } from '@angular/core';
import { TabState } from './tab-state';
import { Tab } from './tab';

@Component({
  selector: 'app-tab-group',
  providers: [TabState],
  imports: [],
  template: ` <div class="boarder-b boarder-gray-200 flex gap-4">
      @for (tab of tabs(); track tab.label()) {
        <button
          (click)="activate(tab.label())"
          class="px-4 py-2 border-b-2 transition-colours font-medium"
          [class.border-blue-600]="state.activeTab() === tab.label()"
          [class.text-blue-600]="state.activeTab() === tab.label()"
          [class.border-transparent]="state.activeTab() !== tab.label()"
        >
          {{ tab.label() }}
        </button>
      }
    </div>

    <!-- Active Tab's Content -->
    <ng-content />`,
})
export class TabGroup {
  readonly state = inject(TabState);

  readonly tabs = contentChildren(Tab);

  constructor() {
    effect(() => {
      const allTabs = this.tabs();
      if (allTabs.length > 0 && !this.state.activeTab()) {
        this.state.activate(allTabs[0].label());
      }
    });
  }

  activate(label: string) {
    this.state.activate(label);
  }
}
