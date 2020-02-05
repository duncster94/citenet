import { createMuiTheme } from "@material-ui/core/styles"

// Color theme: https://material.io/resources/color/#!/?view.left=1&view.right=0&primary.color=455A64&secondary.color=F4511E
export default createMuiTheme({
  palette: {
    primary: {
      main: "#455A64",
      light: "#718792",
      dark: "#1c313a",
      black: "#4b515d",
      blackLight: "#b7b9be",
      accentLight: "#e7e247",
      accentDark: "#5c80Bc",
      background: "#F7F7F7"
    },
    secondary: {
      main: "#F4511E",
      light: "#ff844c",
      dark: "#b91400"
    },
  },
});