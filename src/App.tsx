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
