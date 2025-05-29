const svg = d3.select("#barChart");
const width = +svg.attr("width") - 40;
const height = +svg.attr("height") - 40;
const margin = { top: 20, right: 20, bottom: 200, left: 80 }; 

const chartDescriptions = {
  exports: "This chart shows the top 10 products exported from Switzerland, based on value.",
  imports: "This chart shows the top 10 products imported into Switzerland.",
  import_years: "These are the years with the highest total imports recorded.",
  export_years: "These are the years with the highest total exports recorded.",
  abs_diff: "These products show the largest absolute differences between imports and exports."
};

let dataOptions = {};

d3.json("./datastats/top10stats.json").then(data => {
  // Convert to usable format
  dataOptions = {
    exports: Object.entries(data.top_exported_products.data).map(([name, value]) => ({ name, value })),
    imports: Object.entries(data.top_imported_products.data).map(([name, value]) => ({ name, value })),
    import_years: Object.entries(data.highest_importation_years.data).map(([year, value]) => ({ name: year, value })),
    export_years: Object.entries(data.highest_exportation_years.data).map(([year, value]) => ({ name: year, value })),
    abs_diff: Object.entries(data.biggest_import_export_diff_products.data).map(([name, obj]) => ({
      name,
      value: obj.abs_diff
    }))
  };

  // Initial chart
  updateChart("exports");
});

function updateChart(stat) {
  const data = dataOptions[stat];
  if (!data) return;

  svg.selectAll("*").remove();

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em")
    .style("text-anchor", "end")
    .style("font-family", "Segoe UI, Arial, sans-serif")
    .style("font-size", "12px");

  // Y Axis with values in billions
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(y)
        .tickFormat(d => (d / 1_000_000_000).toFixed(1)) // Convert to billions
    )
    .selectAll("text")
    .style("font-family", "Segoe UI, Arial, sans-serif");

  // Y Axis label
  svg.append("text")
    .attr("transform", `rotate(-90)`)
    .attr("y", margin.left / 4)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Billion CHF");

  // Bars
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.value))
    .attr("fill", "#6a5acd")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.name}</strong><br/>Value: ${(d.value / 1_000_000_000).toFixed(2)} Billion CHF`);
      d3.select(this).attr("fill", "#483d8b");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      d3.select(this).attr("fill", "#6a5acd");
    });
  d3.select("#barDescription").text(chartDescriptions[stat] || "");
}



// Listen to changes
d3.selectAll("input[name='tradeType']").on("change", function () {
  updateChart(this.value);
});


// tooltip on hover
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "6px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0)
  .style("font-size", "13px");

  
const pieSvg = d3.select("#pieChart");
const pieWidth = +pieSvg.attr("width");
const pieHeight = +pieSvg.attr("height");
const pieRadius = Math.min(pieWidth, pieHeight) / 2 - 5;
const pieGroup = pieSvg.append("g").attr("transform", `translate(${pieWidth / 2},${pieHeight / 2})`);

let pieData = {};
let pieTooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "6px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0)
  .style("font-size", "13px");

// Load and process pie chart data
d3.json("./datastats/piechart.json").then(data => {
  pieData = data;
  renderPieButtons(Object.values(data).map(d => d.category));
  updatePieChart(Object.keys(data)[0]); // Default
});

function renderPieButtons(categories) {
  const container = d3.select("#categoryButtons");
  container.selectAll("button")
    .data(categories)
    .enter()
    .append("button")
    .text(d => d)
    .on("click", function (event, d) {
      const code = Object.keys(pieData).find(key => pieData[key].category === d);
      updatePieChart(code);
      d3.selectAll("#categoryButtons button").classed("active", false);
      d3.select(this).classed("active", true);
    });
}

function updatePieChart(categoryCode) {
  const importData = pieData[categoryCode].import;
  const total = d3.sum(Object.values(importData));
  const filtered = Object.entries(importData)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value / total >= 0.005);

  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(pieRadius - 10);

  const color = d3.scaleOrdinal()
    .domain(filtered.map(d => d.name))
    .range(d3.schemeTableau10);

  // Update imports pie chart
  const arcs = pieGroup.selectAll("path")
    .data(pie(filtered));

  arcs.enter().append("path")
    .merge(arcs)
    .attr("d", arc)
    .attr("fill", d => color(d.data.name))
    .on("mouseover", function (event, d) {
      pieTooltip
        .style("opacity", 1)
        .html(`<strong>${d.data.name}</strong><br/>${(d.data.value / total * 100).toFixed(2)}% (${d.data.value.toLocaleString()})`);
      d3.select(this).attr("stroke", "#333").attr("stroke-width", 2);
    })
    .on("mousemove", function (event) {
      pieTooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      pieTooltip.style("opacity", 0);
      d3.select(this).attr("stroke", "none");
    });

  arcs.exit().remove();

  // Labels
  const labelArc = d3.arc().innerRadius(pieRadius * 0.6).outerRadius(pieRadius);
  pieGroup.selectAll("text").remove();

  pieGroup.selectAll("text")
    .data(pie(filtered))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text(d => (d.data.value / total >= 0.05 ? d.data.name : ""));

  // --------------------------
  // Fix: Export chart section
  // --------------------------

  const exportData = pieData[categoryCode].export;
  const exportTotal = d3.sum(Object.values(exportData));
  const exportFiltered = Object.entries(exportData)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value / exportTotal >= 0.005);

  const exportSvg = d3.select("#exportPieChart");
  exportSvg.selectAll("*").remove(); // Remove everything first

  const exportGroup = exportSvg.append("g")
    .attr("transform", `translate(${+exportSvg.attr("width") / 2},${+exportSvg.attr("height") / 2})`);

  const exportPie = d3.pie().value(d => d.value);
  const exportArc = d3.arc().innerRadius(0).outerRadius(pieRadius - 10);
  const exportColor = d3.scaleOrdinal()
    .domain(exportFiltered.map(d => d.name))
    .range(d3.schemeTableau10);

  const exportArcs = exportGroup.selectAll("path")
    .data(exportPie(exportFiltered));

  exportArcs.enter()
    .append("path")
    .merge(exportArcs)
    .attr("d", exportArc)
    .attr("fill", d => exportColor(d.data.name))
    .on("mouseover", function (event, d) {
      pieTooltip
        .style("opacity", 1)
        .html(`<strong>${d.data.name}</strong><br/>${(d.data.value / exportTotal * 100).toFixed(2)}% (${d.data.value.toLocaleString()})`);
      d3.select(this).attr("stroke", "#333").attr("stroke-width", 2);
    })
    .on("mousemove", function (event) {
      pieTooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      pieTooltip.style("opacity", 0);
      d3.select(this).attr("stroke", "none");
    });

  exportArcs.exit().remove();

  // Optional: Add export labels
  exportGroup.selectAll("text")
    .data(exportPie(exportFiltered))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text(d => (d.data.value / exportTotal >= 0.05 ? d.data.name : ""));
}

