type ColorTextFn = (text: string) => string;

export const isColorAllowed = () => !process.env.NO_COLOR;
const colorIfAllowed = (colorFn: ColorTextFn) => (text: string) =>
  { throw new Error("STUB"); };

export const clc = {
  bold: colorIfAllowed((text: string) => { throw new Error("STUB"); }),
  green: colorIfAllowed((text: string) => { throw new Error("STUB"); }),
  yellow: colorIfAllowed((text: string) => { throw new Error("STUB"); }),
  red: colorIfAllowed((text: string) => { throw new Error("STUB"); }),
  magentaBright: colorIfAllowed((text: string) => { throw new Error("STUB"); }),
  cyanBright: colorIfAllowed((text: string) => { throw new Error("STUB"); }),
};
export const yellow = colorIfAllowed(
  (text: string) => { throw new Error("STUB"); },
);
