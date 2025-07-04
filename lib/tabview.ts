
import { styles } from './styles';

import { LitElement, html, css, nothing, render, type PropertyValues } from 'lit';
import { property, state, queryAssignedElements, queryAssignedNodes, customElement } from 'lit/decorators.js';
import {type Ref, ref, createRef} from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';

/**
 * Tab label display mode.
 * @public
 */
export type TabLabelMode = 'labels' | 'icons' | 'icons-labels' | 'icons-current-label';

/** 
 * Tab list for a tabbed panel view.
 * @public 
 */
@customElement('fizz-tab-list')
export class TabList extends LitElement {

  @property({type: Boolean})
  inline = false;

  @property()
  mode: TabLabelMode = 'labels';

  @state()
  tabs: string[] = [];

  @state()
  icons: string[] = [];

  private _panelGroup!: TabPanelGroup;

  static styles = [
    styles,
    css`
      :host {
        display: block;
      }
      .tablist {
        display: flex;
        background: var(--background, var(--themeColor));
        padding: var(--padding, 0.25rem 0.25rem 0 0.25rem);
        border-radius: var(--border-radius, 0.15rem 0.15rem 0 0);
        gap: var(--tab-gap, 0);
        font-size: var(--tab-font-size, unset);
        font-weight: var(--tab-font-weight, unset);
        margin: 0;
      }
    `
  ];

  private tabListRef: Ref<HTMLDivElement> = createRef();
  private tabRefs: Ref<Tab>[] = [];

  set panelGroup(panelGroup: TabPanelGroup) {
    if (this._panelGroup) {
      throw new Error('panel group element is already set');
    }
    this._panelGroup = panelGroup;
  }

  set currentPanel(index: number) {
    this.tabRefs.forEach((r, i) => {
      r.value!.selected = i === index;
    });
    this._panelGroup.currentPanel = index;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.inline) {
      this.style.display = 'inline-block';
    }
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.get('tabs')) {
      this.currentPanel = 0;
    }
  }

  keyListener(event: CustomEvent) {
    console.log('keyListener', event.detail.key)
    console.log('target', event.target)
    console.log('currentTarget', event.currentTarget)
  }

  // @keydown=${this.keyListener}


  render() {
    const styles = {
      background: 'none', 
      padding: '0',
      'flex-grow': 1,
    };
    return html`
      <ul
        ${ref(this.tabListRef)} 
        role="tablist"
        class="tablist"
        style=${this.inline ? styleMap(styles) : nothing}
        @tabclick=${(event: CustomEvent) => {
          this.currentPanel = event.detail;
        }}
        @keynav=${(event: CustomEvent) => {
          this.keyListener(event);
        }}
      >
        ${
          this.tabs.map((tab, i) => {
            this.tabRefs[i] ??= createRef();
            return html`
              <fizz-tab 
                ${ref(this.tabRefs[i])} 
                .mode=${this.mode}
                .icon=${this.icons[i]}
                index=${i}
              >
                <span>${tab}</span>
              </fizz-tab>
            `;
          })
        }
      </ul>
    `;
  }

}

/** 
 * Panel group for a tabbed panel view.
 * @public 
 */
@customElement('fizz-tab-panel-group')
export class TabPanelGroup extends LitElement {

  @queryAssignedElements()
  private panelEls!: TabPanel[];

  private tabListEl!: TabList;
  private _currentPanel = 0;

  static styles = [
    styles,
    css`
      :host {
        display: block;
      }
      .panels {
        border-radius: var(--border-radius, 0 0 0.15rem 0.15rem);
      }
    `
  ];

  get numPanels() {
    return this.panelEls.length;
  }

  get currentPanel() {
    return this._currentPanel;
  }

  set currentPanel(index: number) {
    this._currentPanel = index;
    this.panelEls.forEach((p, i) =>
      p.setSelected(i === this._currentPanel)
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.tabListEl = this.findTabList();
    this.tabListEl.panelGroup = this;
  }

  private findTabList() {
    let cursor = this.parentElement;
    while (cursor) {
      const tabListEl = cursor.querySelector('fizz-tab-list');
      if (tabListEl) {
        return tabListEl;
      }
      cursor = cursor.parentElement;
    }
    throw new Error('unable to locate tab list');
  }

  render() {
    return html`
      <div class="panels">
        <slot @slotchange=${(event: Event) => {
          this.tabListEl.tabs = this.panelEls.map(panel => panel.tabLabel);
          if (this.panelEls[0]?.icon) {
            this.tabListEl.icons = this.panelEls.map(panel => {
              if (panel.icon) {
                return panel.icon;
              } else {
                throw new Error(`panel '${panel.tabLabel}' icon missing`);
              }
            });
          }
        }}></slot>
      </div>
    `;
  }

}

/** @public */
@customElement('fizz-tab-panel')
export class TabPanel extends LitElement {

  @property()
  tabLabel: string = 'TAB';

  @property() 
  icon?: string;

  @queryAssignedNodes()
  contentNodes!: Node[];

  @state()
  private visible = false;

  private panelRef = createRef<HTMLDivElement>();
  //private slotRef = createRef<HTMLSlotElement>();

  static styles = [
    styles,
    css`
      :host {
        display: block;
      }
      .panel {
        border-radius: var(--border-radius, 0 0 0.15rem 0.15rem);
      }
    `
  ];

  // get slottedNodes() {
  //   return this.slotRef.value!.assignedNodes();
  // }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.dispatchEvent(new CustomEvent('firstupdate', {bubbles: true, composed: true}));
  }

  render() {
    // console.log('PANEL RENDER', this.tabLabel, this.icon);
    return html`
      <div
        ${ref(this.panelRef)} 
        role="tabpanel"
        tabindex="0"
        class="panel"
        ?hidden=${!this.visible}
      >
        <slot></slot>
      </div>
    `;
  }

  setSelected(selected: boolean) {
    this.visible = selected;
  }

}

/** @public */
@customElement('fizz-tab')
export class Tab extends LitElement {

  @property({type: Number})
  index!: number;

  icon?: string;

  /** @internal */
  @state()
  selected = false;

  @state()
  mode!: TabLabelMode;

  static styles = [
    styles,
    css`
      :host {
        background: none !important;
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
        height: 1.2rem;
        width: 1.2rem;
        vertical-align: middle;
        background-color: currentColor;
        display: inline-block;
        margin-top: -0.5rem;
      }
      [role='tab-delete'] {
        background: var(--color, var(--themeColor));
      }
    `
  ];

  private ref = createRef<HTMLDivElement>();


  private activate(event: Event){ 
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(
        'tabclick', 
        {
          bubbles: true, 
          composed: true, 
          detail: this.index
        }
      )
    );
  }

  private keyListener(event: KeyboardEvent){ 
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(
        'keynav', 
        {
          bubbles: true, 
          composed: true, 
          detail: event
        }
      )
    );
  }

  render() {
    const tabClasses = {
      hidden: this.mode === 'icons' || 
        (this.mode === 'icons-current-label' && !this.selected)
    };
    const iconClasses = {
      icon: this.mode !== 'labels'
    };
    const iconStyles = {
      mask: this.icon ? `url("${this.icon}") no-repeat 50% 50%` : undefined,
      ['mask-size']: 'cover'
    };
    return html`
      <li
        role="presentation"
      >
        <button 
          ${ref(this.ref)}
          role="tab"
          id="tab${this.index}"
          tabindex=${this.selected ? nothing : '-1'}
          aria-selected=${this.selected ? 'true' : 'false'}
          class="tab"
          @keydown=${(event: KeyboardEvent) => {
            this.keyListener(event);
          }}
          @click=${(event: MouseEvent) => this.activate(event)}
        >
          ${this.icon? html`
            <span 
              class=${classMap(iconClasses)} 
              style=${styleMap(iconStyles)}
            >
            </span>
          ` : ''}
          <slot class=${classMap(tabClasses)}>
            TAB LABEL
          </slot>
        </button>
      </li>
    `;
  }

}

declare global {

  interface HTMLElementTagNameMap {
    'fizz-tab-list': TabList,
    'fizz-tab-panel-group': TabPanelGroup,
    'fizz-tab-panel': TabPanel;
    'fizz-tab': Tab;
  }
}