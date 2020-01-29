import theme from "../Theme"

export default function dateToColour(nodes, dMin, dMax, seeds) {
  /* Given a node, map the appropriate colour.
  */

  return nodes.map(node => {

    // If the node is a seed node, colour it differently.
    if (seeds.includes(node.id.toString())) {
      return theme.palette.secondary.main
    }
  
    // Get publication year.
    let year = node.PubDate.Year
  
    // If publication year is not available, set node colour to
    // white.
    if (!year) {
      return '#fff'
    }
  
    // Define minimum and maximum lightness.
    let lMin = 50
    let lMax = 100
  
    // Get lightness of node colour based on date.
    let m = (lMax - lMin) / (dMin - dMax)
    let b = lMax - m * dMin
  
    let lightness = m * year + b
  
    let colour = `hsla(198, 8%, ${lightness.toString()}%, 1)`
  
    return colour
  })

}