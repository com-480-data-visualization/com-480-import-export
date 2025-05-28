const svg = d3.select("#barChart");
const width = +svg.attr("width") - 40;
const height = +svg.attr("height") - 40;
const margin = { top: 20, right: 20, bottom: 100, left: 200 }; 


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

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-family", "Segoe UI, Arial, sans-serif");

  const bars = svg.selectAll("rect")
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
        .html(`<strong>${d.name}</strong><br/>Value: ${d.value}`);
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

