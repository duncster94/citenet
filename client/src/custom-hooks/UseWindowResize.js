import React from "react"

export default function useWindowSize() {
    /* Custom hook for detecting resize events.
    https://stackoverflow.com/questions/19014250/rerender-view-on-browser-resize-with-react
    */
   const [size, setSize] = React.useState([0, 0])
   React.useLayoutEffect(() => {
       function updateSize() {
           setSize([window.innerWidth, window.innerHeight])
       }
       window.addEventListener("resize", updateSize)
       updateSize()
       return () => window.removeEventListener("resize", updateSize)
   }, [])
   return size
}