import { DefaultTheme } from "styled-components";

export type Themes = {
  [key: string]: DefaultTheme;
};

const theme: Themes = {
  dark: {
    id: "T_001",
    name: "dark",
    colors: {
      body: "#1D2A35",
      scrollHandle: "#19252E",
      scrollHandleHover: "#162028",
      primary: "#24f2b3",
      success: "#39ff9c",
      warning: "#ffb347",
      alert: "#c54b59",
      secondary: "#66d9ff",
      text: {
        100: "#def7ef",
        200: "#bdd8d2",
        300: "#f7fffd",
      },
    },
  },
  light: {
    id: "T_002",
    name: "light",
    colors: {
      body: "#FFFFFF",
      scrollHandle: "#0b122033",
      scrollHandleHover: "#0b122055",
      primary: "#005f73",
      success: "#0a7a4f",
      warning: "#8f5b00",
      alert: "#9b2c2c",
      secondary: "#0b5fff",
      text: {
        100: "#0b1220",
        200: "#243246",
        300: "#111827",
      },
    },
  },
  "blue-matrix": {
    id: "T_003",
    name: "blue-matrix",
    colors: {
      body: "#101116",
      scrollHandle: "#424242",
      scrollHandleHover: "#616161",
      primary: "#00ffb3",
      success: "#47ff8a",
      warning: "#ffd166",
      alert: "#d94f64",
      secondary: "#7de7ff",
      text: {
        100: "#ffffff",
        200: "#d1d7dc",
        300: "#8bffb1",
      },
    },
  },
  espresso: {
    id: "T_004",
    name: "espresso",
    colors: {
      body: "#323232",
      scrollHandle: "#5b5b5b",
      scrollHandleHover: "#393939",
      primary: "#E1E48B",
      success: "#a5d66f",
      warning: "#f1b86c",
      alert: "#d96c6c",
      secondary: "#A5C260",
      text: {
        100: "#F7F7F7",
        200: "#EEEEEE",
        300: "#dcdcd7",
      },
    },
  },
  "green-goblin": {
    id: "T_005",
    name: "green-goblin",
    colors: {
      body: "#000000",
      scrollHandle: "#2E2E2E",
      scrollHandleHover: "#414141",
      primary: "#E5E500",
      success: "#32ff5c",
      warning: "#ffca3a",
      alert: "#d84c3a",
      secondary: "#04A500",
      text: {
        100: "#01FF00",
        200: "#04A5B2",
        300: "#ecec37",
      },
    },
  },
  ubuntu: {
    id: "T_006",
    name: "ubuntu",
    colors: {
      body: "#2D0922",
      scrollHandle: "#F47845",
      scrollHandleHover: "#E65F31",
      primary: "#80D932",
      success: "#a4ef5f",
      warning: "#ffb75e",
      alert: "#d45b46",
      secondary: "#80D932",
      text: {
        100: "#FFFFFF",
        200: "#E1E9CC",
        300: "#CDCDCD",
      },
    },
  },
};

export default theme;
