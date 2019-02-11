const d3 = require("d3");
const $ = require("jquery");

class View {

    constructor(response, currentView) {
        let self = this;

        self.response = response;
        self.nodesVal; // Suffixed with "Val" in order to have getters/setters
        self.edgesVal;

        // Process server response and update nodes and edges.
        self._loadD3();

        // Set current node drag state. Used to hide tooltips on drag.
        self.isDragging = {
            "state": false
        }

        self.currentViewVal = currentView;
        if (self.currentViewVal === "network") {
            self._initNetwork();
        } else if (self.currentViewVal === "rank") {
            self._initRank();
        } else {
            throw `View ${self.currentViewVal} is not a valid view.`
        }
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

    // set currentView(view) {
    //     self.currentViewVal = view;
    // }

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

    _initNetwork() {
        /*
        Initializes view as network.
        */

        let width = $("#network").width()
        let height = $("#network").height()
        let graph = self.response.subgraph;
        
        // Update current view.
        self.currentViewVal = "network";

        // Create force simulation.
        let simulation = d3.forceSimulation()
            .nodes(graph.nodes);

        // Define forces.
        let collisionForce = d3.forceCollide()
            .radius(function(d) {
                return self._scoreToRadius(d) + 3;
            });

        let chargeForce = d3.forceManyBody()
            .strength(-350);

        let centerForce = d3.forceCenter(width / 2, height / 2);

        let linkForce = d3.forceLink(graph.links)
            .id(function(d) {
                return d.id;
            })
            .strength(0.5);

        // Add forces and tick behaviour.
        simulation
            .force("collide", collisionForce)
            .force("charge", chargeForce)
            .force("center", centerForce)
            .force("links", linkForce)
            .on("tick", self._networkTickActions)
            .alphaTarget(0.03)

        // Add drag behaviour.
        let dragHandler = d3.drag()
            .on("start", _networkDragStart)
            .on("drag", _networkDragDrag)
            .on("end", _networkDragEnd)

        dragHandler(self.nodesVal)

        // Add zoom behaviour.
        let zoomHandler = d3.zoom()
            .on("zoom", self._networkZoomActions)
            .scaleExtent([0.1, 3])

        $("#network")
            .call(zoomHandler)
            .call(zoomHandler.transform, d3.zoomIdentity
                .translate(width / 4, height / 4)
                .scale(0.5))
                .on("dblclick.zoom", null); // Disable doubleclick zooming.
    }

    _networkTickActions() {
        /*
        Defines the tick behaviour for the network view force simulation.
        */

        // Update group (circle and image) positions for each simulation tick.
        self.nodesVal
            .attr("transform", function(d) {
                return `translate(${d.x.toString()}, ${d.y.toString()})`;
            })

        // Update link positions for each simulation tick.
        self.edgesVal
            .attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });
    }

    _networkDragStart(d) {
        /*
        Defines starting drag actions for network view.
        */

        self.isDragging.state = true;

        d.fx = d.x;
        d.fy = d.y;
    }

    _networkDragDrag(d) {
        /*
        Defines during-drag actions for network view.
        */

        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    _networkDragEnd(d) {
        /*
        Defines ending drag actions for network view.
        */

        self.isDragging.state = false;

        d.fx = null;
        d.fy = null;
    }

    _networkZoomActions() {
        /*
        Defines zoom actions for network view.
        */

        $(".everything").attr("transform", d3.event.transform);
    }

    _initRank() {
        /*
        Initializes view as ranked list.
        */
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