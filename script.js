// 국가 데이터 import
import { asiaCountries } from './data/asia.js';
import { northAmericaCountries } from './data/north-america.js';
import { southAmericaCountries } from './data/south-america.js';
import { europeCountries } from './data/europe.js';
import { oceaniaCountries } from './data/oceania.js';
import { africaCountries } from './data/africa.js';

// 모든 국가 데이터 통합
const countries = [...asiaCountries, ...northAmericaCountries, ...southAmericaCountries, ...europeCountries, ...oceaniaCountries, ...africaCountries];

let selectedContinent = 'all';
let history = [];
let map = null;
let currentMarker = null;

// DOM 요소들
const continentButtons = document.querySelectorAll('.continent-btn');
const pickButton = document.getElementById('pick-button');
const resultSection = document.getElementById('result-section');
const historyList = document.getElementById('history-list');
const mapElement = document.getElementById('country-map');

// OpenStreetMap 초기화
function initMap() {
    // 기본 위치 (세계 중심)
    map = L.map('country-map').setView([20, 0], 2);
    
    // 더 안정적인 OpenStreetMap 타일 레이어 사용
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: 'abc'
    }).addTo(map);
}

// 지도에 마커 표시
function showCountryOnMap(country) {
    if (!map) return;
    
    // 기존 마커 제거
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // 국가명으로 좌표 검색 (Nominatim API 사용)
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(country.name)}&limit=1`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);
                
                // 지도 중심 이동
                map.setView([lat, lon], 6);
                
                // 새 마커 추가
                currentMarker = L.marker([lat, lon], {
                    title: country.name
                }).addTo(map);
                
                // 팝업 추가
                currentMarker.bindPopup(`
                    <div style="text-align: center;">
                        <h3 style="margin: 0 0 5px 0; color: #333;">${country.name}</h3>
                        <p style="margin: 0; color: #666;">${country.capital}</p>
                    </div>
                `);
                
            } else {
                console.log('지도 좌표를 찾을 수 없습니다:', country.name);
            }
        })
        .catch(error => {
            console.error('지도 좌표 검색 오류:', error);
        });
}

// 대륙 필터 기능
continentButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 기존 활성 버튼 제거
        continentButtons.forEach(btn => btn.classList.remove('active'));
        // 클릭된 버튼 활성화
        button.classList.add('active');
        selectedContinent = button.dataset.continent;
    });
});

// 랜덤 국가 선택 기능
pickButton.addEventListener('click', () => {
    // 선택된 대륙에 따라 국가 필터링
    let filteredCountries = countries;
    if (selectedContinent !== 'all') {
        filteredCountries = countries.filter(country => country.continent === selectedContinent);
    }
    
    if (filteredCountries.length === 0) {
        alert('선택한 대륙에 국가가 없습니다.');
        return;
    }
    
    // 랜덤 국가 선택
    const randomIndex = Math.floor(Math.random() * filteredCountries.length);
    const selectedCountry = filteredCountries[randomIndex];
    
    // 결과 표시
    displayResult(selectedCountry);
    
    // 히스토리에 추가
    addToHistory(selectedCountry);
    
    // 버튼 애니메이션
    animateButton();
});

// 국가별 색상 테마
const countryColors = {
    'asia': { bg: '#ff6b6b', color: '#fff' },
    'europe': { bg: '#4ecdc4', color: '#fff' },
    'africa': { bg: '#45b7d1', color: '#fff' },
    'north-america': { bg: '#96ceb4', color: '#fff' },
    'south-america': { bg: '#feca57', color: '#fff' },
    'oceania': { bg: '#ff9ff3', color: '#fff' }
};

// 결과 표시 함수
function displayResult(country) {
    const flagElement = document.getElementById('country-flag');
    
    // 이모지 설정
    flagElement.textContent = country.flag;
    
    // 이모지가 안 보일 경우를 대비한 대체 방법
    // 더 정확한 이모지 감지 방법
    const testEmoji = '🇰🇷'; // 테스트용 이모지
    const testElement = document.createElement('span');
    testElement.textContent = testEmoji;
    testElement.style.fontFamily = 'Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji, sans-serif';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    document.body.appendChild(testElement);
    
    // 이모지가 제대로 표시되는지 확인
    const isEmojiSupported = testElement.offsetWidth > 0 && testElement.offsetHeight > 0;
    document.body.removeChild(testElement);
    
    if (!isEmojiSupported || !country.flag || country.flag.length < 2) {
        // 이모지가 제대로 표시되지 않으면 국가명 첫 글자로 대체
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
        // 이모지가 정상적으로 표시되면 원래 스타일 유지
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
    
    // 지도에 국가 위치 표시
    showCountryOnMap(country);
    
    // 결과 섹션 표시
    resultSection.style.display = 'block';
    
    // 스크롤 애니메이션
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 대륙명 변환 함수
function getContinentName(continentCode) {
    const continentNames = {
        'asia': '아시아',
        'europe': '유럽',
        'africa': '아프리카',
        'north-america': '북아메리카',
        'south-america': '남아메리카',
        'oceania': '오세아니아'
    };
    return continentNames[continentCode] || continentCode;
}

// 히스토리에 추가
function addToHistory(country) {
    // 이미 있는 경우 제거
    history = history.filter(item => item.name !== country.name);
    
    // 맨 앞에 추가
    history.unshift(country);
    
    // 최대 6개까지만 유지
    if (history.length > 6) {
        history = history.slice(0, 6);
    }
    
    // 히스토리 표시 업데이트
    updateHistoryDisplay();
}

// 히스토리 표시 업데이트
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    // 이모지 지원 여부 확인 (한 번만)
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
        
        // 이모지가 안 보일 경우를 대비한 대체 텍스트
        let flagDisplay = country.flag;
        let flagStyle = '';
        
        if (!isEmojiSupported || !country.flag || country.flag.length < 2) {
            // 이모지가 제대로 표시되지 않을 경우 국가명 첫 글자로 대체
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

// 버튼 애니메이션
function animateButton() {
    pickButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        pickButton.style.transform = 'scale(1)';
    }, 150);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 히스토리 초기화
    updateHistoryDisplay();
    
    // 버튼에 클릭 효과 추가
    pickButton.addEventListener('mousedown', () => {
        pickButton.style.transform = 'scale(0.95)';
    });
    
    pickButton.addEventListener('mouseup', () => {
        pickButton.style.transform = 'scale(1)';
    });
    
    pickButton.addEventListener('mouseleave', () => {
        pickButton.style.transform = 'scale(1)';
    });
    
    // 지도 초기화 (약간의 지연을 두어 DOM이 완전히 로드된 후 실행)
    setTimeout(() => {
        if (typeof L !== 'undefined' && L.map) {
            initMap();
            console.log('지도가 성공적으로 초기화되었습니다.');
        } else {
            console.error('Leaflet.js가 로드되지 않았습니다.');
        }
    }, 100);
});

// 키보드 단축키 (스페이스바로 랜덤 선택)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        pickButton.click();
    }
}); 