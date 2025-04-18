// entry point for the app

import { renderWorldMap } from './worldmap.js';


const dataUrl = './dataset/OGD_LAND.csv';

function loadData() {
    console.log("loadData called !!----");
    d3.csv(dataUrl).then(data => {
        console.log("Data loaded successfully:", data);
        renderWorldMap();
        
    }).catch(error => {
        console.error('Error loading the data: ???????', error);
    });
}

function init() {
    console.log("init called");
    loadData();
}

document.addEventListener('DOMContentLoaded', init);