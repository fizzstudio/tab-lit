
import { styles } from './styles';

import { LitElement, html, css, nothing, render, type TemplateResult, PropertyValueMap } from 'lit';
import { property, state, queryAssignedElements, customElement } from 'lit/decorators.js';
import {type Ref, ref, createRef} from 'lit/directives/ref.js';
import { classMap } from 'lit/directives/class-map.js';

/** @public */
export interface ButtonDescriptor {
  /** Label. */
  label: string;
  /** Optional secondary label displayed below the first. */
  subLabel?: string;
  /** Optional label title attribute. */
  title?: string;
  /** Optional icon URL. */
  icon?: string;
}

abstract class BaseRadio {

  private _inputRef = createRef<HTMLInputElement>();

  constructor(
    public key: string, public descriptor: ButtonDescriptor, 
    public checked: boolean, public type: 'plain' | 'icon',
    public group: RadioGroup
  ) {
  }

  get input() {
    return this._inputRef.value!;
  }

  protected classMap(): {[className: string]: any} {
    return {[this.type]: true};
  }
  
  render() {
    return html`
      <label class=${classMap(this.classMap())} title=${this.descriptor.title ?? nothing} for=${this.key}>
        <input
          ${ref(this._inputRef)}
          id=${this.key}
          type="radio"
          name="radio"
          .checked=${this.checked}
          @change=${(e: Event) => this.group.dispatchEvent(
            new CustomEvent('select', {bubbles: true, composed: true, detail: this.key}))}
        />
        ${this.content()}
      </label>
    `;
  }

  abstract content(): TemplateResult;

}

/** 
 * Vanilla radio button.
 */
class Radio extends BaseRadio {
  
  static styles = css`
    label.plain {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 0.25rem;
    }
    label.plain.layout-compress {
      flex-direction: column;
      gap: 0;
    }
    label.plain span {
      text-align: center;
    }
  `;

  constructor(
    key: string, descriptor: ButtonDescriptor, 
    checked: boolean,
    group: RadioGroup
  ) {
    super(key, descriptor, checked, 'plain', group);
  }

  protected classMap() {
    const cm = super.classMap();
    cm[`layout-${this.group.layout}`] = true;
    return cm;
  }

  content() {
    return html`
      <span class="main">
        ${this.descriptor.label}
      </span>
      ${this.descriptor.subLabel ? html`
        <span class="sub">${this.descriptor.subLabel}</span>
      ` : ''}
    `;
  }

}

/** 
 * Tile-style radio button with icon.
 */
class IconRadio extends BaseRadio {
    
  static styles = css`
    label.icon {
      position: relative;
      height: 4rem;
      width: 4rem;
    }
    img {
      width: 3.2rem;
      background: inherit;
    }
    label.icon input {
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      margin: 0;
      cursor: pointer;
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 0.25rem;
      width: 100%;
      height: 100%;
      border: 2px solid var(--themeColorLight, unset);
      border-radius: 5px;
      padding: 0.5rem;
      transition: transform 300ms ease;
    }
    label.icon span {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 550;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--themeTextColor, unset);
    }
    label.icon input:checked + .tile {
      background-color: var(--themeColorLight, unset);
      border: 2px solid var(--themeColorLight, unset);
      color: var(--themeTextColor, unset);
      font-weight: 700;
      transform: scale(1.1, 1.1);
    }
    label.icon input:checked + .tile span {
      color: var(--themeTextColor, unset);
      background-color: var(--themeColorLight, unset);
    }
  `;

  constructor(
    key: string, descriptor: ButtonDescriptor, 
    checked: boolean,
    group: RadioGroup
  ) {
    super(key, descriptor, checked, 'icon', group);
  }

  content() {
    return html`
      <div class="tile">
        ${this.descriptor.icon ? html`
          <img src=${this.descriptor.icon} alt="">
        ` : ''}
        <span>
          ${this.descriptor.label}
          ${this.descriptor.subLabel ? html`<br>${this.descriptor.subLabel}` : ''}
        </span>
      </div>
    `;
  }

}

/** 
 * Radio button group.
 * @public 
 */
@customElement('fizz-radiogroup')
export class RadioGroup extends LitElement {

  /** Properties of each button, indexed by key. */
  @property({type: Object})
  buttons: {[key: string]: ButtonDescriptor} = {};

  /** Key of checked button. */
  @property()
  selected!: string;

  /** Layout mode. */
  @property()
  layout: 'horiz' | 'compress' | 'vert' = 'horiz';

  /** Enable wrapping. */
  @property({type: Boolean})
  wrap = false;

  private radios: {[key: string]: BaseRadio} = {};
  
  static styles = [
    styles,
    css`
      :host * {
        box-sizing: border-box;
      }
      .wrapper {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
      }
      .wrapper.vert {
        flex-direction: column;
        align-items: flex-start;
        width: min-content;
        margin-left: auto;
        margin-right: auto;
      }
      .wrapper.wrap {
        flex-wrap: wrap;
      }
      fieldset {
        border: var(--border, none);
        padding: 0;
        margin: 0;
      }
      legend {
        border-radius: var(--legend-border-radius, 0.15rem);
        padding: 0.25rem 0.5rem;
        margin-left: auto;
        margin-right: auto;
        background: var(--legend-background, unset);
        color: var(--legend-color, unset);
      }
    `,
    Radio.styles,
    IconRadio.styles
  ];

  /*protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.dispatchEvent(
      new CustomEvent('radiofirstupdate', {
        bubbles: true, 
        composed: true
      }));
  }*/

  connectedCallback() {
    super.connectedCallback();
    this.selected ??= Object.keys(this.buttons)[0];
  }

  protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    // The `checked` properties need to get updated when the selection changes.
    // This is the effect clicking a button has. Re-rendering the DOM with
    // changed `checked` attributes doesn't appear to be enough, which I suspect
    // has to do with the way Lit updates the DOM. 
    if (changedProperties.has('selected')) {
      for (const [key, radio] of Object.entries(this.radios)) {
        radio.input.checked = key === this.selected;
      }
    }
  }

  protected render() {
    const ctor = this.buttons[Object.keys(this.buttons)[0]].icon ?
      IconRadio : Radio;
    this.radios = {};
    for (const [key, desc] of Object.entries(this.buttons)) {
      this.radios[key] = new ctor(key, desc, key === this.selected, this);
    }
    const classes = {
      wrapper: true,
      [this.layout]: true,
      wrap: this.wrap
    };
    return html`
      <fieldset>
        <legend>
          <slot name="legend"></slot>
        </legend>
        <div class=${classMap(classes)}>
          ${
            Object.entries(this.radios).map(([key, radio]) => radio.render())
          }
        </div>
      </fieldset>
    `;
  }

}

declare global {

  interface HTMLElementTagNameMap {
    'fizz-radiogroup': RadioGroup;
  }

}