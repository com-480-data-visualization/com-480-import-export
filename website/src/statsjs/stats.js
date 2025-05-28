// src/statsjs/stats.js

const dataOptions = {
  exports: [
    { name: "Gold", value: 120 },
    { name: "Pharmaceuticals", value: 95 },
    { name: "Watches", value: 80 },
    { name: "Machinery", value: 60 },
    { name: "Chemicals", value: 50 },
    { name: "Instruments", value: 45 },
    { name: "Textiles", value: 30 },
    { name: "Food", value: 28 },
    { name: "Beverages", value: 25 },
    { name: "Metals", value: 20 }
  ],
  imports: [
    { name: "Energy", value: 100 },
    { name: "Vehicles", value: 85 },
    { name: "Electronics", value: 75 },
    { name: "Clothing", value: 65 },
    { name: "Food", value: 55 },
    { name: "Pharma", value: 50 },
    { name: "Plastic", value: 45 },
    { name: "Machines", value: 40 },
    { name: "Tools", value: 35 },
    { name: "Furniture", value: 30 }
  ],
  growth: [
    { name: "Solar Panels", value: 150 },
    { name: "Electric Vehicles", value: 130 },
    { name: "Biotech", value: 110 },
    { name: "AI Chips", value: 90 },
    { name: "Drones", value: 70 },
    { name: "Green Tech", value: 60 },
    { name: "Batteries", value: 55 },
    { name: "Wind Turbines", value: 45 },
    { name: "MedTech", value: 35 },
    { name: "Agritech", value: 30 }
  ]
};

const svg = d3.select("#barChart");
const width = +svg.attr("width") - 40;
const height = +svg.attr("height") - 40;
const margin = { top: 20, right: 20, bottom: 80, left: 60 };

function updateChart(stat) {
  const data = dataOptions[stat];

  svg.selectAll("*").remove();

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-family", "Segoe UI, Arial, sans-serif");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-family", "Segoe UI, Arial, sans-serif");

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.value))
    .attr("fill", "#6a5acd");
}

// Initial chart
updateChart("exports");

d3.selectAll("input[name='tradeType']").on("change", function () {
  updateChart(this.value);
});
