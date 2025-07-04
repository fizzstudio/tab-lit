
import { styles } from './styles';

import markerIcon from './assets/info-icon.svg';

import { LitElement, html, css, nothing, type PropertyValueMap, unsafeCSS } from 'lit';
import { property, queryAssignedElements, customElement } from 'lit/decorators.js';

/** 
 * A details/summary element.
 * @public 
 */
@customElement('fizz-details')
export class Details extends LitElement {
  private details?: HTMLDetailsElement;

  @property({type: Boolean})
  open = false;

  @queryAssignedElements({slot: 'contents'})
  contents!: HTMLElement[];

  static styles = [
    styles,
    css`
      :host {
        display: block;
      }
      details {
        /* Only shows up at the corners of the content area */
        background: var(--background, var(--themeColor));
        border-radius: var(--border-radius, 0.15rem);
        border: 1px solid var(--background, var(--border, var(--themeColor)));
      }
      summary {
        background: var(--background, var(--themeColor));
        color: var(--color, var(--themeContrastColor));
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
        margin-top: 1px;
        margin-right: 2px;
        content: '';
        background-color: var(--summary-marker-color, var(--themeContrastColor));
        mask-image: var(--summary-marker, url(${unsafeCSS(markerIcon)}));
        mask-size: cover;
        cursor: pointer;
      }
      .content {
        background: var(--content-background, var(--themeContrastColor));
        color: var(--content-color, black);
        padding: var(--content-padding, 0 0.25rem);
        border-radius: var(--border-radius, 0.15rem);
        overflow: var(--content-overflow, hidden);
      }
    `
  ];

  protected render() {
    return html`
      <details ?open=${this.open} @toggle=${
        () => this.dispatchEvent(new CustomEvent(
          this.details!.open ? 'open' : 'close', {bubbles: true, composed: true}))
      }>
        <summary>
          <slot name="summary">Label</slot>
        </summary>
        <div class="content">
          <slot name="content">Contents</slot>
        </div>
      </details>
    `;    
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.details = this.renderRoot.querySelector('details')!;
    this.dispatchEvent(new CustomEvent('firstupdate', {bubbles: true, composed: true}));
  }

  /**
   * Replace the contents with the given elements.
   * @param newElements - Elements.
   */
  setContents(...newElements: HTMLElement[]) {
    this.contents.forEach(el => el.remove());
    newElements.forEach(el => {
      el.slot = 'contents';  // in case not set
      this.append(el);
    });
  }

}

declare global {

  interface HTMLElementTagNameMap {
    'fizz-details': Details;
  }

}