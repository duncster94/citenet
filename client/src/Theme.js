import { createMuiTheme } from "@material-ui/core/styles"

export default createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: "#9D0000",
      mainLight: "#F9E7E7",
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
      black: "#4b515d",
      blackLight: "#b7b9be",
      accentLight: "#e7e247",
      accentDark: "#5c80Bc",
      background: "#F7F7F7"
    },
    secondary: {
      // light:
      main: "#aaa"
      // dark:
      // contrastText:
    },
    //error:
  }
})