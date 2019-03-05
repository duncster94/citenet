const d3 = require("d3");
const $ = require("jquery");
const createTooltips = require("./create-tooltips.js");
const createModal = require("./create-modals.js");

class View {

    constructor(response, currentView, refinedPapers) {

        this.response = response;
        this.refinedPapers = refinedPapers;
        this.nodesVal; // Suffixed with "Val" in order to have getters/setters
        this.edgesVal;

        // Height and width of view.
        this.height;
        this.width;

        // Tooltips.
        this.tips;

        // Get 'change view' button.
        this.viewButton = $("#animate-button");

        // Process server response and update nodes and edges.
        this._loadD3();

        // Set current node drag state. Used to hide tooltips on drag.
        this.isDragging = {
            "state": false
        }

        // Object containing rank, node pairs for rank view.
        this.rankToNode = {};

        // Node identifier for rank view scroller.
        this.currentRank = 0;

        this.currentViewVal = currentView;
        if (this.currentViewVal === "network") {
            this._initNetwork();
        } else if (this.currentViewVal === "rank") {
            this._initRank();
        } else {
            throw `View ${this.currentViewVal} is not a valid view.`
        }
    }

    get nodes() {
        return this.nodesVal;
    }

    get edges() {
        return this.edgesVal;
    }

    get currentView() {
        return this.currentViewVal;
    }

    // set currentView(view) {
    //     this.currentViewVal = view;
    // }

    _loadD3() {
        /*
        Loads the server response into D3.
        */

       let self = this;

        // Display parameters.
        let linkStrokeWidth = "5px";
        let linkColour = "#ccc";
        let nodeStrokeWidth = "5px";
        let nodeStrokeWidthNum = 5;
        let nodeStrokeColour = "#fff";

        // Get subgraph and seed nodes from response.
        let graph = this.response.subgraph;
        let seeds = this.response.seeds;

        // Get min and max publication years.
        let [minDate, maxDate] = this._minMaxPubYears(graph);

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
                return self._scoreToRadius(d);
            })
            .attr("fill", function(d) {
                return self._dateToColour(d, minDate, maxDate, seeds);
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
                return self._scoreToRadius(d) - nodeStrokeWidthNum / 2;
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

        this.nodesVal = node;
        this.edgesVal = link;

        // Once the data has been loaded, delete the response.
        // TODO: test this works.
        // delete this.response;
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

        let self = this;

        let width = $("#network").width()
        let height = $("#network").height()
        let graph = this.response.subgraph;
        
        // Update current view.
        // this.currentViewVal = "network";

        // Create force simulation.
        let simulation = d3.forceSimulation()
            .nodes(graph.nodes);

        // Define forces.
        let collisionForce = d3.forceCollide()
            .radius(function(d) {
                return self._scoreToRadius(d) + 3;
            });

        let chargeForce = d3.forceManyBody()
            .strength(-500);

        let centerForce = d3.forceCenter(width / 2, height / 2);

        let linkForce = d3.forceLink(graph.links)
            .id(function(d) {
                return d.id;
            })
            .strength(0.4);

        // Add forces and tick behaviour.
        simulation
            .force("collide", collisionForce)
            .force("charge", chargeForce)
            .force("center", centerForce)
            .force("links", linkForce)
            .on("tick", _networkTickActions)
            .alphaTarget(0.01)

        // Add drag behaviour.
        let dragHandler = d3.drag()
            .on("start", function(d) {
                self.isDragging = true;
                return self._networkDragStart(d)
            })
            .on("drag", self._networkDragDrag)
            .on("end", function(d) {
                self.isDragging = false;
                return self._networkDragEnd(d)
            })

        dragHandler(self.nodesVal)

        // Add zoom behaviour.
        let zoomHandler = d3.zoom()
            .on("zoom", self._networkZoomActions)
            .scaleExtent([0.1, 3])

        d3.select("#network")
            .call(zoomHandler)
            .call(zoomHandler.transform, d3.zoomIdentity
                .translate(width / 4, height / 4)
                .scale(0.5))
                .on("dblclick.zoom", null); // Disable doubleclick zooming.

        // Add tooltips on hover.
        this.tips = createTooltips.createTooltips(this.nodesVal, this.isDragging);

        // Add modals on click.
        this.nodesVal.on("click", function(d) {

            createModal.createModal(d, self.refinedPapers)

            $("#abstract-modal-dialog")
                .removeClass("fade-out")
                .addClass("fade-in")
                .show();
        });

        function _networkTickActions() {
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

        this.viewButton.off("click");
        this.viewButton.on("click", function() {
            self.toRank();
        });
    }

    _networkDragStart(d) {
        /*
        Defines starting drag actions for network view.
        */

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

        let self = this;

        // Disable view button to avoid changing view before
        // animation is complete.
        this.viewButton
            .attr("disabled", true)

        // let width = $("#network").width()
        // let height = $("#network").height()

        this.width = $(window).width()
        this.height = $(window).height()
       
        // Check size of screen to determine if modal size should be
        // modified. For small devices modal is only shown on click/tap,
        // so the original modal size is not modified.
        if (this.width >= 768) {
            $("#abstract-modal-dialog")
                .addClass("modal-rank-view")

            // Hide modal close button.
            $("#modal-close").hide();
        }

        // Add a listener to modal to allow retriggering of bounce animation.
        $("#abstract-modal-dialog").on("animationend", function() {
            $("#abstract-modal-dialog").removeClass("bounce");
        });

        // Add arrow depicting selected node.
        d3.select("#network")
            .append("image")
            .attr("xlink:href", "images/FocusArrow.svg")
            .attr("height", "15")
            .attr("width", "15")
            .attr("x", this.width * 0.05)
            .attr("y", this.height / 2 - 7.5)
            .attr("class", "rank-arrow");

        // Get top two largest radii in order to properly space nodes.
        let [radiusFirst, radiusSecond] = this._getTopRadii();

        // Padding between largest two nodes. This determines overall vertical
        // node spacing on the screen.
        let nodePadding = this.width / 3;

        // Minimum vertical node padding.
        let minVerticalPadding = 50;

        // Spacing between nodes.
        let nodeSpacing = radiusFirst + 
            Math.max(10000/nodePadding, minVerticalPadding) + radiusSecond;

        console.log('spacing padding', nodePadding, nodeSpacing);

        // Translate node collection.
        d3.select(".everything")
            .transition()
            .ease(d3.easeSinOut)
            .duration(1200)
            .attr("transform", `translate(0, ${this.height/2})`);


        // Padding to add between left edge of screen and nodes.
        let leftPadding = this.width / 10;

        // Translate each node based on rank.
        this.nodesVal
            .transition()
            .ease(d3.easeElastic)
            .duration(1600)
            .attr("transform", function(d) {

                // Update 'rankToNode'.
                self.rankToNode[d.rank] = d;

                return `translate(${leftPadding}, ${nodeSpacing * d.rank})`
            })
            .on("end", function(d) {

                console.log('ended');
                // Update positions of nodes.
                d.fx = leftPadding;
                d.fy = (nodeSpacing * d.rank);

                // Set fixed positions of nodes. This is set
                // so that fixed positions can be removed when
                // the user returns to network view and the force
                // simulation will be resumed.
                d.x = d.fx;
                d.y = d.fy;

                // Reenable animate button.
                self.viewButton
                    .attr("disabled", false)
            })

        // Set initial modal.
        this._rankUpdateModal();

        // Add paper details to right of each node.
        this.nodesVal
            .append("foreignObject")
            .attr("class", "animate-rank-details-fo")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("overflow", "visible")
            .append("xhtml:div")
            .attr("class", "animate-rank-details")
            .html(function(d) {

                // Create author string.
                let authorString = self._rankParseAuthors(d.authors);

                // NOTE: may need to use 'xhtml:div' instead of 'div'.
                let htmlString = 
                    "<div class=animate-rank-details-title>" +
                        d.title +
                    "</div>" + 
                    "<div class=animate-rank-details-authors>" +
                        authorString +
                    "</div>"
                return htmlString
            })

        // Get number of nodes in collection.
        let nNodes = this.nodesVal.size();

        // Initial position of scroller.
        let currentY = 0;

        // Add arrow up (38) and arrow down (40), page up (33), 
        // page down (34) and home (36) and end (35) listeners.
        $(document).on("keydown", function(event) {
            
            let newPosition;

            // Up arrowkey.
            if (event.which === 38) {

                // Specify new position to hop up to, bounded by node collection.
                newPosition = Math.max(
                    Math.min(currentY + nodeSpacing, 0),
                    -(nNodes - 1) * nodeSpacing);

                // Transition to 'newPosition'.
                self._rankScrollNodes(newPosition, nodeSpacing);
            }

            // Down arrowkey.
            else if (event.which === 40) {
                
                newPosition = Math.max(
                    Math.min(currentY - nodeSpacing, 0),
                    -(nNodes - 1) * nodeSpacing);

                self._rankScrollNodes(newPosition, nodeSpacing);
            }

            // Page up.
            else if (event.which === 33) {

                newPosition = Math.max(
                    Math.min(currentY + 5 * nodeSpacing, 0),
                    -(nNodes - 1) * nodeSpacing);

                self._rankScrollNodes(newPosition, nodeSpacing, d3.easeSinOut);
            }

            // Page down.
            else if (event.which === 34) {

                newPosition = Math.max(
                    Math.min(currentY - 5 * nodeSpacing, 0),
                    -(nNodes - 1) * nodeSpacing);

                self._rankScrollNodes(newPosition, nodeSpacing, d3.easeSinOut);
            }

            // Home.
            else if (event.which === 36) {

                newPosition = 0;

                self._rankScrollNodes(newPosition, nodeSpacing, d3.easeSinOut);
            }

            // End.
            else if (event.which === 35) {

                newPosition = -(nNodes - 1) * nodeSpacing;

                self._rankScrollNodes(newPosition, nodeSpacing, d3.easeSinOut);
            }

            // Any other keypress.
            else {
                return;
            }

            // Update current focused node position.
            currentY = newPosition;
        });

        this.nodesVal
            .on("click", function(d) {
            /*
            On node click, snap to clicked node.
            */
    
            // Get node position to snap to.
            let pos = -d.rank * nodeSpacing
    
            // Update current y position.
            currentY = pos;
    
            // Snap to position.
            self._rankScrollNodes(pos, nodeSpacing);
    
            // If screen is small, display modal.
            if (self.width < 767.98) {
    
                let modal = $("#abstract-modal-dialog");
                modal.removeClass("fade-out");
                
                // Modify modal information to clicked node.
                createModal.createModal(d, self.refinedPapers);
                
                modal.addClass("fade-in");
    
                modal.show();
    
            }
        });

        // Add touch-scroll listener.
        // d3.select("#network")
        //     .call(d3.zoom()).on("touchmove.zoom", function() {
        //         console.log('touchzoom')
        //     })

        // // Add zoom behaviour.
        // let zoomHandler = d3.zoom()
        //     .on("zoom", self._networkZoomActions)
        //     .scaleExtent([0.1, 3])

        // d3.select("#network")
        //     .call(zoomHandler)

        // Add scroll listener.
        d3.select("#network")
            .call(d3.zoom().on("zoom", function() {
            /*
            Translates node collection based on scroll strength. 
            */

            // Removes timer on new scroll event.
            clearTimeout(timer);

            // Get scroll Y delta.
            // console.log(d3.event.sourceEvent)
            let event = d3.event;
            let deltaY;

            if ("deltaY" in event.sourceEvent) {
                deltaY = d3.event.sourceEvent.deltaY;
                wheelScroll(deltaY);
            } else {
                console.log(event);
                touchScroll(event.transform.y);
            }
        }));

        function wheelScroll(deltaY) {
            /*
            Handles scroll behaviour when the device is a mousewheel
            or trackpad.
            */

            // Avoid retriggering scroll snapping if the user tries scrolling
            // below minimum or above maximum scroll extent.
            if ((currentY === 0 && deltaY < 0) || 
                (currentY + ((nNodes - 1) * nodeSpacing)) < 0.001 && deltaY > 0) {
                return
            }

            // Specify new position to scroll to, bounded by node collection.
            let newPosition = Math.max(Math.min(currentY - deltaY, 0),
                -(nNodes - 1) * nodeSpacing);

            coreScroll(newPosition)
            // // Scroll nodes.
            // d3.select(".everything")
            //     .transition()
            //     .ease(d3.easeLinear)
            //     .duration(50)
            //     .attr("transform", `translate(0, ${newPosition+self.height/2})`);

            // Add scroll-end listener.
            translateTimeout(newPosition);
        }

        function touchScroll(deltaY) {
            /*
            Handles scroll behaviour if device is a touchscreen.
            */

            // Avoid retriggering scroll snapping if the user tries scrolling
            // below minimum or above maximum scroll extent.
            if ((currentY === 0 && deltaY < 0) || 
                (currentY + ((nNodes - 1) * nodeSpacing)) < 0.001 && deltaY > 0) {
                return
            }

            // let newPosition = touch;
            coreScroll(newPosition)

        }

        function coreScroll(newPosition) {
            /*
            Implements main scroll functionality, irrespective of scroll
            type.
            */

            // Scroll nodes.
            d3.select(".everything")
                .transition()
                .ease(d3.easeLinear)
                .duration(50)
                .attr("transform", `translate(0, ${newPosition+self.height/2})`);

            // Update current focused node position.
            currentY = newPosition;          
        }

        // Defines scroll-end timer.
        let timer;

        function translateTimeout(pos) {
            /*
            Waits for the end of a scroll event before computing nearest
            node to snap to.
            */

            // Time to wait until the end of a scroll event is detected.
            let endTime;

            // If scrolling goes past top and bottom boundaries, snap to
            // node immediately. This is to avoid waiting for the end of
            // an intertial scroll to show modal.
            if (pos === 0 || (pos + ((nNodes - 1) * nodeSpacing)) < 0.001) {
                endTime = 0;
            } else {
                endTime = 150;
            }

            // Waits for 'endTime' after being triggered by scroll event
            // and snaps nodes to nearest node position.
            timer = setTimeout(function() {

                // Given the new scroll position, find the closest 'bin' or
                // discrete position.
                let closestPos = self._rankClosest(pos, nodeSpacing);
                let newPosition = closestPos;

                // Transition to 'newPosition'.
                self._rankScrollNodes(newPosition, nodeSpacing);

                // Update current focused node position.
                currentY = newPosition;

            }, endTime);
        }

        // On window resize, translate nodes to ensure responsiveness.
        $(window).resize(function() {

            console.log('resized');

            // Update current window width.
            self.width = $(window).width();

            // Compute horizontal padding.
            nodePadding = self.width / 3;

            // Compute vertical padding.
            let resizedNodeSpacing = radiusFirst + 
                Math.max(10000/nodePadding, minVerticalPadding) + radiusSecond;

            // Determine new y position based on 'resizedNodeSpacing'.
            let newPos = Math.round(currentY / nodeSpacing) * resizedNodeSpacing

            // Update 'nodeSpacing'.
            nodeSpacing = resizedNodeSpacing;

            // Translate nodes.
            self.nodesVal
                .attr("transform", function(d) {
                    return `translate(${self.width/10}, ${nodeSpacing*d.rank})`
                })
            
            // Translate node collection to keep selected node centered.
            d3.select(".everything")
                .attr("transform", `translate(0, ${newPos + self.height/2})`);
                
            // Update author string for each node to compensate for new screen size.
            d3.selectAll(".animate-rank-details")
                .html(function(d) {

                    // Create author string.
                    let authorString = self._rankParseAuthors(d.authors);

                    // NOTE: may need to use 'xhtml:div' instead of 'div'.
                    let htmlString = 
                        "<div class=animate-rank-details-title>" +
                            d.title +
                        "</div>" + 
                        "<div class=animate-rank-details-authors>" +
                            authorString +
                        "</div>"
                    return htmlString
                })

            // Update modal size, position and display.
            if (self.width >= 768) {
                $("#abstract-modal-dialog")
                    .css("display", "inline-block")
                    .css("position", "fixed")
                    .css("right", "2.5vw")
                    .css("width", "40vw")

                // Hide modal close button.
                $("#modal-close").hide();

                self._rankUpdateModal();

            } else {
                $("#abstract-modal-dialog")
                    .css("display", "none")
                    .css("width", "auto")

                // Show modal close button.
                $("#modal-close").show();
            }

            // Update y position.
            currentY = newPos;
        });

        this.viewButton.off("click");
        this.viewButton.on("click", function() {
            self.toNetwork();
        })

    }

    _getTopRadii() {
        /*
        Returns the top two largest radii in 'nodesVal'.
        */

        let self = this;

        // Object to hold top two node radii.
        let topRadii = [0, 0];

        // Get radii of top two scoring nodes.
        self.nodesVal.data().forEach(function(d) {
            if (d.rank === 0) {
                topRadii[0] = self._scoreToRadius(d);
            }

            if (d.rank === 1) {
                topRadii[1] = self._scoreToRadius(d);
            }
        });

        return topRadii;
    }

    _rankUpdateModal() {
        /*
        Modifies the content of the modal to display currently focused
        node paper information.
        */
       
        // let width = $("#network").width();

        let modal = $("#abstract-modal-dialog");

        // If screen width is below tablet width, do not show modal.
        if (this.width < 767.98) {

            modal.hide();

        } else {

            // Get current node.
            let currNode = this.rankToNode[this.currentRank];

            modal.removeClass("fade-in");
            modal.removeClass("fade-out");

            // Add bounce animation to modal.
            modal.addClass("bounce");

            // Replace modal fields with 'currNode' fields.
            createModal.createModal(currNode, this.refinedPapers);
        }
    }

    _rankParseAuthors(authorArr) {
        /*
        Creates an author list string, given an array of authors 
        and the viewport width.
        */

        let authorString;

        if (authorArr.length === 1) {

            authorString = authorArr[0].LastName;

            return authorString
        }

        if (this.width < 767.98) {
                
            if (authorArr.length === 2) {
                authorString = authorArr[0].LastName + 
                    " and " + authorArr[1].LastName;
            } else {
                authorString = authorArr[0].LastName + 
                    ", ..., " + authorArr[authorArr.length-1].LastName;
            }

        } else {

            if (authorArr.length === 2) {
                authorString = authorArr[0].LastName + 
                    " and " + authorArr[1].LastName;
            } else if (authorArr.length <= 6) {
                authorString = "";
                authorArr.forEach(function(author) {
                    authorString += author.LastName + ", "
                });
                authorString = authorString.slice(0, -2);
            } else {
                authorString = authorArr[0].LastName + ", " +
                    authorArr[1].LastName + ", " + authorArr[2].LastName +
                    ", ..., " + authorArr[authorArr.length-3].LastName + ", " +
                    authorArr[authorArr.length-2].LastName + ", " + 
                    authorArr[authorArr.length-1].LastName;
            }

        }
        
        return authorString; 
    }

    _rankScrollNodes(pos, nodeSpacing, easing=d3.easeBounce, duration=500) {
        /*
        Translates node collection to a snap position given by 'pos'.
        */

        // Translate node collection to snap point.
        d3.select(".everything")
            .transition()
            .ease(easing)
            .duration(duration)
            .attr("transform", `translate(0, ${pos+this.height/2})`);

        // Update current rank position.
        this.currentRank = Math.round(Math.abs(pos / nodeSpacing));

        // Change displayed modal.
        this._rankUpdateModal();
    }

    _rankClosest(pos, nodeSpacing) {
        /*
        Computes the closest scroll snap position to 'pos'.
        */

        // Take magnitude of 'pos'.
        let posMagnitude = Math.abs(pos);

        // Integer corresponding to node rank behind the current
        // position.
        let positionInt = Math.floor(posMagnitude / nodeSpacing);
        
        // Snap position behind current position.
        let lower = positionInt * nodeSpacing;

        // Snap position ahead of current position.
        let higher = (positionInt + 1) * nodeSpacing;

        // Magnitude of new scroll snap position.
        let magnitude;

        // Determine which scroll snap position (lower or higher) is
        // closest to the current position.
        if ((posMagnitude - lower) < (higher - posMagnitude)) {
            magnitude = lower;
        } else {
            magnitude = higher;
        }

        // Determine sign of scroll snap position.
        if (pos <= 0) {
            return -magnitude;
        } else {
            return magnitude;
        }
    }

    toRank() {
        /*
        Converts current view to rank view.
        */

        let self = this;

        // Remove button click listner.
        this.viewButton.on("click", null);

        // Get current view.
        let currView = this.currentViewVal;

        if (currView === "rank") {
            throw "Rank view is already active."
        } else {

            // Update current view.
            this.currentViewVal = "rank";

            // Remove node tooltips.
            Object.keys(self.tips).forEach(function(nodeID) {
                let tip = self.tips[nodeID];
                tip.destroy();
            })

            // Remove node edges.
            $(".links").hide();

            // Remove node click behaviour.
            this.nodesVal.on("click", null);

            // Remove node drag behaviour.
            let nullDrag = d3.drag()
                .on("start", null)
                .on("drag", null)
                .on("end", null)
            nullDrag(this.nodesVal)

            this._initRank();
        }
    }

    toNetwork() {
        /*
        Converts current view to network view.
        */

        let self = this;

        // Get current view.
        let currView = this.currentViewVal;

        if (currView === "network") {
            throw "Network view is already active."
        } else {

            // Update current view.
            this.currentViewVal = "network";

            // Remove fixed node positions.
            this.nodesVal
                .each(function(d) {
                    d.fx = null;
                    d.fy = null;
                });

            // Show edges.
            $(".links").show();

            // Drop foreignObjects.
            d3.selectAll("foreignObject").remove();

            // Remove arrow.
            d3.select(".rank-arrow").remove();

            // Remove rank view class from modal.
            $("#abstract-modal-dialog")
                .removeClass("modal-rank-view");

            // Show modal close icon.
            $("#modal-close").show();

            // Remove resize behaviour.
            $(window).off("resize");

            this._initNetwork();
        }

        // this.viewButton.on("click", function() {
        //     self.toRank();
        // });
    }
}

module.exports.View = View