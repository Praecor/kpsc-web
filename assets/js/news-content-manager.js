/**
 * Main script for fetching and displaying content from Contentful CMS.
 * Handles both local and production environments.
 */

document.addEventListener( 'DOMContentLoaded', async () => {
  const isLocal = [ 'localhost', '127.0.0.1' ].includes( window.location.hostname );
  const spinner = document.getElementById( 'spinner' );
  spinner.style.display = 'block';

  async function fetchContentData() {
    return isLocal ? fetchLocalContentData() : fetchProductionContentData();
  }

  async function fetchLocalContentData() {
    try {
      const { CONTENTFUL_SPACE_ID: spaceId, CONTENTFUL_ACCESS_TOKEN: accessToken } = await fetchConfig();
      return fetchContentfulData( spaceId, accessToken );
    } catch ( error ) {
      console.error( 'Error fetching local data:', error );
      return null;
    }
  }

  async function fetchProductionContentData() {
    try {
      const response = await fetch( '/.netlify/functions/fetch-contentful' );
      if ( !response.ok ) throw new Error( 'Failed to fetch data from Netlify function' );
      return response.json();
    } catch ( error ) {
      console.error( 'Error fetching production data:', error );
      return null;
    }
  }

  async function fetchConfig() {
    const response = await fetch( 'config.json' );
    if ( !response.ok ) throw new Error( 'Failed to fetch config' );
    return response.json();
  }

  async function fetchContentfulData( spaceId, accessToken ) {
    const response = await fetch( `https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}&include=10` );
    if ( !response.ok ) throw new Error( 'Failed to fetch data from Contentful' );
    return response.json();
  }

  async function displayContent( data ) {
    const contentContainer = document.getElementById( 'content-container' );
    if ( contentContainer && data ) {
      contentContainer.innerHTML = '';
      const assetMap = new Map( data.includes?.Asset?.map( asset => [ asset.sys.id, asset.fields.file.url ] ) || [] );
      const sortedItems = sortItemsByDate( data.items );

      sortedItems.forEach( item => {
        if ( !( item.fields.title.startsWith( 'TEST' ) && !isLocal ) ) {
          contentContainer.appendChild( createContentItem( item, assetMap, data.includes ) );
        }
      } );
    }
  }

  function createContentItem( item, assetMap, includes ) {
    const contentItem = document.createElement( 'div' );
    contentItem.className = 'news-post';
    contentItem.appendChild( createPostHeader( item ) );
    contentItem.appendChild( createPostDescription( item, includes ) );
    if ( item.fields.images?.length ) {
      contentItem.appendChild( createImageGallery( item, assetMap ) );
    }
    return contentItem;
  }

  function createPostHeader( item ) {
    const postHeader = document.createElement( 'div' );
    postHeader.className = 'news-post-header';
    postHeader.innerHTML = `<h2>${item.fields.title}</h2><span class="date">${formatDate( item.fields.date )}</span>`;
    return postHeader;
  }

  function createPostDescription( item, includes ) {
    const postDescription = document.createElement( 'div' );
    postDescription.className = 'news-post-description';
    postDescription.innerHTML = documentToHtmlString( item.fields.content );

    const pdfContainer = document.createElement( 'div' );
    pdfContainer.className = 'pdf-links-container';

    item.fields.docs?.forEach( docLink => {
      const resolvedDoc = resolveAsset( docLink, includes );
      if ( resolvedDoc?.fields.file ) {
        const pdfLink = document.createElement( 'a' );
        pdfLink.href = `https:${resolvedDoc.fields.file.url}`;
        pdfLink.textContent = resolvedDoc.fields.file.fileName;
        pdfLink.target = '_blank';
        pdfLink.className = 'pdf-download-link';
        pdfContainer.appendChild( pdfLink );
      } else {
        console.warn( 'Could not resolve document:', docLink );
      }
    } );

    postDescription.appendChild( pdfContainer );
    return postDescription;
  }

  function createImageGallery( item, assetMap ) {
    const galleryContainer = document.createElement( 'div' );
    galleryContainer.className = 'gallery-container';
    item.fields.images.forEach( image => {
      const imageURL = assetMap.get( image.sys.id );
      if ( imageURL ) {
        const imgElement = document.createElement( 'img' );
        imgElement.src = `https:${imageURL}`;
        imgElement.alt = item.fields.title || '';
        imgElement.style.cursor = 'pointer';
        imgElement.addEventListener( 'click', () => {
          window.open( `image-viewer.html?src=https:${imageURL}`, '_blank' );
        } );
        galleryContainer.appendChild( imgElement );
      } else {
        console.warn( 'Asset not found for image:', image );
      }
    } );
    return galleryContainer;
  }

  function resolveAsset( assetLink, includes ) {
    return includes?.Asset?.find( asset => asset.sys.id === assetLink.sys.id ) || null;
  }

  function sortItemsByDate( items ) {
    return items.sort( ( a, b ) => new Date( b.fields.date ) - new Date( a.fields.date ) );
  }

  function formatDate( dateString ) {
    const date = new Date( dateString );
    return `${String( date.getDate() ).padStart( 2, '0' )}/${String( date.getMonth() + 1 ).padStart( 2, '0' )}/${date.getFullYear()}`;
  }

  const data = await fetchContentData();
  spinner.style.display = 'none';
  if ( data ) {
    displayContent( data );
  }
} );