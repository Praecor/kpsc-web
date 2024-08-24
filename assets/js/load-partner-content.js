document.addEventListener('DOMContentLoaded', () => {
  fetch('assets/data/organisations.json')
    .then(response => response.json())
    .then(data => {
      populateGrid(data.umbrellaOrgs, 'umbrella-grid');
      populateGrid(data.partners, 'partner-grid');
      populateGrid(data.sponsors, 'sponsor-grid');
    })
    .catch(error => console.error('Error loading data:', error));
});

function populateGrid(items, gridId) {
  const gridContainer = document.getElementById(gridId);
  items.forEach(item => {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridItem.innerHTML = `
      <div class="img-container">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <h3>${item.title}</h3>
    `;
    gridItem.addEventListener('click', () => {
      window.open(item.url, '_blank'); // Navigate to the URL in a new tab
    });
    gridContainer.appendChild(gridItem);
  });
}