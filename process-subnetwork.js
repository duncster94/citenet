
function processSubnetwork(message, seeds) {
  /* Creates metadata from subgraph, such as node display radius
  and color.
  */

  // Get minimum and maximum publication years from 'graph'.
  let dates = []
  message.subgraph.nodes.forEach(function (node) {

    // console.log(node)
    let pub_year = node.PubDate.Year

    // Make sure publication year is defined.
    if (pub_year) {
      dates.push(pub_year);
    }
  })
  let min_date = Math.min(...dates)
  let max_date = Math.max(...dates)

  function scoreToRadius(node, maxScore, seeds) {
    /* Given a node, take its score and map it to a radius.
    */

    // console.log(maxScore)
    // let radius = 30 * node.score / maxScore
    let radius = 30 * node.score / maxScore
    console.log(radius)

    // Set seed nodes to a fixed size.
    if (seeds.includes(node.id)) {
      radius = 15
    }
    return Math.max(5, radius)
  }

  function dateToColour(node, D_min, D_max, seeds) {
    /* Given a node, map the appropriate colour.
    */

    // If the node is a seed node, colour it differently.
    if (seeds.includes(node.id.toString())) {
      return '#9D0000'
    }

    // Get publication year.
    let year = node.PubDate.Year

    // If publication year is not available, set node colour to
    // grey.
    if (!year) {
      return '#ccc'
    }

    // Define minimum and maximum lightness.
    L_min = 50
    L_max = 100

    // Get lightness of node colour based on date.
    let m = (L_max - L_min) / (D_min - D_max)
    let b = L_max - m * D_min

    let lightness = m * year + b

    let colour = `hsla(0,0%, ${lightness.toString()}%,1)`

    return colour
  }

  function formatAuthors(authors) {
    /* Formats author list for use in modal and popover.
    */

    let authorString = ''

    // Add author names to 'authorString'.
    for (author of authors) {
      let first_name
      if (author.ForeName) {
        first_name = author.ForeName.split(' ').map(str => {
          return str[0]
        }).join('')
      } else {
        first_name = ''
      }

      let last_name = author.LastName

      authorString += `${first_name} ${last_name}, `
    }

    // Remove final comma and space at end of 'authorString'.
    authorString = authorString.slice(0, -2);

    return authorString;
  }

  function formatDate(date) {

    let dateString = ''

    if ('Month' in date) {
      switch (date['Month']) {
        case 'Jan':
          dateString += 'January '
          break
        case 'Feb':
          dateString += 'February '
          break
        case 'Mar':
          dateString += 'March '
          break
        case 'Apr':
          dateString += 'April '
          break
        case 'Jun':
          dateString += 'June '
          break
        case 'Jul':
          dateString += 'July '
          break
        case 'Aug':
          dateString += 'August '
          break
        case 'Sep':
          dateString += 'September '
          break
        case 'Oct':
          dateString += 'October '
          break
        case 'Nov':
          dateString += 'November '
          break
        case 'Dec':
          dateString += 'December '
          break
        case '01':
          dateString += 'January '
          break
        case '02':
          dateString += 'February '
          break
        case '03':
          dateString += 'March '
          break
        case '04':
          dateString += 'April '
          break
        case '05':
          dateString += 'May'
          break
        case '06':
          dateString += 'June '
          break
        case '07':
          dateString += 'July '
          break
        case '08':
          dateString += 'August '
          break
        case '09':
          dateString += 'September '
          break
        case '10':
          dateString += 'October '
          break
        case '11':
          dateString += 'November '
          break
        case '12':
          dateString += 'December '
          break
        default:
          dateString += `${date['Month']} `
      }
    }

    dateString += date['Year']

    return dateString
  }

  function formatJournal(journal) {
    let formattedJournal
    if (journal.length > 20) {
      formattedJournal = journal.substring(0, 20) + '...'
    } else {
      formattedJournal = journal
    }

    return formattedJournal
  }

  message.subgraph.nodes.sort((a, b) => (a.score > b.score || seeds.includes(a.id)) ? -1 : 1)
  const maxScore = message.subgraph.nodes[0].score
  // console.log(message.subgraph.nodes[0])
  // console.log(seeds)

  const radii = message.subgraph.nodes.map(node => {
    return scoreToRadius(node, maxScore, seeds)
  })

  const colours = message.subgraph.nodes.map(node => {
    return dateToColour(node, min_date, max_date, seeds)
  })


  message.subgraph.nodes.forEach(node => {
    node.formattedAuthors = formatAuthors(node.Authors)
  })

  message.subgraph.nodes.forEach(node => {
    node.formattedDate = formatDate(node.PubDate)
  })

  message.subgraph.nodes.forEach(node => {
    node.formattedJournal = formatJournal(node.Journal)
  })

  return({
    subgraph: message.subgraph,
    seeds, 
    metadata: {
      radii,
      colours
    }
  })
}

module.exports.processSubnetwork = processSubnetwork