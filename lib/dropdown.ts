import { LitElement, html, css, nothing, type PropertyValueMap } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { type Ref, ref, createRef } from 'lit/directives/ref.js';

/**
 * A select/options component.
 * @public 
 */
@customElement('fizz-dropdown')
export class Dropdown extends LitElement {

  /** Text for the associated label element. */
  @property()
  label = 'LABEL';

  /** Optional text for the initial descriptive option. */
  @property()
  placeholder?: string;

  /** Options. */
  @property({type: Array})
  options: string[] = [];

  /** Index of initially selected option */
  @property({type: Number})
  selected!: number;

  private selectRef = createRef<HTMLSelectElement>();

  static styles = css`
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.selected === undefined) {
      this.selected = this.placeholder !== undefined ? -1 : 0;
    }
  }

  /*protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.dispatchEvent(new CustomEvent('dropdownfirstupdate', {bubbles: true, composed: true}));
  }*/

  protected optionSelected(optionIndex: number) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: optionIndex, 
        bubbles: true, 
        composed: true
      }));
  }

  render() {
    return html`
      <label>
        ${this.label}
        <select 
          ${ref(this.selectRef)}
          autocomplete="off"
          @change=${(e: Event) => {
            const value = (e.target as HTMLOptionElement).value; 
            this.optionSelected(value === '' ? -1 : +value.slice(3));
          }
        }>
          ${
            this.placeholder ? html`
              <option value="">${this.placeholder}</option>
            ` : ''
          }
          ${
            this.options.map((opt, i) => html`
              <option 
                value="opt${i}" 
                .selected=${i === this.selected}
              >
                ${opt}
              </option>
            `)
          }
        </select>
      </label>
    `;
  }

  get selectedIndex() {
    return this.placeholder !== undefined ? 
      this.selectRef.value!.selectedIndex - 1 : this.selectRef.value!.selectedIndex;
  }

  /**
   * Select a specific option by index.
   * @param index - Index of option to select.
   * @remarks
   * If a placeholder is set, passing -1 as the index will select it.
   */
  select(index: number) {
    const min = this.placeholder ? -1 : 0;
    if (index < min || index >= this.options.length) {
      throw new Error(`invalid selection index '${index}'`);
    }
    this.selectRef.value!.selectedIndex = this.placeholder !== undefined ? index + 1 : index;
    this.optionSelected(index);
  }

}

declare global {

  interface HTMLElementTagNameMap {

    'fizz-dropdown': Dropdown;

  }

}