// entry point for the app

import { renderWorldMap, reset_map } from './worldmap.js';
import { initTradeTrend } from './tradeTrend.js';
import { setupDateValidation } from './date.js';



function loadData() {
    console.log("loadData called !!----");

    renderWorldMap();
    console.log("World map rendered successfully");
    initTradeTrend();
    console.log("Trade trend initialized successfully");

    // d3.csv(dataUrl).then(data => {
    //     console.log("Data loaded successfully:", data);
    //     renderWorldMap();
        
    // }).catch(error => {
    //     console.error('Error loading the data: ???????', error);
    // });
}

function setupForm() {
    // Toggle sidebar
    const sidebar = document.getElementById('sidebar');

    // Handle form submission
    document.getElementById('filter-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const filters = {
        trade: formData.get('trade'),
        countries: formData.getAll('countries'),
        start: formData.get('start'),
        end: formData.get('end')
      };
      console.log('Filters applied:', filters);
      
    });

    document.getElementById('resetForm').addEventListener('click', function(e) {
      reset_map();
      const section = document.querySelector('.tradeVisualization');
      section.classList.remove('visible');
      d3.select('#graph').select('svg').remove();
    });
}

function init() {
    console.log("init called");
    loadData();
    console.log("Data loading initiated");
    setupDateValidation();
    console.log("Date validation setup completed");

    setupForm();
    console.log("Form setup completed");
}

document.addEventListener('DOMContentLoaded', init);