document.addEventListener("DOMContentLoaded", () => {
  const loadButton = document.getElementById("loadData");
  const countryList = document.getElementById("countryList");
  const productList = document.getElementById("productList");

  loadButton.addEventListener("click", handleLoadData); // when the load data button is clicked, start the loading data process based on the filters

  loadFilters(); // to download the filters category from a JSON file 

  function loadFilters() {
    // TODO: Replace with actual data from JSON
    const countries = ["Germany", "France", "USA", "India", "China"];
    const products = ["Live animals", "Vegetable products", "Prepared foodstuffs"];

    // Add categories in the checkbox 
    countries.forEach((country) => {
      const checkbox = document.createElement("label");
      checkbox.innerHTML = `<input type="checkbox" value="${country}" checked> ${country}`;
      countryList.appendChild(checkbox);
    });
    products.forEach((product) => {
      const checkbox = document.createElement("label");
      checkbox.innerHTML = `<input type="checkbox" value="${product}" checked> ${product}`;
      productList.appendChild(checkbox);
    });
  }

  function handleLoadData() {
    // get the filters ticked from the user
    const selectedCountries = getCheckedValues(countryList); // use getCheckedValues() 
    const selectedProducts = getCheckedValues(productList);
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const tradeType = document.querySelector('input[name="tradeType"]:checked')?.value || "both";

    const filters = {
      countries: selectedCountries,
      products: selectedProducts,
      startDate: start,
      endDate: end,
      tradeType: tradeType,
    };

    // call the function to access data based on the filters 
    fetchFilteredData(filters).then((data) => {
      renderMap(data);
      renderGraph(data);
    });
  }

  function getCheckedValues(container) {
    return [...container.querySelectorAll("input[type='checkbox']:checked")].map((cb) => cb.value);
  }

  async function fetchFilteredData(filters) {
    // TODO: Replace this with actual data loading logic
    console.log("Fetching data with filters:", filters);
  }

  function renderMap(data) {
    // TODO: Replace this with actual map rendering using D3 or Leaflet
    console.log("Rendering map with", data.length, "entries");
  }

  function renderGraph(data) {
    // TODO: Replace this with a line chart using D3
    console.log("Rendering graph with", data.length, "entries");
  }
});
