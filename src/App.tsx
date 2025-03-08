import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface HeatMapProps {
  data: number[];
}

function HeatMap({ data }: HeatMapProps) {
  const heatMapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  const columns = 50; // 50 тижнів
  const rows = 7; // 7 днів у тижні
  const totalCells = columns * rows; // 350 клітинок

  // Заповнення масиву нулями, якщо значень менше 350
  const filledData = [...Array(totalCells - data.length).fill(0), ...data];

  useEffect(() => {
    const updateWidth = () => {
      if (heatMapRef.current) {
        setContainerWidth(heatMapRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (heatMapRef.current) {
      d3.select(heatMapRef.current).select("svg").remove();

      const boxSize = Math.floor(containerWidth / columns); // Динамічний розмір клітинки
      const width = boxSize * columns;
      const height = boxSize * rows;

      const colorScale = d3
        .scaleLinear<string, number>()
        .domain([d3.min(filledData) || 0, d3.max(filledData) || 1])
        .range(["#ddd", "green"]);

      const svg = d3
        .select(heatMapRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      svg
        .append("g")
        .attr("transform", "translate(2, 2)")
        .selectAll("rect")
        .data(filledData)
        .join("rect")
        .attr("width", boxSize - 2)
        .attr("height", boxSize - 2)
        .attr("x", (_, index) => boxSize * Math.floor(index / rows)) // Колонки йдуть по X
        .attr("y", (_, index) => boxSize * (index % rows)) // Рядки йдуть по Y
        .attr("fill", colorScale)
        .attr("stroke", "#999");
    }
  }, [filledData, containerWidth]);

  return <div ref={heatMapRef} style={{ width: "100%", height: "auto" }}></div>;
}

export default HeatMap;
