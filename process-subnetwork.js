
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
  let minDate = Math.min(...dates)
  let maxDate = Math.max(...dates)

  function scoreToRadius(node, seeds) {
    /* Given a node, take its score and map it to a radius.
    */

    let radius = 30 * node.score

    // Set seed nodes to a fixed size.
    if (seeds.includes(node.id)) {
      radius = 32.5
    }
    return Math.max(5, radius)
  }

  function formatAuthors(authors) {
    /* Formats author list for use in modal and popover.
    */

    let authorString = ''

    // Add author names to 'authorString'.
    for (author of authors) {

      if (author.CollectiveName) {
        authorString += `${author.CollectiveName}, `
        continue
      }

      let first_name
      if (author.ForeName) {
        first_name = author.ForeName.split(' ').map(str => {
          return str[0]
        }).join('')
        authorString += `${first_name} `
      }

      if (author.LastName) {
        authorString += `${author.LastName}, `
      }
    }

    if (authorString.length === 0) {
      return ''
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

  const radii = message.subgraph.nodes.map(node => {
    return scoreToRadius(node, seeds)
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
      minDate,
      maxDate
    }
  })
}

module.exports.processSubnetwork = processSubnetwork