import { showDropDown } from './countries_dropdown.js';



const svgWidth = 1500;
const svgHeight = 750;

const projection = d3.geoMercator()
    .scale(200)
    .translate([svgWidth / 2, svgHeight / 1.5]);

const geoPath = d3.geoPath().projection(projection);

const switzerlandCoords = [8.2275, 46.8182]; // [lon, lat]

const svg = d3.select('#map')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

export function renderWorldMap() {
    d3.json('./data/countries.geo.json')
        .then(worldData => {
            console.log('GeoJSON DATA:', worldData); 
            draw_countries(worldData.features);

            const countries = worldData.features.map(d => d.properties.name);
            console.log('Country names from data:',  countries); 
            showDropDown(worldData.features, highlight_country);

        })
        .catch(err => {
            console.error('Failed to load world map data:', err);
        });
}

function highlight_country(country_data) {
    // console.log("highlight_country called with:", country_data);

    if(country_data.properties.name === 'Switzerland') {
        svg.selectAll('.country')
        .filter(d => d.properties.name === country_data.properties.name)
        .attr('fill', 'red');
    } else {
        // svg.selectAll('.country')
        //     .attr('fill', '#e0e0e0');

        svg.selectAll('.country')
            .filter(d => d.properties.name === country_data.properties.name)
            .attr('fill', 'orange');

        // Update the dropdown selection
        const dropdown = d3.select('#countries-dropdown');
        const selectedOption = dropdown.selectAll('option')
            .filter(d => d.map_name === country_data.properties.name);
        console.log("selected", selectedOption.datum())
        if (!selectedOption.empty()) {
            const currentDropdownValue = dropdown.property('value');
            const newDropdownValue = selectedOption.datum().ctry_id;

            // Only update the dropdown if the value is different
            if (currentDropdownValue !== newDropdownValue) {
                dropdown.property('value', newDropdownValue); // Set the dropdown value
                dropdown.dispatch('change'); // Trigger the change event
            }
        }
    }
}

function reset_map() {
    svg.selectAll('.country')
        .attr('fill', '#e0e0e0');
}

function draw_countries(countries) {
    const mapGroup = svg.append('g').attr('class', 'map-layer');

    mapGroup.selectAll('path')
        .data(countries)
        .enter()
        .append('path')
        .attr('class', 'country') // just to check if it's missing - yes it was missing
        .attr('d', geoPath)
        .attr('fill', '#e0e0e0')
        .attr('stroke', '#444')
        .attr('stroke-width', 0.5)
        .on('click', (event, d) => {
            const countryName = d.properties.name;
            const countryCenter = d3.geoCentroid(d);
            console.log(`Clicked: ${countryName}`);
            drawTradeLine(switzerlandCoords, countryCenter, countryName);
            highlight_country({properties: { name: countryName }});
        });
    
    highlight_country({properties: { name: 'Switzerland' }});
}

function drawTradeLine(StartCoordinates, EndCoordinates, label) {
    // Remove existing trade lines and labels if needed
    // svg.selectAll('.trade-line').remove();
    // svg.selectAll('.trade-label').remove();

    const [x1, y1] = projection(StartCoordinates);
    const [x2, y2] = projection(EndCoordinates);


    const midPoint = [(x1 + x2) / 2, (y1 + y2) / 2 - 30]; 
    const lineData = [
        { x: x1, y: y1 },
        { x: midPoint[0], y: midPoint[1] },
        { x: x2, y: y2 }
    ];

    
    const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCatmullRom.alpha(0.5)); 

   
    svg.append('path')
        .datum(lineData)
        .attr('class', 'trade-line')
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .on('mouseover', function () {
            d3.select(this)
                .attr('stroke', 'blue')
                .attr('stroke-width', 3);

            svg.append('text')
                .attr('class', 'trade-label')
                .attr('x', midPoint[0])
                .attr('y', midPoint[1] - 10)
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .text(`Trade with ${label}`);
        })
        .on('mouseout', function () {
            d3.select(this)
                .attr('stroke', 'red')
                .attr('stroke-width', 2);

            svg.selectAll('.trade-label').remove();
        });
}
