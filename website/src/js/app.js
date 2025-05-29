// entry point for the app

import { renderWorldMap } from './worldmap.js';
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

function init() {
    console.log("init called");
    loadData();
    console.log("Data loading initiated");
    setupDateValidation();
    console.log("Date validation setup completed");
}

document.addEventListener('DOMContentLoaded', init);