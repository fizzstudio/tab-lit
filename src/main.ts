import * as ui from '../lib';
import '../lib';
import tabDescriptionIcon from './tab-description-icon.svg';
import tabDataIcon from './tab-data-icon.svg';
import tabControlsIcon from './tab-controls-icon.svg';
import tabColorsIcon from './tab-colors-icon.svg';

import { html, render } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';

window.addEventListener('load', () => new Demo());

export class Demo {
  constructor() {   
    this.init();
  }
  
  async init() {
    const contentContainer = document.getElementById('content-container')!;
    const tabDeetsRef = createRef<ui.TabDetails>();

    render(html`
      <div style="padding: 1rem; background: lavender">
        <fizz-tab-details 
          ${ref(tabDeetsRef)}
          open
          tablabelmode="icons-labels"
          @open=${() => console.log('tab details opened')}
          @close=${() => console.log('tab details closed')}
        >
          <fizz-tab-panel tablabel="Tab A" icon=${tabDescriptionIcon}>
            Hello, lamp post! 
          </fizz-tab-panel>
          <fizz-tab-panel tablabel="Tab B" icon=${tabDataIcon}>
            Whatcha knowin'?
          </fizz-tab-panel>
          <fizz-tab-panel tablabel="Tab C" icon=${tabControlsIcon}>
            I'm here to watch your
          </fizz-tab-panel>
          <fizz-tab-panel hidden tablabel="Tab D" icon=${tabColorsIcon}>
            Power flowin'!
          </fizz-tab-panel>
        </fizz-tab-details>
      </div>
    `, contentContainer);
  }
}
