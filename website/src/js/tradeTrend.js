import { getSelectedPaths, lookupText } from './product_list.js';
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
            name: `${ctry_id} - TN: ${tn_num}`,
            values: values.sort((a, b) => a.date - b.date) // Sort by date
        };
    });
}

// --- D3 Rendering ---
export function renderTradeTrend(containerSelector, data, startDate, endDate) {
    // ---- 1) SETUP & FLATTEN ----
    d3.select(containerSelector).select("svg").remove();

    const containerWidth = document.querySelector('#map').clientWidth / 3 * 2;
    // console.log(containerWidth);
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  
    // make sure every item’s date is a Date:
    data.forEach(s => s.values.forEach(d => d.date = new Date(d.date)));
  
    const allDates  = data.flatMap(s => s.values.map(d => d.date));
  
    const start = startDate ? new Date(startDate) : d3.min(allDates),
          end   = endDate   ? new Date(endDate)   : d3.max(allDates);
  
    // ---- 2) COMPUTE YEAR SPAN ----
    const fullYears =
      end.getFullYear() - start.getFullYear()
      - (
          (end.getMonth()  < start.getMonth()) ||
          (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
        ? 1
        : 0
      );
  
    // ---- 3) DECIDE INTERVALS & (OPTIONALLY) RE-AGGREGATE ----
    let tickInterval, 
        binInterval, 
        binFormat = d3.timeFormat("%b %Y"); // fallback formatting
  
    if (fullYears <= 4) {
      tickInterval = d3.timeMonth.every(1);
      binInterval  = null;  // no binning, plot raw points
    }
    else if (fullYears <= 12) {
      tickInterval = d3.timeMonth.every(6);
      binInterval  = 6;     // we’ll bin into 6-month buckets
      binFormat    = d3.timeFormat("%b %Y");
    }
    else {
      tickInterval = d3.timeYear.every(1);
      binInterval  = 12;    // 12 months → annual bins
      binFormat    = d3.timeFormat("%Y");
    }
  
    // if we need to bin, do a quick sum-aggregation into 6-month (or annual) buckets:
    const plotData = binInterval
      ? data.map(series => {
          // build bucket boundaries:
          const buckets = [];
          let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
          while (cursor <= end) {
            buckets.push(new Date(cursor));
            cursor = new Date(cursor.getFullYear(),
                              cursor.getMonth() + binInterval, 1);
          }
          // assign sums:
          const binned = buckets.map((b, i) => {
            const next = buckets[i+1] || end;
            const sum = d3.sum(series.values,
                               d => (d.date >= b && d.date < next) ? d.chf : 0);
            return { date: b, chf: sum };
          });
          return { name: series.name, values: binned };
        })
      : data;  // no binning, use original
  
    // ---- 4) SCALES & LINE ----
    const x = d3.scaleTime()
        .domain([start, end])
        .range([margin.left, containerWidth - margin.right]);

    const allValues = plotData.flatMap(s => s.values.map(d => d.chf));
    const y = d3.scaleLinear()
        .domain([0, d3.max(allValues)]).nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .defined(d => d.chf != null)
        .x(d => x(d.date))
        .y(d => y(d.chf));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("width",  containerWidth)
        .attr("height", height);
  
    // draw each series
    plotData.forEach((series, i) => {
      svg.append("path")
        .datum(series.values)
        .attr("fill",  "none")
        .attr("stroke", color(i))
        .attr("stroke-width", 2)
        .attr("d", line);
    });
  
    // ---- 5) AXES ----
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .ticks(tickInterval)
          .tickFormat(binFormat)
      )
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
  
    const yAxisG = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
    // append the label
    yAxisG.append("text")
        .attr("fill", "currentColor")        // inherit axis text color
        .attr("transform", "rotate(-90)")     // rotate so it reads bottom→top
        .attr("y", -margin.left - 3)         // move it left of the axis line
        .attr("x", - (height - margin.top - margin.bottom) / 2)  
        .attr("dy", "1em")                    // small offset down
        .style("text-anchor", "middle")       // center alignment
        .text("in CHF");
  
    // ---- 6) LEGEND ----
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform",
              `translate(${containerWidth - margin.right - 150},${margin.top})`);
  
    plotData.forEach((series, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      g.append("rect")
        .attr("width",  14)
        .attr("height", 14)
        .attr("fill",   color(i));
      g.append("text")
        .attr("x", 20)
        .attr("y", 11)
        .style("font-size", "12px")
        .text(series.name);
    });
}

// --- Toggle Logic and Initialization ---

export function initTradeTrend() {
    function renderCurrentTrend(startDate, endDate, fetchedDataOrAll, selectedTnNum) {
        console.log("Rendering trade trend data", fetchedDataOrAll, selectedTnNum);

        let seriesArray;
        if (Array.isArray(fetchedDataOrAll)) {
          // old behavior: a flat array of records
          console.log("Old data format detected, aggregating yearly totals.");
          seriesArray = aggregateYearlyTotals(fetchedDataOrAll);
        } else {
          // new behavior: an object of the form { prefix: { import: […], export: […] }, … }
          seriesArray = Object.entries(fetchedDataOrAll)
            .flatMap(([prefix, dirs]) =>
              // for each prefix, build one series for import and one for export
              ["Import", "Export"]
                .filter(dir => Array.isArray(dirs[dir]) && dirs[dir].length > 0)
                .map(dir => ({
                  name:      `${dir} of ${lookupText(selectedTnNum[prefix])} `,
                  values:    dirs[dir].map(item => ({
                               date: new Date(item.date),
                               chf:  item.chf
                             }))
                }))
            );
        }

        console.log("Series Array:", seriesArray);
        renderTradeTrend("#graph", seriesArray, startDate, endDate);

        // renderTradeTrend("#graph", aggregateYearlyTotals(data), startDate, endDate);
    }

    async function setupLoadDataButton() {
        const btn = document.getElementById('loadData');
        if (btn) {
            btn.onclick = async () => {
                const tradeTypeFilter = document.querySelector('input[name="tradeType"]:checked').value; // 'import', 'export', 'both'
                const startDate = document.getElementById('startDate').value // '2020-01'
                const endDate = document.getElementById('endDate').value // '2022-12'
                if(!startDate || !endDate) {
                    alert("Please select a start and end date");
                    return;
                }
                const ctryId = document.getElementById('countries-dropdown').value // Country ID
                if(!ctryId) {
                    alert("Please select a country");
                    return;
                }

                // const tnNum = '3004.1000' // document.getElementById('tnFilter').value; // Trade number
                let selectedTnNum = {};
                getSelectedPaths().forEach(path => {
                  console.log(path)
                  selectedTnNum[path.at(-1)] = path; // push last element
                });
                
                console.log("Trade Type Filter:", tradeTypeFilter, "Start Date:", startDate, "End Date:", endDate, "Country ID:", ctryId, "Trade Numbers:", selectedTnNum);
                const startYear = startDate.split('-')[0]; // Extract year
                const endYear = endDate.split('-')[0]; // Extract year
                let fetchedDataAll = {};
                
                for (let tnNum of Object.keys(selectedTnNum)) {
                    fetchedDataAll[tnNum] = {}; // Initialize an array for each TN number
                    console.log("Fetching data for TN Number:", tnNum);
                    if (tradeTypeFilter === 'import') {
                      let fetchedData = await fetchImportData(startYear, endYear, ctryId, tnNum);
                      console.log("Fetched Import Data:", tnNum, fetchedData);
                      fetchedDataAll[tnNum] = {"Import": fetchedData}; // Store data for each TN number
                    } else if (tradeTypeFilter === 'export') {
                        let fetchedData = await fetchExportData(startYear, endYear, ctryId, tnNum);
                        console.log("Fetched Export Data:", tnNum, fetchedData);
                        fetchedDataAll[tnNum] = {"Export": fetchedData}; // Store data for each TN number
                    } else if (tradeTypeFilter === 'both') {
                        const importData = await fetchImportData(startYear, endYear, ctryId, tnNum);
                        const exportData = await fetchExportData(startYear, endYear, ctryId, tnNum);
                        fetchedDataAll[tnNum] = {"Export": exportData, "Import": importData};
                    }
                    console.log("All", fetchedDataAll)
                    console.log(Object.keys(fetchedDataAll).length, "Trade Numbers fetched");

                    const hasAny = Object.values(fetchedDataAll).some(sub =>
                      Object.values(sub).some(arr => arr.length > 0)
                    );
                    console.log(hasAny); // true

                    if (hasAny) {
                        renderCurrentTrend(startDate, endDate, fetchedDataAll, selectedTnNum);
                        const section = document.querySelector('.tradeVisualization');
                        section.classList.add('visible');
                    } else {
                        console.warn("No data found for the selected filters.");
                    }
                    
                }
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