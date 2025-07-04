import { LitElement, html, css, nothing, type PropertyValueMap } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Overlay } from './dialog';
import icon from './infopopup.svg';

/** 
 * A question icon that triggers the display of an informational pop-up.
 * @public 
 */
@customElement('fizz-infopopup')
export class InfoPopup extends LitElement {
  private overlay?: Overlay;
  private icon?: HTMLButtonElement;

  static styles = css`
    button.icon {
      padding: 0;
      background: none;
      color: white;
      padding: 0;
      border: 0;
    }
    button.icon img {
      height: 1rem;
      vertical-align: bottom;
    }
    button.icon:hover {
    }
    button.icon span {
        display: none;
    }
  `;

  render() {
    return html`
      <button type="button" class="icon" @click=${this.onIconClick}>
        <img src=${icon} alt="Info pop-up icon">
        <span>Get info about this item</span>
      </button>
      <fizz-overlay>
        <slot></slot>
      </fizz-overlay>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.overlay = this.renderRoot.querySelector('fizz-overlay')!;
    this.icon = this.renderRoot.querySelector('.icon')!;
    this.dispatchEvent(new CustomEvent('firstupdate', {bubbles: true, composed: true}));
  }

  onIconClick(e: Event) {
    const bounds = this.icon!.getBoundingClientRect();
    this.overlay!.x = `calc(${bounds.x}px + 0.5rem)`;
    this.overlay!.y = `calc(${bounds.y}px + 0.5rem)`;
    this.overlay!.show();
  }

}

declare global {

  interface HTMLElementTagNameMap {
    'fizz-infopopup': InfoPopup;
  }

}