document.addEventListener('DOMContentLoaded', () => {
  fetch('assets/data/partnerData.json')
    .then(response => response.json())
    .then(data => {
      populateGrid(data.sponsors, 'sponsors-grid');
      populateGrid(data.partners, 'partners-grid');
      populateGrid(data.sisterClubs, 'sister-clubs-grid');
    })
    .catch(error => console.error('Error loading data:', error));
});

function populateGrid(items, gridId) {
  const gridContainer = document.getElementById(gridId);
  items.forEach(item => {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <h3>${item.title}</h3>
    `;
    gridContainer.appendChild(gridItem);
  });
}
