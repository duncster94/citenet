import React from "react"
import * as d3 from "d3"

import "./NetworkView.css"

export default function NetworkView({ props }) {

  const [nodes, setNodes] = React.useState(props.subgraph.nodes)
  const [links, setLinks] = React.useState(props.subgraph.links)

  React.useEffect(() => {
    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(300, 300))
      .force("link", d3.forceLink().id(function(d) {return d.id}))

    simulation.force("link").links(links)

    simulation.on("tick", () => {
      setNodes([...nodes])
      setLinks([...links])
    })
  }, [])

  return (
    <svg
      height={600}
      width={600}
    >
      {links.map(function (link, index) {
        return (
          <line
            x1={link.source.x}
            y1={link.source.y}
            x2={link.target.x}
            y2={link.target.y}
            strokeWidth={2}
            stroke="black"
            key={`link-${index}`}
          />
        )
      })}
      {nodes.map(function(node, index) {
        return <circle r={node.score * 200} cx={node.x} cy={node.y} key={`node-${index}`} />
      })}
    </svg>
  )
}
