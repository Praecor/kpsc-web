/**
 * Script for populating grids with organizational data on the webpage.
 * @file
 */

document.addEventListener( 'DOMContentLoaded', () => {

  fetch( 'assets/data/organisations.json' )
    .then( response => response.json() )
    .then( data => {
      populateGrid( data.umbrellaOrgs, 'umbrella-grid' );
      populateGrid( data.partners, 'partner-grid' );
      populateGrid( data.sponsors, 'sponsor-grid' );
    } )
    .catch( error => console.error( 'Error loading data:', error ) );
} );


function populateGrid( items, gridId ) {
  const gridContainer = document.getElementById( gridId );
  if ( !gridContainer ) {
    console.error( `Grid container with id ${gridId} not found.` );
    return;
  }

  items.forEach( item => {
    const gridItem = createGridItemElement( item );
    gridContainer.appendChild( gridItem );
  } );
}


function createGridItemElement( item ) {
  const gridItem = document.createElement( 'div' );
  gridItem.classList.add( 'grid-item' );
  gridItem.innerHTML = `
    <div class="img-container">
      <img src="${item.image}" alt="${item.title}">
    </div>
    <h3>${item.title}</h3>
  `;

  gridItem.addEventListener( 'click', () => {
    if ( item.url ) {
      window.open( item.url, '_blank' );
    } else {
      console.warn( `No URL provided for ${item.title}` );
    }
  } );

  return gridItem;
}