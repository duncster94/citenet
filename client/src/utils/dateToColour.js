export default function dateToColour(nodes, dMin, dMax, seeds) {
  /* Given a node, map the appropriate colour.
  */

  return nodes.map(node => {

    // If the node is a seed node, colour it differently.
    if (seeds.includes(node.id.toString())) {
      return '#000000'
    }
  
    // Get publication year.
    let year = node.PubDate.Year
  
    // If publication year is not available, set node colour to
    // grey.
    if (!year) {
      return '#ccc'
    }
  
    // Define minimum and maximum lightness.
    let lMin = 50
    let lMax = 100
  
    // Get lightness of node colour based on date.
    let m = (lMax - lMin) / (dMin - dMax)
    let b = lMax - m * dMin
  
    let lightness = m * year + b
  
    let colour = `hsla(0,0%, ${lightness.toString()}%,1)`
  
    return colour
  })

}