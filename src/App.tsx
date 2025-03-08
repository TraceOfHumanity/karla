import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface AppProps {
  data: number[];
}

function App({ data }: AppProps) {
  const heatMapRef = useRef<HTMLDivElement>(null);

  const drawHeatMap = async () => {
    console.log(data);
    if (heatMapRef.current) {
      const heatMap = d3.select(heatMapRef.current);
      console.log(heatMap);

      const dimensions = {
        window: 600,
        height: 150,
      }

      const boxSize = 30;

      const svg = heatMap.append("svg")
        .attr("width", dimensions.window)
        .attr("height", dimensions.height)
        // .attr("viewBox", `0 0 ${dimensions.window} ${dimensions.height}`)
        // .attr("preserveAspectRatio", "xMidYMid meet")

      svg.append("g")
        .attr("transform", `translate(2, 2)`)
        .attr("stroke", "black")
        .attr("fill", "#ddd")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("width", boxSize - 3)
        .attr("height", boxSize - 3)
        .attr("x", (d, index) => boxSize * (index % 10))
        .attr("y", (d, index) => boxSize * Math.floor(index / 10))
    }
  }

  useEffect(() => {
    drawHeatMap();
  }, [])
  return (
    <div ref={heatMapRef}></div>
  )
}

export default App
