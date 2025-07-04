
import { styles } from './styles';

import {LitElement, html, css, nothing, type PropertyValueMap} from 'lit';
import {property, customElement} from 'lit/decorators.js';

type InputType = 'number' | 'text';

interface InputDescriptor {
  label: string;
  type?: InputType;
  value?: string;
  placeholder?: string;
  size?: number;
  min?: number;
  max?: number;
}

/**
 * Populates a set of text inputs in a `fieldset` element. 
 * Provides a slot for legend content.
 * @public 
 * */
@customElement('fizz-textfieldset')
export class TextFieldSet extends LitElement {
  //private refs = new Map<string, Ref<HTMLInputElement>>();

  /** Properties of each text input. */
  @property({type: Object})
  inputDescriptors: {[key: string]: InputDescriptor} = {};

  static styles = [
    styles,
    css`
      :host {
        display: block;
      }
      fieldset {
        display: flex;
        flex-direction: column;
        border-radius: var(--border-radius, 0.15rem);
        border-style: solid;
        border-width: 1px;
        border-color: var(--fieldset-border-color, var(--themeColor));
        color: var(--color, black);
        padding: 1rem;
        align-items: stretch;
      }
      legend {
        border-radius: var(--legend-border-radius, 0.15rem);
        padding: 0.25rem 0.5rem;
        background: var(--legend-background, var(--themeColor));
        color: var(--legend-color, var(--themeExtraColor));
      }
      label {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
      }
      input {
        margin-left: 0;
        background: var(--input-background, white);
      }
    `
  ];

  /*private ref(key: string) {
    console.log(`this.ref("${key}")`);
    if (this.refs.has(key)) {
      console.log('found ref');
      return this.refs.get(key);
    } else {
      const r = createRef<HTMLInputElement>();
      console.log('new ref:', r);
      this.refs.set(key, r);
      return r;
    }
  }*/

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.dispatchEvent(new CustomEvent('firstupdate', {bubbles: true, composed: true}));
  }

  render() {
    // NB: `input` is fired when the content of a field changes;
    // `change` is fired when enter is pressed or focus is lost
    // after content has changed
    return html`
      <fieldset>
        <legend>
          <slot name="legend"></slot>
        </legend>
        <slot name="before"></slot>
        ${
          Object.entries(this.inputDescriptors).map(([key, desc]) => html`
            <label for=${key.toLowerCase()}>
              ${desc.label}
              <input 
                id=${key.toLowerCase()} 
                type=${desc.type ?? 'text'}
                value=${desc.value ?? nothing} 
                placeholder=${desc.placeholder ?? nothing}
                size=${desc.size ?? nothing}
                min=${desc.min ?? nothing}
                max=${desc.max ?? nothing}
                @input=${(e: Event) => this.dispatchEvent(
                  new CustomEvent('edit', {bubbles: true, composed: true}))}
                @change=${(e: Event) => this.dispatchEvent(
                  new CustomEvent('commit', {bubbles: true, composed: true}))}
              />
            </label>
          `)
        }
        <slot name="after"></slot>
      </fieldset>
    `;
  }

  private getInputs() {
    const inputs: {[key: string]: HTMLInputElement} = {};
    for (const key of Object.keys(this.inputDescriptors)) {
      inputs[key] = this.renderRoot.querySelector<HTMLInputElement>(`#${key.toLowerCase()}`)!;
    }
    return inputs;
  }

  /**
   * Determine whether all text fields are set to a value or not.
   * @returns Whether all fields have non-empty values.
   */
  isAllFieldsSet(): boolean {
    return Object.values(this.getInputs()).every(val => val.value);
  }

  /**
   * Retrieve the current values of all text fields.
   * @returns Mapping of field keys to string values.
   */
  fieldValues() {
    const vals: {[key: string]: string} = {};
    for (const [key, input] of Object.entries(this.getInputs())) {
      vals[key] = input.value;
    }
    return vals;
  }

  /**
   * Set the values of all text fields.
   * @param values - Mapping of field keys to new values.
   */
  setFieldValues(values: {[key: string]: string}) {
    const inputs = this.getInputs();
    for (const [key, value] of Object.entries(values)) {
      inputs[key].value = value;
    }
  }
}

declare global {

  interface HTMLElementTagNameMap {

    'fizz-textfieldset': TextFieldSet;

  }

}