
import { LitElement, html, css, nothing, type PropertyValueMap } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { type Ref, ref, createRef } from 'lit/directives/ref.js';

import dialogX from './dialog_x.svg';

/** 
 * The foundation for interactive dialogs -- a simple overlay
 * with an optional 'X' close button.
 * Provides a single slot for content.
 * @public 
 */
@customElement('fizz-overlay')
export class Overlay extends LitElement {
  private dialogRef = createRef<HTMLDialogElement>();
  private xButtonRef = createRef<HTMLImageElement>();
  private promise?: Promise<string>;
  private resolve?: (value: string) => void;
  private onDocumentClick: (e: MouseEvent) => void;
  onCancel?: () => Promise<{close: boolean; value?: string}>;

  /**
   * Enables or disables ways in which the user can cancel (i.e., hide)
   * the overlay. 
   * key = Hitting the Esc key
   * button = Clicking the X button
   * click = Clicking outside of the overlay
   */
  @property({type: Object})
  cancel = {key: true, button: true, click: true};

  /**
   * Whether to display the underlying dialog as modal.
   */
  @property({type: Boolean})
  modal = false;

  /**
   * X location of top left in viewport coordinates (non-modal only).
   */
  @property()
  x = '0';

  /**
   * Y location of top left in viewport coordinates (non-modal only).
   */
  @property()
  y = '0';

  @property()
  width?: string;

  @property()
  height?: string;

  @property({type: Number})
  tx = 0;

  @property({type: Number})
  ty = 0;

  /** Whether the overlay is initially visible. */
  @property({type: Boolean})
  open = false;

  static styles = css`
    dialog {
      padding: 0;
      border: none;
      box-shadow: 0 0 40px rgb(127, 127, 127);
      border-radius: var(--border-radius, 0.15rem);
      border: none;
    }
    dialog .content {
      position: relative;
      background: var(--theme-color-constrast, ghostwhite);
      border: solid var(--theme-color) 1px;
      border-radius: var(--border-radius, 0.15rem);
      min-width: 15rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
    }
    button.close-x {
      position: absolute;
      right: 0.25rem;
      top: 0.25rem;
      /*height: calc(100% - 0.5rem); // titlebar height minus padding */
      padding: 0;
      background: transparent;
      border: 0;
    }
    button.close-x img {
      height: 1.3em;
    }
    button.close-x span {
      display: none;
    }
  `;

  constructor() {
    super();
    this.onDocumentClick = e => {
      if (!this.isWithinRect(e.clientX, e.clientY, this.dialogRef.value!.getBoundingClientRect())) {
        this.didCancel(e);
      }
    };
  }

  private isWithinRect(x: number, y: number, rect: DOMRect): boolean {
    if (x < rect.left || x > rect.right ||
        y < rect.top || y > rect.bottom) {
      return false;
    }
    return true;
  }

  render() {
    const dialogStyles: {[key: string]: any} = this.modal ? 
      { translate: `${this.tx}px ${this.ty}px;` } : 
      {
        left: this.x,
        top: this.y,
        margin: 0
      };
    if (this.width) {
      dialogStyles.width = this.width;
    }
    if (this.height) {
      dialogStyles.height = this.height;
    }
    return html`
      <dialog 
        ${ref(this.dialogRef)} 
        @cancel=${this.didCancel} 
        style=${styleMap(dialogStyles)}
      >
        <div class="content">
          ${this.cancel.button ?
            html`
              <button type="button" class="close-x" @click=${this.didCancel}>
                <img src=${dialogX} alt="Dialog close button">
                <span>Close</span>
              </button>
              ` : ''
          }
          <slot></slot>
        </div>
      </dialog>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if (this.open) {
      this.show();
    }
    this.dispatchEvent(new CustomEvent('firstupdate', {bubbles: true, composed: true}));
  }

  private async didCancel(e: Event) {
    // NB: `e` will either be a 'click' event (if the X button was clicked,
    // or the user clicked outside the overlay)
    // or a 'cancel' event (if Esc was pressed)
    e.preventDefault();
    // NB: We won't even get called when clicking outside the dialog 
    // unless this.cancel.click is true
    if ((e.type === 'cancel' && !this.cancel.key) ||
        (e.type === 'click' && e.target === this.xButtonRef.value && !this.cancel.button)) {
      return;
    }
    if (this.onCancel) {
      const oc = await this.onCancel!();
      if (oc.close) {
        this.close(oc.value);
      }
    } else {
      this.close();
    }
  }

  /** 
   * Show the overlay.
   * @param afterShow - A function that will be called immediately after showing the overlay. 
   * Can be useful if awaiting this method.
   * @returns Promise of string return value (typically the tag of the button
   * that caused the closure).
   * @remarks
   * This method can be awaited until the overlay is closed. 
   */
  show(afterShow?: () => void): Promise<string> {
    if (this.dialogRef.value!.open) {
      return this.promise!;
    }
    if (this.modal) {
      this.dialogRef.value!.showModal();
    } else {
      this.dialogRef.value!.show();
    }
    if (this.cancel.click) {
      // Add the listener on the next event cycle so if the overlay was shown
      // via a click (e.g., on a button), that click won't immediately trigger
      // the overlay to close
      setTimeout(() => 
        document.addEventListener('click', this.onDocumentClick));
    }
    this.promise = new Promise(resolve => {
      this.resolve = resolve;
      afterShow?.();
    });
    return this.promise;
  }

  /**
   * Close the overlay.
   * @param value - Value to resolve the promise with.
   */
  close(value = 'ui_default_close') {
    this.dialogRef.value!.close();
    if (this.cancel.click) {
      document.removeEventListener('click', this.onDocumentClick);
    }
    this.resolve!(value);
  }

}

/**
 * Describes a single dialog button.
 * @public
 */
export interface DialogButtonInfo {
  /** Unique string tag identifying the button */
  tag: string;
  /** Text displayed on the button */
  text: string;
  /** Optional dialog close hook function.*/
  closeHook?: DialogButtonCloseHook;
  /** Whether the button is initially disabled */
  disabled?: boolean;
}

/**
 * Hook function called when a button is clicked 
 * that determines whether the dialog should close or not.
 * Useful for, e.g., popping up another dialog to confirm some
 * change made in the first dialog.
 * @public
 */
export type DialogButtonCloseHook = (tag: string) => Promise<boolean>;

/**
 * Base class for purpose-specific dialogs. Includes a title bar
 * and customizable buttons. Provides a single slot for content.
 * @public 
 */
@customElement('fizz-dialog')
export class Dialog extends LitElement {
  protected titlebar?: HTMLDivElement;
  protected btnsWrapper?: HTMLDivElement;
  protected overlay?: Overlay;
  private prevX = 0;
  private prevY = 0;
  private tx = 0;
  private ty = 0;
  private moveListener: (e: PointerEvent) => void;

  /**
   * Displayed dialog title.
   */
  @property()
  title = 'TITLE';

  /**
   * Buttons to close the dialog with specific intents.
   */
  @property({type: Array})
  buttons: DialogButtonInfo[] = [
    { tag: "cancel", text: "Cancel" },
    { tag: "okay", text: "Okay" }
  ];

  static styles = css`
    .title {
      /*background: darkblue;
      color: white;*/
      font-weight: bold;
      align-self: stretch;
      text-align: center;
      padding: 0.25rem;
      margin-bottom: 0.5rem;
      border-radius: var(--border-radius, 0.15rem);
      /* If I leave this out, the title content area ends up every so slightly
         taller than the button image.*/
      height: 1rlh;
    }
    .buttons {
      padding: 0.5rem;
      display: flex;
      gap: 0.5rem;
    }


    .buttons button {
      --themeColor: purple;
      --themeContrastColor: ghostwhite;

      margin: 0.2rem;
      background-color: var(--themeColor);
      color: var(--themeContrastColor);
      border: thin solid var(--themeColor);
      border-radius: 0.2em;
      padding: 0.2em 0.4em;
    }
  `;

  constructor() {
    super();
    this.moveListener = this.move.bind(this);
  }

  render() {
    const cancel = JSON.stringify({key: true, button: true, click: false});
    return html`
      <fizz-overlay modal cancel=${cancel}>
        <div
          class="title"
          @pointerdown=${this.titlebarPointerDown}
          @pointerup=${this.titlebarPointerUp}
        >
          ${this.title}
        </div>
        <slot></slot>
        <div class="buttons">
          ${
            this.buttons.map(b => html`
            <button id=${b.tag} ?disabled=${b.disabled} @click=${this.btnClicked}>
              ${b.text}
            </button>
            `)
          }
        </div>
      </fizz-overlay>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.titlebar = this.renderRoot.querySelector('.title')!;
    this.btnsWrapper = this.renderRoot.querySelector('.buttons')!;
    this.overlay = this.renderRoot.querySelector('fizz-overlay')!;
    this.overlay!.onCancel = async () => await this.didCancel();
  }

  private titlebarPointerDown(e: PointerEvent) {
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this.titlebar!.addEventListener('pointermove', this.moveListener);
    this.titlebar!.setPointerCapture(e.pointerId);
  }

  private titlebarPointerUp(e: PointerEvent) {
    this.titlebar!.removeEventListener('pointermove', this.moveListener);
    this.titlebar!.releasePointerCapture(e.pointerId);
  }

  private move(e: PointerEvent) {
    this.tx += e.clientX - this.prevX;
    this.prevX = e.clientX;
    this.ty += e.clientY - this.prevY;
    this.prevY = e.clientY;
    this.overlay!.tx = this.tx;
    this.overlay!.ty = this.ty;
  }

  private async didCancel() {
    const cancelDesc = this.buttonInfo('cancel');
    if (cancelDesc) {
      const hook = cancelDesc.closeHook;
      const shouldClose = hook ? await hook('cancel') : true;
      return {close: shouldClose, value: 'cancel'};
    } else {
      return {close: true};
    }
  }

  /**
   * Get the disabled state of all buttons.
   * @returns Mapping of button tags to disabled states.
   */
  getButtonsDisabled(): { [tag: string]: boolean } {
    const state: { [tag: string]: boolean } = {};
    for (const { tag } of this.buttons) {
      state[tag] = this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`)!.disabled;
    }
    return state;
  }

  /**
   * Set the disabled state of specific buttons.
   * @param state - Mapping of button tags to desired disabled values.
   * All buttons will be disabled if this is omitted.
   * @returns Previous button disabled states if called with no argument.
   */
  setButtonsDisabled(state?: { [tag: string]: boolean }) {
    if (state) {
      for (const [tag, disabled] of Object.entries(state)) {
        this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`)!.disabled = disabled;
      }
    } else {
      const curState = this.getButtonsDisabled();
      this.renderRoot.querySelectorAll<HTMLButtonElement>('button').forEach(b => {
        b.disabled = true;
      });
      return curState;
    }
  }

  private buttonInfo(tag: string) {
    return this.buttons.find(info => info.tag === tag);
  }

  /**
   * Get the button corresponding to a specific tag..
   * @param tag - Button tag.
   * @returns Button element (or null).
   */
  button(tag: string): HTMLButtonElement | null {
    return this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`);
  }

  private async btnClicked(e: Event) {
    const btnState = this.setButtonsDisabled();
    const desc = this.buttonInfo((e.target as HTMLButtonElement).id);
    const shouldClose = desc!.closeHook
      ? await desc!.closeHook(desc!.tag)
      : true;
    if (shouldClose) {
      this.overlay!.close(desc!.tag);
    }
    this.setButtonsDisabled(btnState);
  }

  /** 
   * Show the dialog.
   * @param afterShow - A function that will be called immediately after showing the dialog. 
   * Can be useful if awaiting this method.
   * @returns Promise of string return value (typically the tag of the button
   * that caused the closure).
   * @remarks
   * This method can be awaited until the dialog is closed. 
   */
  show(afterShow?: () => void): Promise<string> {
    for (const { tag, disabled } of this.buttons) {
      this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`)!.disabled = !!disabled;
    }
    this.overlay!.tx = 0;
    this.overlay!.ty = 0;
    this.tx = 0;
    this.ty = 0;
    this.prevX = 0;
    this.prevY = 0;
    return this.overlay!.show(afterShow);
  }
}

/**
 * Simple dialog that displays a message and a single
 * button to close the dialog. 
 * @public 
 */
@customElement('fizz-msg-dialog')
export class MessageDialog extends LitElement {
  private dialog?: Dialog;

  /**
   * Close button text.
   */
  @property()
  btnText = 'Okay';

  /**
   * Message text.
   */
  @property()
  text = 'Your message here';

  render() {
    const buttons = JSON.stringify([{tag: 'cancel', text: this.btnText}]);
    return html`
      <fizz-dialog title="Message" buttons=${buttons}>
        <div class="text">${this.text}</div>
      </fizz-dialog>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.dialog = this.renderRoot.querySelector('fizz-dialog')!;
  }

  /**
   * Show the dialog
   * @param text - Optional message text.
   */
  async show(text?: string) {
    if (text) {
      this.text = text;
    }
    await this.dialog!.show(() => this.dialog!.button('cancel')!.focus());
  }
}

/**
 * Dialog that displays some sort of request for confirmation and 
 * a pair of buttons to confirm or not.
 * @public 
 */
@customElement('fizz-conf-dialog')
export class ConfirmDialog extends LitElement {
  private dialog?: Dialog;

  /** 
   * Cancel button text. 
   */
  @property()
  cancelText = 'Cancel';

  /**
   * Confirm (okay) button text.
   */
  @property()
  okayText = 'Okay';

  /**
   * Message text.
   */
  @property()
  text = 'Text';

  render() {
    const buttons = JSON.stringify([
      {tag: 'cancel', text: this.cancelText},
      {tag: 'okay', text: this.okayText}
    ]);
    return html`
      <fizz-dialog title="Confirm" buttons=${buttons}>
        <div class="text">${this.text}</div>
      </fizz-dialog>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    this.dialog = this.renderRoot.querySelector('fizz-dialog')!;
  }

  /**
   * Show the dialog.
   * @param text - Message text.
   * @param cancelText - Cancel button text.
   * @param okayText - Confirm (okay) button text.
   * @returns Promise of boolean indicating whether the user confirmed or cancelled.
   */
  async show(text?: string, cancelText?: string, okayText?: string): Promise<boolean> {
    if (text) {
      this.text = text;
    }
    if (cancelText) {
      this.cancelText = cancelText;
    }
    if (okayText) {
      this.okayText = okayText;
    }
    const tag = await this.dialog!.show(() => this.dialog!.button('okay')!.focus());
    return tag === 'okay';
  }
}

declare global {

  interface HTMLElementTagNameMap {
    'fizz-overlay': Overlay;
    'fizz-dialog': Dialog;
    'fizz-msg-dialog': MessageDialog;
    'fizz-conf-dialog': ConfirmDialog;
  }

}