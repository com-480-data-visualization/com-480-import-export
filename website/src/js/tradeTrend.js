
// --- Aggregation ---
export function aggregateYearlyTotals(data) {
    const groupedData = {};

    // Group data by (ctry_id, tn_num)
    data.forEach(item => {
        const key = `${item.ctry_id}-${item.tn_num}`;
        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push({
            date: new Date(item.date), // Convert date string to Date object
            chf: item.chf
        });
    });

    // Convert grouped data into an array of series
    return Object.entries(groupedData).map(([key, values]) => {
        const [ctry_id, tn_num] = key.split('-');
        return {
            name: `Country: ${ctry_id}, Trade Number: ${tn_num}`,
            values: values.sort((a, b) => a.date - b.date) // Sort by date
        };
    });
}

// --- D3 Rendering ---
export function renderTradeTrend(containerSelector, data, startDate, endDate) {
    console.log("Rendering trade trend with data:", data);
    console.log(data[0].values[0].date);
    d3.select(containerSelector).select("svg").remove();

    const width = 1000, height = 300, margin = { top: 20, right: 30, bottom: 50, left: 60 };

    const allDates = data.flatMap(series => series.values.map(d => d.date));
    const allValues = data.flatMap(series => series.values.map(d => d.chf));

    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleTime()
        .domain([new Date(startDate), new Date(endDate)]) // Use startDate and endDate for x-axis domain
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(allValues)]).nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .defined(d => d.chf !== null) // Skip points with missing data
        .x(d => x(d.date))
        .y(d => y(d.chf));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Plot each series
    data.forEach((series, i) => {
        svg.append("path")
            .datum(series.values)
            .attr("fill", "none")
            .attr("stroke", color(i))
            .attr("stroke-width", 2)
            .attr("d", line);
    });

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(d3.timeMonth).tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right - 150},${margin.top})`);

    data.forEach((series, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
        g.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", color(i));
        g.append("text")
            .attr("x", 20)
            .attr("y", 11)
            .style("font-size", "12px")
            .text(series.name);
    });
}

// --- Toggle Logic and Initialization ---

export function initTradeTrend() {
    function renderCurrentTrend(startDate, endDate, data) {
        console.log("Rendering trade trend data", data);
        renderTradeTrend("#graph", aggregateYearlyTotals(data));
    }

    async function setupLoadDataButton() {
        const btn = document.getElementById('loadData');
        if (btn) {
            btn.onclick = async () => {
                const tradeTypeFilter = document.querySelector('input[name="tradeType"]:checked').value; // 'import', 'export', 'both'
                // const dateFilter = document.getElementById('dateFilter').value; // e.g., '2020-2024'
                const startDate = document.getElementById('startDate').value // '2020-01'
                const endDate = document.getElementById('endDate').value // '2022-12'
                if(!startDate || !endDate) {
                    alert("Please select a start and end date");
                    return;
                }
                const ctryId = document.getElementById('countries-dropdown').value // Country ID
                if(!ctryId) {
                    alert("Please select 1 country");
                    return;
                }
                const tnNum = '0101.1100' // document.getElementById('tnFilter').value; // Trade number
                console.log("Trade Type Filter:", tradeTypeFilter, "Start Date:", startDate, "End Date:", endDate, "Country ID:", ctryId, "Trade Number:", tnNum);
                const startYear = startDate.split('-')[0]; // Extract year
                const endYear = endDate.split('-')[0]; // Extract year
                let fetchedData;
                if (tradeTypeFilter === 'import') {
                    fetchedData = await fetchImportData(startYear, endYear, ctryId, tnNum);
                } else if (tradeTypeFilter === 'export') {
                    fetchedData = await fetchExportData(startYear, endYear, ctryId, tnNum);
                }

                if (fetchedData.length !== 0) {
                    renderCurrentTrend(startDate, endDate, fetchedData);
                } else {
                    alert("No data found for the selected filters.");
                }
                console.log("Fetched Data:", fetchedData);
            };
        }
    }

    // renderCurrentTrend();
    // setupToggleButton();
    setupLoadDataButton();
}



async function fetchImportData(startYear, endYear, ctryId, tnNum) {
    const importApiUrl = 'https://rdhi4u76gl.execute-api.eu-central-1.amazonaws.com/default/import_data';
    const query = `?start_year=${startYear}&end_year=${endYear}&ctry_id=${ctryId}&tn_num=${tnNum}`;
  
    try {
      const response = await fetch(`${importApiUrl}${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching trade data:', error);
    }
}

async function fetchExportData(startYear, endYear, ctryId, tnNum) {
    const exportApiUrl= 'https://ynz65i16s2.execute-api.eu-central-1.amazonaws.com/default/export_data';
    const query = `?start_year=${startYear}&end_year=${endYear}&ctry_id=${ctryId}&tn_num=${tnNum}`;
  
    try {
      const response = await fetch(`${exportApiUrl}${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching trade data:', error);
    }
}