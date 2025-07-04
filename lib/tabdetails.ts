
import { styles } from './styles';
import { type TabLabelMode, type TabPanel } from './tabview';
import infoIcon from './assets/info-icon.svg';

import { LitElement, html, css, nothing, type PropertyValueMap, type PropertyValues } from 'lit';
import { property, state, queryAssignedElements, customElement } from 'lit/decorators.js';
import {type Ref, ref, createRef} from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeCSS } from 'lit';

/** 
 * The unholy union of a details box and a tab view.
 * @public 
 */
@customElement('fizz-tab-details')
export class TabDetails extends LitElement {

  @property({type: Boolean}) open = false;

  @property({type: Number}) default = 0;

  @property() tabLabelMode: TabLabelMode = 'labels';

  @property() openButtonAriaLabel = 'Open or close tabbed interface';

  @property() tabListAriaLabel = 'Tabs';

  @state() tabLabels: string[] = [];

  @state() protected _tabIcons: string[] = [];

  @state() protected _hiddenTabs: string[] = [];

  @state()
  set selectedTab(i: number) {
    this._selectedTab = i;
    this._tabRefs[i].value!.focus();
  }
  get selectedTab() {
    return this._selectedTab;
  }

  @queryAssignedElements() private _panelEls!: TabPanel[];

  protected _detailsRef = createRef<HTMLDetailsElement>();
  protected _selectedTab!: number;
  protected _tabRefs: Ref<HTMLButtonElement>[] = [];
  protected _panelsWrapperRef = createRef<HTMLDivElement>();
  protected _allPanelContents: Node[][] = []; 
  //private mediaQueryList!: MediaQueryList;
  protected _ready = false;

  static styles = [
    styles,
    css`
      :host {
        display: block;
      }
      details {
        background: var(--background, var(--themeContrastColor));
        color: var(--color, black);
        border-radius: var(--border-radius, 0.15rem);
      }
 
      summary {
        background: var(--summary-background, var(--themeColor));
        border-radius: var(--summary-border-radius, 0);
        padding: 0;
        padding-top: 2px;
        padding-left: 2px;
        list-style-type: none;
      }
      summary::before {
        display: inline-block;
        width: var(--summary-marker-size, 1.1rem);
        height: var(--summary-marker-size, 1.1rem);
        margin-left: 2px;
        margin-top: 2px;
        margin-right: 2px;
        padding: 1px;
        content: '';
        background-color: var(--summary-marker-color, ghostwhite);
        mask-image: var(--summary-marker-icon, url(${unsafeCSS(infoIcon)}));
        mask-size: cover;
        cursor: pointer;
        z-index: 1;
      }

      details {
        border: var(--border, 1px solid var(--themeColor));
      }
      details[open] summary {
        border-radius: var(--summary-border-radius-open, 0);
      }
      details:not([open]) {
        /* 
          marker width + marker margins + marker padding + summary left padding 
          + summary left padding added on the right
        */
        width: calc(1.1rem + 4px + 2px + 2px + 2px);
        background: none;
        /* 
          Keep the icon from moving by making the border transparent
          rather than removing it
        */
        border: 1px solid transparent;
      }
      details:not([open]) summary::before {
        background-color: var(--themeColor, ghostwhite);
      }
      details:not([open]) summary {
        background: none;
      }
      .panels {
        background: var(--contents-background, var(--themeContrastColor));
        padding: var(--contents-padding, 0 0.25rem);
        margin: var(--contents-margin, 0);
        overflow: var(--contents-overflow, hidden);
        border-radius: var(--border-radius, 0 0 0.15rem 0.15rem);
        z-index: 3;
      }
      .tablist {
        display: inline-flex;
        padding: 0;
        border-radius: var(--border-radius, 0.15rem 0.15rem 0 0);
        gap: var(--tab-gap, 0);
        font-size: var(--tab-font-size, unset);
        font-weight: var(--tab-font-weight, unset);
        margin: 0;
        background: none;
        flex-grow: 1;
        width: calc(100% - 2rem);
      }
      li {
        list-style-type: none;
      }
      .tab {
        padding: var(--padding, 0.25rem 0.4rem);
        cursor: pointer;
        border: none;
        border-radius: var(--border-radius, 0.15rem 0.15rem 0 0);
      }
      [role='tab'] {
        color: var(--background-selected, var(--themeUnselectedTextColor, var(--themeExtraColor)));
        background: none;
      }
      [role='tab'][aria-selected='true'] {
        background: var(--background-selected, var(--themeExtraColor));
        color: var(--themeTextColor, var(--color-selected, var(--themeColor)));
        text-decoration: var(--themeSelectedTextDecoration) var(--themeTextColor);
        text-underline-offset: 0.25rem;
      }
      .icon {
        height: 1rem;
        width: 1rem;
        vertical-align: middle;
        background-color: currentColor;
        display: inline-block;
      }
      @media screen and (max-width: 600px) {
        .tablist {
          flex-direction: column;
          overflow-y: scroll;
          height: 3.5rem;
          /*gap: 0.1rem;*/
        }
        .tab {
          width: 100%;
        }
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    this._selectedTab = this.default;
    // this.mediaQueryList = window.matchMedia('(min-width: 400px)');
    // let oldTabLabelMode: TabLabelMode = 'icons-labels';
    // this.mediaQueryList.addEventListener('change', (e: MediaQueryListEvent) => {
    //   if (e.matches) {
    //     this.tabLabelMode = oldTabLabelMode;
    //   } else {
    //     oldTabLabelMode = this.tabLabelMode;
    //     this.tabLabelMode = 'icons';
    //   }
    // });
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.dispatchEvent(new CustomEvent('firstupdate', {bubbles: true, composed: true}));
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.get('tabLabels') && this.tabLabels.length) {
      // tabLabels may not actually get populated until after the second update, 
      // so it's not enough here to simply check that the previous value of tabLabels
      // is not undefined
      //this.selectedTab = 0;
    }
    if (this._tabRefs.length) {
      // Selected tab may be hidden, in which case it won't have a ref value
      this._tabRefs[this.selectedTab].value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (this._allPanelContents.length && !this._ready) {
      this._ready = true;
      this.dispatchEvent(new CustomEvent('ready', {bubbles: true, composed: true}));
    }
  }

  hide(tabName: string) {
    const i = this.tabLabels.indexOf(tabName);
    if (i === -1) {
      throw new Error(`no tab with label '${tabName}'`);
    }
    if (!this._hiddenTabs.includes(tabName)) {
      this._hiddenTabs =  [...this._hiddenTabs, tabName];
    }
  }

  show(tabName: string) {
    if (!this.tabLabels.includes(tabName)) {
      throw new Error(`no tab with label '${tabName}'`);
    }
    const i = this._hiddenTabs.indexOf(tabName);
    if (i !== -1) {
      this._hiddenTabs = this._hiddenTabs.toSpliced(i, 1);
    }
  }

  protected _activateTab(event: Event, i: number) { 
    event.preventDefault();
    event.stopPropagation();
    this.selectedTab = i;
  }

  protected _renderTab(title: string, i: number) {
    this._tabRefs[i] ??= createRef();
    if (this._hiddenTabs.includes(title)) {
      return html``;
    }
    const selected = this.selectedTab === i;
    const tabClasses = {
      hidden: this.tabLabelMode === 'icons' || 
        (this.tabLabelMode === 'icons-current-label' && !selected)
    };
    const iconClasses = {
      icon: this.tabLabelMode !== 'labels'
    };
    const iconStyles = {
      mask: this._tabIcons[i] ? `url("${this._tabIcons[i]}") no-repeat 50% 50%` : undefined,
      ['mask-size']: 'cover'
    };            
    return html`
      <li
        role="presentation"
      >
        <button 
          ${ref(this._tabRefs[i])} 
          role="tab"
          id="tab${i}"
          tabindex=${selected ? nothing : -1}
          aria-selected=${selected ? 'true' : 'false'}
          aria-controls="panel${i}"
          class="tab"
          @keydown=${(event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
              this._activateTab(event, i === 0 ? this.tabLabels.length - 1 : i - 1);
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
              this._activateTab(event, (i + 1) % this.tabLabels.length);
            }
          }}
          @click=${(event: MouseEvent) => this._activateTab(event, i)}
        >
          ${this._tabIcons[i] ? html`
            <span 
              class=${classMap(iconClasses)} 
              style=${styleMap(iconStyles)}
            >
            </span>
          ` : ''}
          <span class=${classMap(tabClasses)}>
            ${title}
          </span>
        </button>
      </li>
    `;
  }

  protected _absorbPanels() {
    this._allPanelContents = this._panelEls.map(p => p.contentNodes);
    this._panelEls.forEach(p => p.remove());
    this.requestUpdate();
  }

  protected render() {
    return html`
      <details 
        ${ref(this._detailsRef)}
        ?open=${this.open} 
        @toggle=${() => {
          this.dispatchEvent(new CustomEvent(
            this.open ? 'open' : 'close', {bubbles: true, composed: true}));
        }
      }>
        <summary
          tabindex="0"
          aria-label=${this.openButtonAriaLabel}
          @click=${(e: Event) => {
            // Hide the things that should be hidden immediately, rather than
            // waiting for the toggle event (improves the animation). We take
            // over the hiding, so `preventDefault()` is needed.
            e.preventDefault();
            this.open = !this._detailsRef.value!.open;
          }}
        >
          <menu
            role="tablist"
            class="tablist ${this.open ? '' : 'hidden'}"
            aria-label=${this.tabListAriaLabel}
          >
            ${this.tabLabels.map((tab, i) => this._renderTab(tab, i))}
          </menu>
        </summary>
        <div class="panels"
          ${ref(this._panelsWrapperRef)}
        >
          ${
            this._allPanelContents.map((nodes, i) => html`
              <section
                id="panel${i}"
                ?hidden=${this._hiddenTabs.includes(this.tabLabels[i])}
                tabindex="0"
                role="tabpanel"
                aria-labelledby="tab${i}"
                class="panel ${this.selectedTab === i ? '' : 'hidden'}"
              >
                ${nodes}
              </section>
            `)
          }
          <slot @slotchange=${(event: Event) => {
            // NB: We get a second slotchange event after the panels have
            // been absorbed (as a result of having done so)
            if (this.tabLabels.length) {
              return;
            }
            this.tabLabels = this._panelEls.map(panel => panel.tabLabel);
            if (this._panelEls[0]?.icon) {
              this._tabIcons = this._panelEls.map((panel, i) => {
                panel.id = `panel${i}`;
                if (panel.icon) {
                  return panel.icon;
                } else {
                  throw new Error(`panel '${panel.tabLabel}' icon missing`);
                }
              });
            }
            this._panelEls.forEach(panel => {
              if (panel.hidden) {
                this.hide(panel.tabLabel);
              }
            });
            // `aria-controls`, which is set on the tabs, needs an ID. 
            // If we keep the `fizz-tab-panel`s, we can't refer to the ID
            // of anything in the shadow DOM; we could set document-global IDs
            // on the `fizz-tab-panel` elements themselves, but it's nicer to
            // have a local ID. So, we simply suck out their content and
            // create new shadow DOM elements here, with nice encapsulated IDs
            // that `aria-controls` can use.
            // However, we can't actually be certain that all of the fizz-tab-panels
            // will have actually rendered when we get the slotchange event.
            // If they haven't, we have to wait for them to do so in order to
            // retrieve their contents. 
            if (!this._panelEls.map(p => p.hasUpdated).every(b => b)) {
              const notUpdated = this._panelEls.filter(p => !p.hasUpdated);
              notUpdated.forEach(p => 
                p.addEventListener('firstupdate', (e: Event) => {
                  e.stopPropagation();
                  if (notUpdated.map(p => p.hasUpdated).every(b => b)) {
                    this._absorbPanels();
                  }
                }, {once: true}));
            } else {
              this._absorbPanels();
            }
          }}></slot>
        </div>
      </details>
    `;    
  }

}

declare global {

  interface HTMLElementTagNameMap {
    'fizz-tab-details': TabDetails;
  }

}