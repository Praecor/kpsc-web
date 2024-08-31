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
    const isStaging = process.env.NETLIFY_ENV === 'staging'; // Check if in staging
    return isStaging ? await fetchStagingContentData() : (isLocal ? await fetchLocalContentData() : await fetchProductionContentData());
  }

  /**
   * Fetches content data directly from Contentful when running locally.
   * @returns {Promise<Object|null>} JSON response from Contentful or null if an error occurs.
   */
  async function fetchLocalContentData() {
    try {
      const config = await fetchConfig();
      const { CONTENTFUL_SPACE_ID: spaceId, CONTENTFUL_ACCESS_TOKEN: accessToken } = config;
      return await fetchContentfulData(spaceId, accessToken);
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
      if (!response.ok) throw new Error('Failed to fetch data from Netlify function');
      return await response.json();
    } catch (error) {
      console.error('Error fetching production data:', error);
      return null;
    }
  }

  /**
   * Fetches the configuration file.
   * @returns {Promise<Object>} The JSON configuration data.
   */
  async function fetchConfig() {
    const response = await fetch('config.json');
    if (!response.ok) throw new Error('Failed to fetch config');
    return await response.json();
  }

  /**
   * Fetches data from Contentful.
   * @param {string} spaceId - The Contentful space ID.
   * @param {string} accessToken - The Contentful access token.
   * @returns {Promise<Object>} The JSON data from Contentful.
   */
  async function fetchContentfulData(spaceId, accessToken) {
    const response = await fetch(`https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}`);
    if (!response.ok) throw new Error('Failed to fetch data from Contentful');
    return await response.json();
  }

  /**
   * Fetches data from Contentful in staging environment.
   * @returns {Promise<Object|null>} JSON response from the server or null if an error occurs.
   */
  async function fetchStagingContentData() {
    const response = await fetch('/.netlify/functions/fetch-contentful-staging'); // Adjust the function to fetch from staging
    if (!response.ok) throw new Error('Failed to fetch data from staging Netlify function');
    return await response.json();
  }

  /**
   * Creates the post header element.
   * @param {Object} item - The content item.
   * @returns {HTMLElement} The post header element.
   */
  function createPostHeader(item) {
    const postHeader = document.createElement('div');
    postHeader.className = 'news-post-header';
    const formattedDate = new Date(item.sys.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    postHeader.innerHTML = `<h2>${item.fields.title}</h2><span class="date">${formattedDate}</span>`;
    return postHeader;
  }

  /**
   * Creates the post description element.
   * @param {Object} item - The content item.
   * @returns {HTMLElement} The post description element.
   */
  function createPostDescription(item) {
    const postDescription = document.createElement('div');
    postDescription.className = 'news-post-description';
    postDescription.innerHTML = `<p>${item.fields.description}</p>`;
    return postDescription;
  }

  /**
   * Creates the image gallery element.
   * @param {Object} item - The content item.
   * @param {Map} assetMap - The map of asset IDs to URLs.
   * @returns {HTMLElement} The image gallery element.
   */
  function createImageGallery(item, assetMap) {
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'gallery-container';
    for (const image of item.fields.images) {
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
    }
    return galleryContainer;
  }

  /**
   * Creates the content item element.
   * @param {Object} item - The content item.
   * @param {Map} assetMap - The map of asset IDs to URLs.
   * @returns {HTMLElement} The content item element.
   */
  function createContentItem(item, assetMap) {
    const contentItem = document.createElement('div');
    contentItem.className = 'news-post';
    contentItem.appendChild(createPostHeader(item));
    contentItem.appendChild(createPostDescription(item));
    if (item.fields.images && item.fields.images.length > 0) {
      contentItem.appendChild(createImageGallery(item, assetMap));
    }
    return contentItem;
  }

  /**
   * Displays the fetched content on the webpage.
   * @param {Object} data - The data object containing items and assets from Contentful.
   */
  async function displayContent(data) {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer && data) {
      contentContainer.innerHTML = '';
      const assetMap = new Map(data.includes?.Asset?.map(asset => [asset.sys.id, asset.fields.file.url]) || []);
      for (const item of data.items) {
        contentContainer.appendChild(createContentItem(item, assetMap));
      }
    }
  }

  // Main execution
  const data = await fetchContentData();
  if (data) {
    displayContent(data);
  }
});