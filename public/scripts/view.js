const d3 = require("d3");
const $ = require("jquery");

class View {

    constructor(response, currentView) {
        let self = this;

        self.response = response;
        self.nodesVal;
        self.edgesVal;

        // Process server response and update nodes and edges.
        self._loadD3();

        self.currentViewVal = currentView;
    }

    get nodes() {
        return self.nodesVal;
    }

    get edges() {
        return self.edgesVal;
    }

    get currentView() {
        return self.currentViewVal;
    }

    set currentView(view) {
        self.currentViewVal = view;
    }

    _loadD3() {
        /*
        Loads the server response into D3.
        */

        // Display parameters.
        let linkStrokeWidth = "5px";
        let linkColour = "#ccc";
        let nodeStrokeWidth = "5px";
        let nodeStrokeWidthNum = 5;
        let nodeStrokeColour = "#fff";

        // Get subgraph and seed nodes from response.
        let graph = self.response.subgraph;
        let seeds = self.response.seeds;

        // Get min and max publication years.
        let [minDate, maxDate] = self._minMaxPubYears(graph);

        // Add a group to svg canvas to contain nodes and edges.
        let g = d3.select("#network")
            .append("g")
            .attr("class", "everything");

        // Add edges (links) to graph.
        let link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("stroke-width", linkStrokeWidth)
            .style("stroke", linkColour);

        // Add nodes to graph.
        let node = g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("id", function(d) {
                return `group_${d.id}`;
            })
            .attr("class", "node")
            .attr("cx", 0)
            .attr("cy", 0)

        // Draw circles representing nodes.
        node.append("circle")
            .attr("id", function(d) {
                return `circle_${d.id}`;
            })
            .attr("r", function(d) {
                return _scoreToRadius(d);
            })
            .attr("fill", function(d) {
                return _dateToColour(d, minDate, maxDate, seeds);
            })
            .attr("stroke", nodeStrokeColour)
            .attr("stroke-width", nodeStrokeWidth);

        // Add a clip path for any overlaid images so they are clipped
        // to the circle.
        node.append("clipPath")
            .attr("id", function(d) {
                return `clip_${d.id}`;
            })
            .append("circle")
            .attr("r", function(d) {
                return _scoreToRadius(d) - nodeStrokeWidthNum / 2;
            })

        // Add image overlay for refined search papers.
        node.append("image")
            .attr("xlink:href", "images/hatch.svg")
            .attr("pointer-events", "none") // Won't be hoverable/clickable
            .attr("height", "150")
            .attr("width", "150")
            .attr("x", function(d) {
                return -75;
            })
            .attr("y", function(d) {
                return -75;
            })
            .attr("clip-path", function(d) {
                return `url(#clip_${d.id})`;
            })
            .attr("id", function(d) {
                return `overlay_${d.id}`;
            })
            .style("display", function(d) {

                // Check if node is in refine list, if so,
                // display overlay.
                if (seeds.includes(d.id)) {
                    return "inline";
                } else {
                    return "none";
                }
            })

        // Once the data has been loaded, delete the response.
        // TODO: test this works.
        // delete self.response;
    }

    _minMaxPubYears(graph) {
        /*
        Gets the smallest and largest publication dates from 'graph'
        */

        let dates = [];

        // Build an array of publication dates.
        graph.nodes.forEach(function(node) {
            let pubYear = node.pub_date.Year;

            // Make sure publication year is defined.
            if (pubYear) {
                dates.push(pubYear)
            }
        });

        let minDate = Math.min(...dates);
        let maxDate = Math.max(...dates);

        return [minDate, maxDate];
    }

    _scoreToRadius(node) {
        /*
        Given a node, take its score and map it to a radius.
        */

        let radius = 100 * Math.pow(node.score, 1 / 3);

        return radius;
    }

    _dateToColour(node, Dmin, Dmax, seeds) {
        /*
        Given a node, map the appropriate colour.
        */

        // If the node is a seed node, colour it differently.
        if (seeds.includes(node.id.toString())) {
            return "#f00";
        }

        // Get publication year.
        let year = node.pub_date.Year;

        // If publication year is not available, set node colour to
        // grey.
        if (!year) {
            return "#ccc"
        }

        // Define minimum and maximum lightness.
        let Lmin = 50
        let Lmax = 100

        // Get lightness of node colour based on date.
        let m = (Lmax - Lmin) / (Dmin - Dmax);
        let b = Lmax - m * Dmin;

        let lightness = m * year + b;

        let colour = `hsla(41,100%, ${lightness.toString()}%,1)`;

        return colour;
    }

    toRank() {
        /*
        Converts current view to rank view.
        */

        // Update current view.
        self.currentViewVal = "rank";
    }

    toNetwork() {
        /*
        Converts current view to network view.
        */

        // Update current view.
        self.currentViewVal = "network";
    }
}