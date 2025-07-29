// Import country data
import { asiaCountries } from './data/asia-en.js';
import { northAmericaCountries } from './data/north-america-en.js';
import { southAmericaCountries } from './data/south-america-en.js';
import { europeCountries } from './data/europe-en.js';
import { oceaniaCountries } from './data/oceania-en.js';
import { africaCountries } from './data/africa-en.js';

// Combine all country data
const countries = [...asiaCountries, ...northAmericaCountries, ...southAmericaCountries, ...europeCountries, ...oceaniaCountries, ...africaCountries];

let selectedContinent = 'all';
let history = [];
let map = null;
let currentMarker = null;

// DOM elements
const continentButtons = document.querySelectorAll('.continent-btn');
const pickButton = document.getElementById('pick-button');
const resultSection = document.getElementById('result-section');
const historyList = document.getElementById('history-list');
const mapElement = document.getElementById('country-map');

// Country color themes
const countryColors = {
    'asia': { bg: '#ff6b6b', color: '#fff' },
    'europe': { bg: '#4ecdc4', color: '#fff' },
    'africa': { bg: '#45b7d1', color: '#fff' },
    'north-america': { bg: '#96ceb4', color: '#fff' },
    'south-america': { bg: '#feca57', color: '#fff' },
    'oceania': { bg: '#ff9ff3', color: '#fff' }
};

// Initialize OpenStreetMap
function initMap() {
    // Default location (world center)
    map = L.map('country-map').setView([20, 0], 2);
    
    // Use stable OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: 'abc'
    }).addTo(map);
}

// Show country on map
function showCountryOnMap(country) {
    if (!map) return;
    
    // Remove existing marker
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // Search coordinates by country name (using Nominatim API)
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(country.name)}&limit=1`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);
                
                // Move map center
                map.setView([lat, lon], 6);
                
                // Add new marker
                currentMarker = L.marker([lat, lon], {
                    title: country.name
                }).addTo(map);
                
                // Add popup
                currentMarker.bindPopup(`
                    <div style="text-align: center;">
                        <h3 style="margin: 0 0 5px 0; color: #333;">${country.name}</h3>
                        <p style="margin: 0; color: #666;">${country.capital}</p>
                    </div>
                `);
                
            } else {
                console.log('Could not find map coordinates for:', country.name);
            }
        })
        .catch(error => {
            console.error('Map coordinate search error:', error);
        });
}

// Continent filter functionality
continentButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove existing active button
        continentButtons.forEach(btn => btn.classList.remove('active'));
        // Activate clicked button
        button.classList.add('active');
        selectedContinent = button.dataset.continent;
    });
});

// Random country selection functionality
pickButton.addEventListener('click', () => {
    // Filter countries by selected continent
    let filteredCountries = countries;
    if (selectedContinent !== 'all') {
        filteredCountries = countries.filter(country => country.continent === selectedContinent);
    }
    
    if (filteredCountries.length === 0) {
        alert('No countries found in the selected continent.');
        return;
    }
    
    // Select random country
    const randomIndex = Math.floor(Math.random() * filteredCountries.length);
    const selectedCountry = filteredCountries[randomIndex];
    
    // Display result
    displayResult(selectedCountry);
    
    // Add to history
    addToHistory(selectedCountry);
    
    // Button animation
    animateButton();
});

// Display result function
function displayResult(country) {
    const flagElement = document.getElementById('country-flag');
    
    // Set emoji
    flagElement.textContent = country.flag;
    
    // Alternative method for when emoji is not visible
    const testEmoji = '🇰🇷'; // Test emoji
    const testElement = document.createElement('span');
    testElement.textContent = testEmoji;
    testElement.style.fontFamily = 'Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji, sans-serif';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    document.body.appendChild(testElement);
    
    // Check if emoji is properly displayed
    const isEmojiSupported = testElement.offsetWidth > 0 && testElement.offsetHeight > 0;
    document.body.removeChild(testElement);
    
    if (!isEmojiSupported || !country.flag || country.flag.length < 2) {
        // Replace with first letter of country name if emoji is not displayed
        const colors = countryColors[country.continent] || { bg: '#667eea', color: '#fff' };
        
        flagElement.textContent = country.name.charAt(0);
        flagElement.style.fontSize = '2.5rem';
        flagElement.style.fontWeight = 'bold';
        flagElement.style.color = colors.color;
        flagElement.style.backgroundColor = colors.bg;
        flagElement.style.borderRadius = '50%';
        flagElement.style.width = '80px';
        flagElement.style.height = '80px';
        flagElement.style.lineHeight = '80px';
        flagElement.style.margin = '0 auto 15px';
        flagElement.style.display = 'flex';
        flagElement.style.alignItems = 'center';
        flagElement.style.justifyContent = 'center';
    } else {
        // Maintain original style if emoji is displayed normally
        flagElement.style.fontSize = '3rem';
        flagElement.style.fontWeight = 'normal';
        flagElement.style.color = 'inherit';
        flagElement.style.backgroundColor = 'transparent';
        flagElement.style.borderRadius = '0';
        flagElement.style.width = 'auto';
        flagElement.style.height = 'auto';
        flagElement.style.lineHeight = '1';
        flagElement.style.margin = '0 0 15px';
        flagElement.style.display = 'block';
    }
    
    document.getElementById('country-name').textContent = country.name;
    document.getElementById('country-continent').textContent = getContinentName(country.continent);
    document.getElementById('country-capital').textContent = country.capital;
    document.getElementById('country-population').textContent = country.population;
    document.getElementById('country-area').textContent = country.area;
    
    // Show country location on map
    showCountryOnMap(country);
    
    // Show result section
    resultSection.style.display = 'block';
    
    // Scroll animation
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Convert continent name function
function getContinentName(continentCode) {
    const continentNames = {
        'asia': 'Asia',
        'europe': 'Europe',
        'africa': 'Africa',
        'north-america': 'North America',
        'south-america': 'South America',
        'oceania': 'Oceania'
    };
    return continentNames[continentCode] || continentCode;
}

// Add to history
function addToHistory(country) {
    // Remove if already exists
    history = history.filter(item => item.name !== country.name);
    
    // Add to front
    history.unshift(country);
    
    // Keep maximum 6 items
    if (history.length > 6) {
        history = history.slice(0, 6);
    }
    
    // Update history display
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    // Check emoji support (once)
    const testEmoji = '🇰🇷';
    const testElement = document.createElement('span');
    testElement.textContent = testEmoji;
    testElement.style.fontFamily = 'Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji, sans-serif';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    document.body.appendChild(testElement);
    const isEmojiSupported = testElement.offsetWidth > 0 && testElement.offsetHeight > 0;
    document.body.removeChild(testElement);
    
    history.forEach(country => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Alternative text for when emoji is not visible
        let flagDisplay = country.flag;
        let flagStyle = '';
        
        if (!isEmojiSupported || !country.flag || country.flag.length < 2) {
            // Replace with first letter of country name if emoji is not displayed
            const colors = countryColors[country.continent] || { bg: '#667eea', color: '#fff' };
            
            flagDisplay = country.name.charAt(0);
            flagStyle = `
                font-size: 1.5rem; 
                font-weight: bold; 
                color: ${colors.color};
                background-color: ${colors.bg};
                border-radius: 50%;
                width: 50px;
                height: 50px;
                line-height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 8px;
            `;
        }
        
        historyItem.innerHTML = `
            <span class="history-flag" style="${flagStyle}">${flagDisplay}</span>
            <div class="history-name">${country.name}</div>
            <div class="history-continent">${getContinentName(country.continent)}</div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Button animation
function animateButton() {
    pickButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        pickButton.style.transform = 'scale(1)';
    }, 150);
}

// Page load initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize history
    updateHistoryDisplay();
    
    // Add click effects to button
    pickButton.addEventListener('mousedown', () => {
        pickButton.style.transform = 'scale(0.95)';
    });
    
    pickButton.addEventListener('mouseup', () => {
        pickButton.style.transform = 'scale(1)';
    });
    
    pickButton.addEventListener('mouseleave', () => {
        pickButton.style.transform = 'scale(1)';
    });
    
    // Initialize map (with slight delay to ensure DOM is fully loaded)
    setTimeout(() => {
        if (typeof L !== 'undefined' && L.map) {
            initMap();
            console.log('Map initialized successfully.');
        } else {
            console.error('Leaflet.js not loaded.');
        }
    }, 100);
});

// Keyboard shortcut (spacebar for random selection)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        pickButton.click();
    }
});