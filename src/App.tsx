import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface WorkoutData {
  workoutDate: string;
  workoutName: string;
  workoutDuration: number;
}

interface HeatMapProps {
  data: WorkoutData[];
}

function HeatMap({ data }: HeatMapProps) {
  const heatMapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  const columns = 50; // 50 тижнів
  const rows = 7; // 7 днів у тижні
  const totalCells = columns * rows; // 350 клітинок

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Сумування workoutDuration для однакових дат
  const aggregatedData = data.reduce((acc, cur) => {
    const dateKey = new Date(cur.workoutDate).toDateString();
    acc.set(dateKey, (acc.get(dateKey) || 0) + cur.workoutDuration);
    return acc;
  }, new Map<string, number>());

  // Генеруємо порожній масив на 350 значень
  const today = new Date();
// Генеруємо масив останніх 350 днів
const filledData = Array.from({ length: totalCells }, (_, i) => {
  const date = new Date(today);
  date.setDate(today.getDate() - (totalCells - 1 - i)); // Віднімаємо `i` днів від сьогодні
  date.setHours(0, 0, 0, 0); // Вирівнюємо час, щоб уникнути проблем з порівнянням дат
  return aggregatedData.get(date.toDateString()) || 0;
});


  console.log("Filled Data:", filledData); // Перевірка коректності даних

  useEffect(() => {
    const updateWidth = () => {
      if (heatMapRef.current) {
        setContainerWidth(heatMapRef.current.clientWidth - 40); // Враховуємо місце для міток
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (heatMapRef.current) {
      d3.select(heatMapRef.current).select("svg").remove();
  
      const boxSize = Math.min(Math.floor(containerWidth / columns)); // Обмеження розміру клітинок
      const width = boxSize * columns + 40; // Додаємо місце для міток
      const height = boxSize * rows;
  
      const minValue = d3.min(filledData) ?? 0;
      let maxValue = d3.max(filledData) ?? 1;
  
      // Запобігаємо ситуації, коли minValue === maxValue
      if (minValue === maxValue) {
        maxValue = minValue + 1;
      }
  
      const colorScale = d3
        .scaleLinear<string>()
        .domain([minValue, maxValue])
        .range(["#e0e0e0", "#006400"]); // Від світло-сірого до темно-зеленого
  
      const svg = d3
        .select(heatMapRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
  
      // Додаємо мітки днів тижня
      svg
        .selectAll("text")
        .data(dayLabels)
        .join("text")
        .attr("x", 5)
        .attr("y", (_, index) => boxSize * index + boxSize / 2)
        .attr("dy", "0.35em")
        .attr("font-size", "12px")
        .attr("text-anchor", "start")
        .text((d) => d);
  
      svg
        .append("g")
        .attr("transform", "translate(40, 0)")
        .selectAll("rect")
        .data(filledData)
        .join("rect")
        .attr("width", boxSize - 2)
        .attr("height", boxSize - 2)
        .attr("x", (_, index) => boxSize * Math.floor(index / rows)) // Колонки йдуть по X
        .attr("y", (_, index) => boxSize * (index % rows)) // Рядки йдуть по Y
        .attr("fill", (d) => colorScale(d))
        .attr("stroke", "#999");
    }
  }, [filledData, containerWidth]);
  

  return <div ref={heatMapRef} style={{ width: "100%", height: "auto", overflowX: "hidden" }}></div>;
}

export default HeatMap;
