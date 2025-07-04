
import { styles } from './styles';

import { LitElement, html, css, nothing, render, type PropertyValueMap } from 'lit';
import { property, state, queryAssignedElements, customElement } from 'lit/decorators.js';
import {type Ref, ref, createRef} from 'lit/directives/ref.js';

/** 
 * Slider bar for modifying a value.
 * @public 
 */
@customElement('fizz-slider')
export class Slider extends LitElement {

  @property()
  label = 'LABEL';

  @property({type: String})
  key = 'slider';

  @property({type: Number})
  set value(value: number) {
    this._value = value;
  }
  get value() {
    return this._value;
  }

  @property({type: Boolean})
  showValue = false;

  @property({type: Boolean})
  compact = false;

  @property({type: Number})
  min = 0;

  @property({type: Number})
  max = 100;

  @property({type: Number})
  lowBound?: number;

  @property({type: Number})
  highBound?: number;

  @property({type: Number})
  step = 1;

  @property({type: Boolean})
  percent = false;

  private inputRef = createRef<HTMLInputElement>();
  private _value = 50;

  static styles = [
    styles,
    css`
      div {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        align-items: flex-start;
      }
      div.compact {
        flex-direction: column;
        gap: 0;
      }
      input {
        width: var(--width, unset);
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    this.lowBound ??= this.min;
    this.highBound ??= this.max;
  }

  private formatLabel() {
    const val = this.value;
    return this.percent ? `${Math.round(val*100)}%` : `${val}`;
  }

  // protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
  //   this.dispatchEvent(
  //     new CustomEvent('sliderfirstupdate', {
  //       bubbles: true, 
  //       composed: true
  //     }));
  // }

  /*protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if (changedProperties.has('value')) {
      this.inputRef.value!.value = this.value.toString();
    }
  }*/

  protected render() {
    return html`
      <div
        class=${this.compact ? 'compact' : nothing}
      >
        <span>
          <label for=${this.key}>${this.label}:</label> 
          ${this.showValue && this.compact ? html` 
            <output for=${this.key}>
              ${this.formatLabel()}
            </output>
          ` : ''}
        </span>
        <input
          ${ref(this.inputRef)} 
          id=${this.key}
          type="range" 
          min=${this.min} max=${this.max} step=${this.step}
          .value=${this.value}
          @input=${() => {
            const newValue = +this.inputRef.value!.value;
            if (newValue < this.lowBound! || newValue > this.highBound!) {
              this.inputRef.value!.value = this._value.toString();
            } else {
              this._value = +this.inputRef.value!.value;
              this.dispatchEvent(new CustomEvent(
                'update', {bubbles: true, composed: true, detail: this._value}));
            }
          }}
        >
        ${this.showValue && !this.compact ? html` 
            <output for=${this.key}>
              ${this.formatLabel()}
            </output>
          ` : ''}
      </div>
    `;
  }

}

declare global {

  interface HTMLElementTagNameMap {
    'fizz-slider': Slider;
  }

}