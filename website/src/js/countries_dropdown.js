export async function showDropDown(countries, onSelectCountry) {
    const dropdown = d3.select('#countries-dropdown');

    // Load the country_matched.csv file
    const csvData = await d3.csv('data/country_matched.csv');
    console.log(csvData);

    const countryOptions = csvData.map(d => ({
        map_name: d.map_name,
        ctry_id: d.ctry_id
    }));
    console.log(countryOptions);

    
    dropdown.selectAll('option')
        .data(countryOptions)
        .enter()
        .append('option')
        .attr('value', d => d.map_name)
        .text(d => d.map_name);

    
    dropdown.on('change', function () {
        const selected_country = this.value;
        console.log('Selected country:', selected_country);

        const selectedCountryData = countryOptions.find(d => d.map_name === selected_country);
        if (selectedCountryData) {
            console.log('Corresponding ctry_id:', selectedCountryData.ctry_id);

            // Find the corresponding country data from the geoJson file
            const geoJsonCountryData = countries.find(d => d.properties.name === selected_country);
            if (geoJsonCountryData) {
                onSelectCountry(geoJsonCountryData);
            } else {
                console.warn('No matching country found in geoJson for:', selected_country);
            }
        } else {
            console.warn('No matching country found in CSV for:', selected_country);
        }
    });
}