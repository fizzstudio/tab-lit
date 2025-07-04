import { css } from 'lit';

export const styles = css`
  :host {
    --themeColor: var(--fizzThemeColor, purple);
    --themeContrastColor: var(--fizzThemeContrastColor, ghostwhite);
    --themeExtraColor: var(--fizzThemeExtraColor, ghostwhite);
    --themeColorLight: var(--fizzThemeColorLight, hsl(275.4, 100%, 88%));
    --themeTextColor: var(--fizzThemeTextColor, var(--themeColor, black));
    --themeUnselectedTextColor: var(--fizzThemeUnselectedTextColor, var(--themeContrastColor, black));
    --themeSelectedTextDecoration: var(--fizzThemeSelectedTextDecoration, none);
    --control-panel-icon-color: var(--themeUnselectedTextColor, ghostwhite);
    --contents-overflow: hidden;
  }

  /* * {
    background: var(--background, var(--themeContrastColor));
  }*/
  .hidden {
    display: none !important;
  }

  .sr-only {
    width:1px;
    height:1px;
    overflow:hidden;
  }

`;