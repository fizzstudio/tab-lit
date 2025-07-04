
import * as ui from '../lib';
import '../lib';
import tabDescriptionIcon from './tab-description-icon.svg';
import tabDataIcon from './tab-data-icon.svg';
import tabControlsIcon from './tab-controls-icon.svg';
import tabColorsIcon from './tab-colors-icon.svg';

import { html, render } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';


window.addEventListener('load', () => new Demo());

export class Demo {
  constructor() {   
    this.init();
  }
  
  async init() {
    const contentContainer = document.getElementById('content-container')!;

    const tabListRef = createRef<ui.TabList>();
    const tabLabelModes = ['labels', 'icons', 'icons-labels', 'icons-current-label'];
    const radioRef = createRef<ui.RadioGroup>();
    const dropdownRef = createRef<ui.Dropdown>();
    const sliderRef = createRef<ui.Slider>();
    const tabDeetsRef = createRef<ui.TabDetails>();
    const overlayRef = createRef<ui.Overlay>();
    render(html`
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
        <div style="padding: 1rem; background: lavender">
          <fizz-details 
            style="--background: cornflowerblue"
            @open=${() => console.log('deets did open')}
            @close=${() => console.log('deets did close')}
          >
            <span slot="summary">Amazing secrets lie within...</span>
            <div slot="content">
              Bazinga!
            </div>
            <div slot="content">
              Double Bazinga!
            </div>
          </fizz-details>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-textfieldset 
            .inputDescriptors=${{
              foo: {label: 'Foo', value: 'foo!'},
              bar: {label: 'Bar', value: 'bar!'}
            }}
            @edit=${(e: Event) => 
              console.log('edited:', (e.target as ui.TextFieldSet).fieldValues())
            }
            @commit=${(e: Event) => 
              console.log('committed:', (e.target as ui.TextFieldSet).fieldValues())
            }>
            <span slot="legend">
              The Legend
              <fizz-infopopup>
                <div>Wowie neato info!</div>
              </fizz-infopopup>
            </span>
            <div slot="before">I am the <b>BEFORE</b> content</div>
            <div slot="after">I am the <b>AFTER</b> content</div>
          </fizz-textfieldset>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-tab-list
            ${ref(tabListRef)}
          ></fizz-tab-list>
          <fizz-tab-panel-group>
            <fizz-tab-panel tablabel="Tab 1" icon=${tabDescriptionIcon}>
              Hello, World!
              <fizz-dropdown 
                label="Tab label mode" 
                placeholder="Choose a tab label mode" 
                .options=${tabLabelModes}
                selected="0"
                @select=${(e: CustomEvent) => tabListRef.value!.mode = tabLabelModes[e.detail] as any}
              >
              </fizz-dropdown>
            </fizz-tab-panel>
            <fizz-tab-panel tablabel="Tab 2" icon=${tabDataIcon}>
              Foo! Bar! The other one!
            </fizz-tab-panel>
          </fizz-tab-panel-group>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-details 
            style="--contents-margin: -4px 0 0 0"
            @open=${() => console.log('tab deets did open')}
            @close=${() => console.log('tab deets did close')}
          >
            <fizz-tab-list 
              slot="summary" 
              style="--tab-font-size: 1rem"
              inline
            ></fizz-tab-list>
            <fizz-tab-panel-group slot="contents">
              <fizz-tab-panel tablabel="Tab 1">
                Hello, World!
              </fizz-tab-panel>
              <fizz-tab-panel tablabel="Tab 2">
                Foo! Bar! The other one!
              </fizz-tab-panel>
              <fizz-tab-panel tablabel="Tab 3">
                Foo! Bar! The other one!
              </fizz-tab-panel>
              <fizz-tab-panel tablabel="Tab 4">
                Foo! Bar! The other one!
              </fizz-tab-panel>
              <fizz-tab-panel tablabel="Tab 5">
                Foo! Bar! The other one!
              </fizz-tab-panel>
              <fizz-tab-panel tablabel="Tab 6">
                Foo! Bar! The other one!
              </fizz-tab-panel>
              <fizz-tab-panel tablabel="Tab 7">
                Foo! Bar! The other one!
              </fizz-tab-panel>
              <fizz-tab-panel tablabel="Tab 8">
                Foo! Bar! The other one!
              </fizz-tab-panel>

            </fizz-tab-panel-group>
          </fizz-details>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-dropdown 
            ${ref(dropdownRef)}
            label="Dropdown" 
            placeholder="Choose a groovy option!" 
            .options=${['Foo', 'Bar', 'Baz']}
            selected="1"
            @select=${(e: CustomEvent) => console.log('selected item', e.detail)}
            @dropdownfirstupdate=${() => setTimeout(() => dropdownRef.value!.selected = 2, 2000)}
          >
          </fizz-dropdown>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-slider style="--width: 8rem"
            ${ref(sliderRef)}
            label="Slider" 
            key="turtle" 
            value="1"
            min="0.5"
            max="2"
            lowbound="0.7"
            highbound="1.5"
            step="0.1"
            percent
            @sliderfirstupdate=${() => setTimeout(() => sliderRef.value!.value = 1.5, 2000)}
            @update=${(e: CustomEvent) => {
              console.log('slider updated:', e.detail);
            }}
          >
          </fizz-slider>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-radiogroup
            ${ref(radioRef)}
            .buttons=${{
              alpha: {
                label: 'Alpha',
                subLabel: '(one)',
                icon: './src/color-vision-normal-icon.svg'
              },
              beta: {
                label: 'Beta',
                subLabel: '(two)',
                icon: './src/color-vision-deutan-icon.svg'
              },
              gamma: {
                label: 'Gamma',
                subLabel: '(three)',
                icon: './src/color-vision-protan-icon.svg'
              }
            }}
            selected="beta"
            @select=${(e: CustomEvent) => console.log('radio selected:', e.detail)}
            @radiofirstupdate=${() => {
              setTimeout(() => {
                radioRef.value!.selected = 'beta';
                radioRef.value!.selected = 'gamma';
              }, 2000)
            }}
          >
            <span slot="legend">Video Killed the Radio Star</span>
          </fizz-radiogroup>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-radiogroup
            .buttons=${{
              alpha: {
                label: 'Alpha Beta',
                subLabel: '(one)',
              },
              beta: {
                label: 'Gamma Delta',
                subLabel: '(two)',
              },
              gamma: {
                label: 'Epsilon Zeta',
                subLabel: '(three)',
              }
            }}
            default="alpha"
            wrap
            @select=${(e: CustomEvent) => console.log('radio selected:', e.detail)}
          >
            <span slot="legend">Video Killed the Icons</span>
          </fizz-radiogroup>
        </div>
        <div style="padding: 1rem; background: lavender">
          <fizz-tab-details 
            ${ref(tabDeetsRef)}
            open
            tablabelmode="icons-labels"
            @open=${() => console.log('new tab deets did open')}
            @close=${() => console.log('new tab deets did close')}
            @firstupdate=${() => setTimeout(() => {
              tabDeetsRef.value!.hide('Tab A');
              setTimeout(() => {
                tabDeetsRef.value!.show('Tab A');
                tabDeetsRef.value!.show('Tab D');
              }, 2000);
            }, 2000)}
            @ready=${() => console.log('new tab deets is ready')}
          >
            <fizz-tab-panel tablabel="Tab A" icon=${tabDescriptionIcon}>
              Hello, lamp post! 
              <button tabindex="0">Button 1</button>
              <button tabindex="0">Button 2</button>
            </fizz-tab-panel>
            <fizz-tab-panel tablabel="Tab B" icon=${tabDataIcon}>
              Whatcha knowin'?
            </fizz-tab-panel>
            <fizz-tab-panel tablabel="Tab C" icon=${tabControlsIcon}>
              I'm here to watch your
            </fizz-tab-panel>
            <fizz-tab-panel hidden tablabel="Tab D" icon=${tabColorsIcon}>
              Power flowin'!
            </fizz-tab-panel>
          </fizz-tab-details>
        </div>
      </div>
      <fizz-overlay
        ${ref(overlayRef)}
        x="100px"
        y="100px"
        width="500px"
        open
        @firstupdate=${() => setTimeout(() => {
          overlayRef.value!.x = "200px";
        }, 2000)}
      >
        I am an overlay
        <button 
          type="button"
          @click=${() => overlayRef.value!.close()}
        >
          Close me
        </button>
      </fizz-overlay>
    `, contentContainer);

    const tfs = document.querySelector('fizz-textfieldset')!;
    tfs.addEventListener('firstupdate', () => 
      tfs.setFieldValues({foo: 'FOO', bar: 'BAR'}));
    const deets = document.querySelector('fizz-details')!;
    deets.addEventListener('firstupdate', () => {
      const div = document.createElement('div');
      div.textContent = 'Omega Bazinga!';
      deets.setContents(div);
    });
    //const drop = document.querySelector('fizz-dropdown')!;
    //drop.addEventListener('firstupdate', () => drop.select(1));

    const showOvlBtn = document.createElement('button');
    showOvlBtn.type = 'button';
    showOvlBtn.textContent = 'Show Overlay';
    contentContainer.append(showOvlBtn);
    showOvlBtn.addEventListener('click', () => { console.log('showing'); overlayRef.value!.show();});

    const msgDlg = document.createElement('fizz-msg-dialog');
    msgDlg.text = 'This is a message';
    //msgDlg.addEventListener('firstupdate', () => {
    //  msgDlg.show();
    //});
    contentContainer.append(msgDlg);

    const showMsgDlgBtn = document.createElement('button');
    showMsgDlgBtn.type = 'button';
    showMsgDlgBtn.textContent = 'Show Message Dialog';
    contentContainer.append(showMsgDlgBtn);
    showMsgDlgBtn.addEventListener('click', () => { console.log('showing'); msgDlg.show();});

    const confDlg = document.createElement('fizz-conf-dialog');
    contentContainer.append(confDlg);

    const showConfDlgBtn = document.createElement('button');
    showConfDlgBtn.type = 'button';
    showConfDlgBtn.textContent = 'Show Confirmation Dialog';
    contentContainer.append(showConfDlgBtn);
    showConfDlgBtn.addEventListener('click', () => confDlg.show('Solve the climate crisis?', 'No', 'Yes'));

  }

}
