export function showDropDown(countries, onSelectCountry) {
    const dropdown = d3.select('#countries-dropdown');

    
    dropdown.selectAll('option')
        .data(countries)
        .enter()
        .append('option')
        .attr('value', d => d.properties.name)
        .text(d => d.properties.name);

    
    dropdown.on('change', function () {
        const selected_country = this.value;
        console.log('Selected country:', this.value);
        if (selected_country) {
            const country_data = countries.find(d => d.properties.name === selected_country);
            onSelectCountry(country_data);
        }
    });
}