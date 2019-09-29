import React from "react"


export default function RankView({ props }) {

    let arr = []
    for (let i=0; i < 100; i++) {
        arr.push(i)
    }

    function handleScroll(e) {
        console.log(e.target.scrollTop)
    }

    return (
        <React.Fragment>
            <div style={{
                scrollSnapType: "y mandatory",
                overflowY: "scroll",
                maxHeight: "100vh",
                scrollSnapDestination: "50vh"
            }}
                onScroll={handleScroll}
            >

                <div style={{
                    position: "absolute",
                    height: "0px",
                    width: "80vw",
                    top: "50vh",
                    borderStyle: "solid"
                }}>
                </div>
                {arr.map(i => {
                    let marginTop
                    let marginBottom
                    if (i === 0) {
                        marginTop = "50vh"
                        marginBottom = "0vh"
                    } else if (i === 99){
                        marginTop = "0vh"
                        marginBottom = "50vh"
                    } else {
                        marginTop = "0vh"
                        marginBottom = "0vh"
                    }
                    return (
                        <div
                            style={{ 
                                height: "100px", 
                                borderStyle: "solid", 
                                scrollSnapAlign: "center",
                                marginTop: marginTop,
                                marginBottom: marginBottom
                            }}
                        >
                            Item {i}
                        </div>
                    )
                })}

            </div>
        </React.Fragment>
    )
}