/**
 * Script for populating grids with organizational data on the webpage.
 * @file
 */

document.addEventListener( 'DOMContentLoaded', () => {
  /**
   * Fetches organizational data and populates the respective grids on the page.
   */
  fetch( 'assets/data/organisations.json' )
    .then( response => response.json() )
    .then( data => {
      populateGrid( data.umbrellaOrgs, 'umbrella-grid' );
      populateGrid( data.partners, 'partner-grid' );
      populateGrid( data.sponsors, 'sponsor-grid' );
    } )
    .catch( error => console.error( 'Error loading data:', error ) );
} );

/**
 * Populates a grid on the webpage with items from a data array.
 * @param {Array} items - An array of objects containing item data (image, title, url).
 * @param {string} gridId - The ID of the HTML element where the grid will be populated.
 */
function populateGrid( items, gridId ) {
  const gridContainer = document.getElementById( gridId );
  if ( !gridContainer ) {
    console.error( `Grid container with id ${gridId} not found.` );
    return;
  }

  items.forEach( item => {
    const gridItem = document.createElement( 'div' );
    gridItem.classList.add( 'grid-item' );
    gridItem.innerHTML = createGridItem( item );

    // Add click event to open item's URL in a new tab
    gridItem.addEventListener( 'click', () => {
      if ( item.url ) {
        window.open( item.url, '_blank' );
      } else {
        console.warn( `No URL provided for ${item.title}` );
      }
    } );

    /**
     * Creates a grid item HTML string for a given item.
     *
     * @param {Object} item - The item object containing image and title.
     * @returns {string} The HTML string for the grid item.
     */
    function createGridItem(item) {
      return `
        <div class="img-container">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <h3>${item.title}</h3>
      `;
    }

    gridContainer.appendChild( gridItem );
  } );
}