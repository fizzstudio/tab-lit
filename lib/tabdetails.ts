import { styles } from './styles';
import {
  DescriptionPanel, DataPanel, ColorsPanel, ChartPanel,
  AnnotationPanel, ControlsPanel
} from '.';
import '.';
import infoIcon from './assets/info-icon.svg';

import { LitElement, html, css, nothing, type PropertyValueMap, type PropertyValues } from 'lit';
import { property, state, queryAssignedElements, customElement } from 'lit/decorators.js';
import { type Ref, ref, createRef } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeCSS } from 'lit';

/** 
 * The unholy union of a details box and a tab view.
 * @public 
 */
@customElement('fizz-tab-details')
export class TabDetails extends LitElement {
  @property({type: Number}) default = 0;

  @property() tabLabelMode: TabLabelMode = 'labels';

  @property() tabListAriaLabel = 'Tabs';

  @state() tabLabels: string[] = [];
  @state() private tabListVisible = true;
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

  protected _selectedTab!: number;
  protected _tabRefs: Ref<HTMLButtonElement>[] = [];
  protected _panelsWrapperRef = createRef<HTMLDivElement>();
  protected _allPanelContents: Node[][] = [];
  protected _ready = false;

  static styles = [
    styles,
    css`
      :host {
        display: block;
      }

      .tablist-wrapper {
        background: navy;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        margin: 0;
      }

      .tablist {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 0;
        margin: 0;
        padding: 0;
      }

      li {
        list-style-type: none;
        margin: 0;
      }

      .tab {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: var(--padding);
        border: none;
        border-radius: 0;
        background: navy;
        cursor: pointer;
        font-size: var(--tab-font-size);
        font-weight: var(--tab-font-weight);
        margin: 0;
      }

      [role='tab'] {
        color: var(--themeUnselectedTextColor);
      }

      [role='tab'][aria-selected='true'] {
        background: var(--themeExtraColor);
        color: var(--themeTextColor);
        text-decoration: var(--themeSelectedTextDecoration);
        text-underline-offset: 0.25rem;
      }

      .icon {
        height: 1rem;
        width: 1rem;
        vertical-align: middle;
        background-color: currentColor;
        display: inline-block;
      }

      .panels {
        background: var(--themeContrastColor);
        padding: var(--contents-padding);
        margin: 0;
        border-radius: var(--border-radius);
        border: 1px solid var(--themeColor);
      }

      .panel {
        padding: 1rem;
        min-height: 3rem;
      }

      @media screen and (max-width: 600px) {
        .tablist {
          flex-direction: column;
          overflow-y: auto;
          height: 3.5rem;
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
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.dispatchEvent(new CustomEvent('firstupdate', { bubbles: true, composed: true }));
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.get('tabLabels') && this.tabLabels.length) {
      // no-op for now
    }
    if (this._tabRefs.length) {
      this._tabRefs[this.selectedTab].value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (this._allPanelContents.length && !this._ready) {
      this._ready = true;
      this.dispatchEvent(new CustomEvent('ready', { bubbles: true, composed: true }));
    }
  }

  hide(tabName: string) {
    const i = this.tabLabels.indexOf(tabName);
    if (i === -1) {
      throw new Error(`no tab with label '${tabName}'`);
    }
    if (!this._hiddenTabs.includes(tabName)) {
      this._hiddenTabs = [...this._hiddenTabs, tabName];
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
    const iconStyles = {
      mask: this._tabIcons[i]
        ? `url("${this._tabIcons[i]}") no-repeat 50% 50%`
        : undefined,
      ['mask-size']: 'cover'
    };

    const showIcon = this.tabLabelMode === 'icons' || this.tabLabelMode === 'icons-labels' || (this.tabLabelMode === 'icons-current-label' && selected);
    const showLabel = this.tabLabelMode === 'labels' || this.tabLabelMode === 'icons-labels' || (this.tabLabelMode === 'icons-current-label' && selected);

    return html`
      <li role="presentation">
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
          ${showIcon && this._tabIcons[i]
            ? html`<span class="icon" style=${styleMap(iconStyles)}></span>`
            : nothing}
          ${showLabel ? html`<span>${title}</span>` : nothing}
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
      <button
        @click=${() => this.tabListVisible = !this.tabListVisible}
        aria-expanded=${this.tabListVisible}
        aria-controls="tabs-container"
      >
        ${this.tabListVisible ? 'Hide Tabs' : 'Show Tabs'}
      </button>

      ${this.tabListVisible ? html`
        <div id="tabs-container">
          <div class="tablist-wrapper">
            <div
              role="tablist"
              class="tablist"
              aria-label=${this.tabListAriaLabel}
            >
              ${this.tabLabels.map((tab, i) => this._renderTab(tab, i))}
            </div>
          </div>

          <div class="panels" ${ref(this._panelsWrapperRef)}>
            ${this._allPanelContents.map((nodes, i) => html`
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
            `)}
            <slot @slotchange=${(event: Event) => {
              if (this.tabLabels.length) return;

              this.tabLabels = this._panelEls.map(panel => panel.tabLabel);

              if (this._panelEls[0]?.icon) {
                this._tabIcons = this._panelEls.map((panel, i) => {
                  panel.id = `panel${i}`;
                  if (panel.icon) return panel.icon;
                  throw new Error(`panel '${panel.tabLabel}' icon missing`);
                });
              }

              this._panelEls.forEach(panel => {
                if (panel.hidden) this.hide(panel.tabLabel);
              });

              if (!this._panelEls.map(p => p.hasUpdated).every(b => b)) {
                const notUpdated = this._panelEls.filter(p => !p.hasUpdated);
                notUpdated.forEach(p =>
                  p.addEventListener('firstupdate', (e: Event) => {
                    e.stopPropagation();
                    if (notUpdated.map(p => p.hasUpdated).every(b => b)) {
                      this._absorbPanels();
                    }
                  }, { once: true })
                );
              } else {
                this._absorbPanels();
              }
            }}></slot>
          </div>
        </div>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fizz-tab-details': TabDetails;
  }
}
