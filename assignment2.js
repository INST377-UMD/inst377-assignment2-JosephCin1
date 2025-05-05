// --- AUDIO BUTTONS ---
let isAudioOn = false;

function turnOnAudio() {
if (!isAudioOn) {
isAudioOn = true;
const msg = new SpeechSynthesisUtterance("Audio navigation is now ON.");
window.speechSynthesis.speak(msg);
alert("Audio Listening is now ON.\n\nTry saying: 'Hello', 'Navigate to home', or 'Change the color to red'.");
} else {
alert("Audio is already ON.");
}
}

function turnOffAudio() {
if (isAudioOn) {
window.speechSynthesis.cancel();
isAudioOn = false;
alert("Audio Listening is now OFF.");
} else {
alert("Audio is already OFF.");
}
}

// --- GLOBAL FUNCTION FOR STOCK LOOKUP ---
function lookupStock(ticker) {
const tickerInput = document.getElementById("ticker");
if (tickerInput) {
tickerInput.value = ticker;
fetchChart();
} else {
alert(`Ticker input field not found.`);
}
}

// --- FETCH CHART ---
async function fetchChart() {
const symbol = document.getElementById('ticker').value.toUpperCase();
const days = document.getElementById('days').value;
const apiKey = 'sbl3oGIu05pt2OOgL4AGzp9ELmh7C0oZ';
const to = Date.now();
const from = to - days * 24 * 60 * 60 * 1000;
const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?apiKey=${apiKey}`;
const res = await fetch(url);
const json = await res.json();

if (json.results) {
const labels = json.results.map(r => new Date(r.t).toLocaleDateString());
const data = json.results.map(r => r.c);
renderChart(labels, data);
} else {
alert("No chart data found.");
}
}

let chartInstance;
function renderChart(labels, data) {
const ctx = document.getElementById('stockChart').getContext('2d');
if (chartInstance) chartInstance.destroy();
chartInstance = new Chart(ctx, {
type: 'line',
data: {
    labels,
    datasets: [{
    label: 'Close Price',
    data,
    fill: false,
    borderColor: 'rgb(75,192,192)',
    tension: 0.1
    }]
}
});
}

// --- VOICE COMMANDS ---
if (annyang) {
const commands = {
'hello': () => alert('Hello'),
'change the color to *color': (color) => {
    document.body.style.backgroundColor = color;
},
'navigate to *page': (page) => {
    const lowerPage = page.toLowerCase();
    if (lowerPage.includes('home')) {
    window.location.href = 'home.html';
    } else if (lowerPage.includes('stock')) {
    window.location.href = 'stocks.html';
    } else if (lowerPage.includes('dog')) {
    window.location.href = 'dogs.html';
    } else {
    alert('Page not recognized. Try saying: navigate to home, stocks, or dogs.');
    }
},
'lookup *ticker': (ticker) => {
    const upperTicker = ticker.toUpperCase().replace(/\s+/g, '');
    const yahooFinanceUrl = `https://finance.yahoo.com/quote/${upperTicker}/`;
    window.open(yahooFinanceUrl, '_blank');
}
};

// If on stocks.html, override "lookup" to fetch chart
if (window.location.pathname.includes("stocks.html")) {
commands['lookup *ticker'] = (ticker) => {
    const cleanTicker = ticker.trim().toUpperCase();
    lookupStock(cleanTicker);
};
}

annyang.addCommands(commands);
annyang.start();
}

// --- STOCK PAGE ONLY ---
if (window.location.pathname.includes("stocks.html")) {
document.getElementById('fetchButton').addEventListener('click', fetchChart);

const redditUrl = `https://tradestie.com/api/v1/apps/reddit?date=2022-04-03`;
fetch(redditUrl)
.then(response => response.json())
.then(data => {
    const top5 = data.sort((a) => a.no_of_comments).slice(0, 5);
    const tableBody = document.querySelector("#stockTable tbody");

    top5.forEach((stock, index) => {
    const row = document.createElement("tr");

    let sentimentImage = stock.sentiment === "Bullish"
        ? "<img src='https://www.shutterstock.com/image-vector/bullish-market-trend-charging-bull-600nw-2526656507.jpg' alt='Bullish' />"
        : "<img src='https://img.freepik.com/premium-photo/bearish-stock-market-crash-economy-crisis-concept-with-digital-red-arrow-glowing-financial-chart-candlestick-bear-illustration-dark-background-with-indicators-3d-rendering_670147-39237.jpg' alt='Bearish' />";

    row.innerHTML = `
        <td>${index + 1}</td>
        <td><a href="https://finance.yahoo.com/lookup/?s=${stock.ticker}" target="_blank">${stock.ticker}</a></td>
        <td>${stock.no_of_comments}</td>
        <td>${stock.sentiment} ${sentimentImage}</td>
    `;
    tableBody.appendChild(row);
    });
});
}

// --- DOGS PAGE ONLY ---
if (window.location.pathname.includes("dogs.html")) {
document.addEventListener("DOMContentLoaded", () => {
// Load dog images for slider
async function loadDogImages(count = 10) {
    const container = document.getElementById('myslider');
    for (let i = 0; i < count; i++) {
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await res.json();
    const img = document.createElement('img');
    img.src = data.message;
    container.appendChild(img);
    }

    simpleslider.getSlider({
    container: container,
    init: -100,
    show: 0,
    end: 100,
    unit: '%'
    });
}

loadDogImages();

// Fetch dog breed buttons
const apiUrl = "https://dogapi.dog/api/v2/breeds";
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
    const breeds = data.data;
    const buttonsContainer = document.getElementById("buttons-container");

    breeds.forEach(breed => {
        const button = document.createElement("button");
        button.textContent = breed.name;
        button.classList.add("button-50");
        button.setAttribute("data-id", breed.id);
        button.addEventListener("click", () => showBreedDetails(breed.id));
        buttonsContainer.appendChild(button);
    });
    });

// Show breed details
function showBreedDetails(breedId) {
    fetch(`https://dogapi.dog/api/v2/breeds/${breedId}`)
    .then(response => response.json())
    .then(data => {
        const breed = data.data;
        const breedContainer = document.getElementById("breed-container");
        breedContainer.innerHTML = '';

        const container = document.createElement("div");
        container.classList.add("container");

        const breedName = document.createElement("h2");
        breedName.textContent = `Breed Name: ${breed.name}`;
        container.appendChild(breedName);

        const breedDescription = document.createElement("p");
        breedDescription.textContent = `Description: ${breed.description}`;
        container.appendChild(breedDescription);

        if (breed.life_span) {
        const minLife = document.createElement("p");
        minLife.textContent = `Min Life: ${breed.life_span.min || "Not available"}`;
        container.appendChild(minLife);

        const maxLife = document.createElement("p");
        maxLife.textContent = `Max Life: ${breed.life_span.max || "Not available"}`;
        container.appendChild(maxLife);
        } else {
        const noLifeSpan = document.createElement("p");
        noLifeSpan.textContent = "Life span information is not available for this breed.";
        container.appendChild(noLifeSpan);
        }

        breedContainer.appendChild(container);
        container.style.display = "block";
    });
}
});
}
