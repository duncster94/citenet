import React from "react"

export default function NetworkView(props) {
    return (
        <div style={{position: "absolute"}}>
            {JSON.stringify(props.props)}
        </div>
    )
}