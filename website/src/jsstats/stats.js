const svg = d3.select("#barChart");
const width = +svg.attr("width") ;
const height = +svg.attr("height") ;
const margin = { top: 20, right: 20, bottom: 100, left: 80 }; 

const chartDescriptions = {
  exports: "Between 1988 and 2023, Switzerland’s top exports closely aligned with its strengths in precision manufacturing, finance, and luxury goods. Key export items included gold, diamonds, jewelry, and platinum, often re-exported after refinement or incorporation into high-end products. These materials supported Switzerland’s reputation as a global center for luxury and value-added processing. One of the country’s most iconic exports was watches, reflecting centuries of expertise in horology. Swiss watches, renowned for their craftsmanship and precision, contributed significantly to the country's global image and export revenues. The pharmaceutical industry was another major pillar, with medications consistently ranking among the top exports thanks to Switzerland's world-class research and production facilities. Although the country has limited natural resources, it also exported electricity at times when domestic production—particularly from hydroelectric sources—exceeded demand.",
  imports: "Between 1988 and 2023, Switzerland's top imports consistently reflected its role as a global financial and trading hub. Among the most significant imported goods were gold, diamonds, jewelry, and platinum, driven by Switzerland’s strong watchmaking and luxury goods industries. These precious materials were often imported for refining, processing, or inclusion in high-value products for re-export. In addition to luxury commodities, medications represented a major import category, supporting Switzerland’s advanced pharmaceutical sector. Unrefined oil was also a key import, necessary for the country’s limited domestic energy resources. Electricity imports became increasingly important to complement national production and ensure grid stability, especially during periods of high demand or low domestic output. The import of cars remained substantial, reflecting Switzerland's high per-capita income and demand for private transportation. Over the decades, these categories have shaped Switzerland’s import landscape, reflecting both industrial needs and consumer preferences in a highly developed economy.",
  import_years: "Over the last ten years, Switzerland’s import activity has remained robust and consistent, reflecting the country’s role as a global trading hub and industrial center. The top import years included a steady progression of high trade volumes, with only slight dips in 2014 and 2015, which still ranked within the top ten despite being outpaced by earlier peaks in 2012 and 2013. Import trends over the decade showed strong resilience, even through global challenges like the COVID-19 pandemic, with only temporary slowdowns. The country’s strategic focus on value-added processing and consumption of essential goods maintained a high level of trade continuity and diversity.",
  export_years: "Switzerland’s export performance over the most recent decade has shown remarkable stability and strength. All ten years, including 2014 and 2015, featured high export values, with only slightly lower volumes in those two years compared to peak years like 2012 and 2013. The Swiss economy maintained a near-balanced trade flow throughout the period, with exports closely tracking imports in both scale and structure. Demand for Swiss products remained high globally, thanks to their reputation for quality, precision, and innovation, even in economically uncertain times like the COVID-19 pandemic.",
  abs_diff: "Between 1988 and 2023, Switzerland’s trade balance by category highlighted major export strengths and key import dependencies. Medications led exports due to the strong pharmaceutical sector, while watches confirmed Swiss dominance in luxury goods. On the import side, unrefined oil and cars showed large deficits, reflecting energy needs and limited domestic auto production. Gold stood out for both high imports and exports, as Switzerland refines and re-exports precious metals. Other significant categories included jewelry, platinum, and diamonds—pointing to Switzerland’s role in high-value material processing."
};

let dataOptions = {};

d3.json("./datastats/top10stats.json").then(data => {
  // Convert to usable format
  dataOptions = {
    exports: Object.entries(data.top_exported_products.data).map(([name, value]) => ({
      name,
      short_name: value.short_name || name,
      value: value.value
    })),
    imports: Object.entries(data.top_imported_products.data).map(([name, value]) => ({
      name,
      short_name: value.short_name || name,
      value: value.value
    })),
    import_years: Object.entries(data.highest_importation_years.data).map(([year, value]) => ({ name: year,short_name: year, value })),
    export_years: Object.entries(data.highest_exportation_years.data).map(([year, value]) => ({ name: year,short_name: year, value })),
    abs_diff: Object.entries(data.biggest_import_export_diff_products.data).map(([name, obj]) => ({
      name,
      short_name: obj.short_name || name,
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
    .domain(data.map(d => d.short_name))
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
    .attr("x", d => x(d.short_name))
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

  const buttons = container.selectAll("button")
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

  buttons.filter((d, i) => i === 0).classed("active", true);
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
        .html(`<strong>${d.data.name}</strong><br/>${Math.round(d.data.value / 1_000_000).toLocaleString()} Million CHF`);
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
        .html(`<strong>${d.data.name}</strong><br/>${Math.round(d.data.value / 1_000_000).toLocaleString()} Million CHF`);
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

