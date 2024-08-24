/**
 * Main script for fetching and displaying content from Contentful CMS.
 * Handles both local and production environments.
 * @file
 */

document.addEventListener('DOMContentLoaded', async () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  /**
   * Fetches content data based on the environment.
   * @returns {Promise<Object|null>} The JSON data from Contentful or null if an error occurs.
   */
  async function fetchContentData() {
    if (isLocal) {
      console.log('Running in local environment');
      return await fetchLocalContentData();
    } else {
      console.log('Running in production environment');
      return await fetchProductionContentData();
    }
  }

  /**
   * Fetches content data directly from Contentful when running locally.
   * @returns {Promise<Object|null>} JSON response from Contentful or null if an error occurs.
   */
  async function fetchLocalContentData() {
    try {
      const config = await fetch('config.json').then(response => response.json());
      const spaceId = config.CONTENTFUL_SPACE_ID;
      const accessToken = config.CONTENTFUL_ACCESS_TOKEN;
      const response = await fetch(`https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Contentful');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching local data:', error);
      return null;
    }
  }

  /**
   * Fetches content data via a Netlify function in production.
   * @returns {Promise<Object|null>} JSON response from the server or null if an error occurs.
   */
  async function fetchProductionContentData() {
    try {
      const response = await fetch('/.netlify/functions/fetch-contentful');
      if (!response.ok) {
        throw new Error('Failed to fetch data from Netlify function');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching production data:', error);
      return null;
    }
  }

  /**
   * Displays the fetched content on the webpage.
   * @param {Object} data - The data object containing items and assets from Contentful.
   */
  async function displayContent(data) {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer && data) {
      contentContainer.innerHTML = '';
      const assetMap = new Map(data.includes && data.includes.Asset ?
        data.includes.Asset.map(asset => [asset.sys.id, asset.fields.file.url]) : []);

      data.items.forEach(item => {
        const contentItem = document.createElement('div');
        contentItem.className = 'news-post';

        // Create and append post header
        const postHeader = document.createElement('div');
        postHeader.className = 'news-post-header';
        const formattedDate = new Date(item.sys.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        postHeader.innerHTML = `<h2>${item.fields.title}</h2><span class="date">${formattedDate}</span>`;
        contentItem.appendChild(postHeader);

        // Append post description
        const postDescription = document.createElement('div');
        postDescription.className = 'news-post-description';
        postDescription.innerHTML = `<p>${item.fields.description}</p>`;
        contentItem.appendChild(postDescription);

        // Add image gallery if images exist
        if (item.fields.images && item.fields.images.length > 0) {
          const galleryContainer = document.createElement('div');
          galleryContainer.className = 'gallery-container';
          item.fields.images.forEach(image => {
            const assetId = image.sys.id;
            const imageURL = assetMap.get(assetId);
            if (imageURL) {
              const imgElement = document.createElement('img');
              imgElement.src = `https:${imageURL}`;
              imgElement.alt = item.fields.title || '';
              imgElement.style.cursor = 'pointer';
              imgElement.addEventListener('click', () => {
                window.open(`image-viewer.html?src=https:${imageURL}`, '_blank');
              });
              galleryContainer.appendChild(imgElement);
            } else {
              console.warn('Asset not found for image:', image);
            }
          });
          contentItem.appendChild(galleryContainer);
        }

        contentContainer.appendChild(contentItem);
      });
    }
  }

  // Main execution
  const data = await fetchContentData();
  if (data) {
    displayContent(data);
  }
});