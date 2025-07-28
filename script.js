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

// DOM 요소들
const continentButtons = document.querySelectorAll('.continent-btn');
const pickButton = document.getElementById('pick-button');
const resultSection = document.getElementById('result-section');
const historyList = document.getElementById('history-list');

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
    
    // choose random countries
    const randomIndex = Math.floor(Math.random() * filteredCountries.length);
    const selectedCountry = filteredCountries[randomIndex];
    
    // show result
    displayResult(selectedCountry);
    
    // 히스토리에 추가
    addToHistory(selectedCountry);
    
    // 버튼 애니메이션
    animateButton();
});

// 결과 표시 함수
function displayResult(country) {
    document.getElementById('country-flag').textContent = country.flag;
    document.getElementById('country-name').textContent = country.name;
    document.getElementById('country-continent').textContent = getContinentName(country.continent);
    document.getElementById('country-capital').textContent = country.capital;
    document.getElementById('country-population').textContent = country.population;
    document.getElementById('country-area').textContent = country.area;
    
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
    
    history.forEach(country => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="history-flag">${country.flag}</span>
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
});

// 키보드 단축키 (스페이스바로 랜덤 선택)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        pickButton.click();
    }
}); 
