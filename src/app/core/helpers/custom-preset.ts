import { definePreset, palette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const primaryPalette = palette(getCssVariableValue('--pr-blue-1'));
const secondaryPalette = palette(getCssVariableValue('--bg-blue-3'));
const successPalette = palette(getCssVariableValue('--green-1'));
const dangerPalette = palette(getCssVariableValue('--red-1'));
const infoPalette = palette(getCssVariableValue('--blue-1'));

const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: primaryPalette,
    surface: secondaryPalette,
    red: dangerPalette,
    green: successPalette,
    sky: infoPalette,
    colorScheme: {
      light: {
        primary: {
          hoverColor: getCssVariableValue('--pr-blue-3'),
        },
      },
    },
  },
});

function getCssVariableValue(variableName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

export default CustomPreset;
