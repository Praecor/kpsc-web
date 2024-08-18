document.addEventListener('DOMContentLoaded', async () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  async function fetchLocalContentData() {
    try {
      // Fetch Contentful credentials from config.json for local development
      const config = await fetch('config.json').then(response => response.json());
      const spaceId = config.CONTENTFUL_SPACE_ID;
      const accessToken = config.CONTENTFUL_ACCESS_TOKEN;

      // Fetch data from Contentful API
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

  async function fetchProductionContentData() {
    try {
      // Fetch data from the Netlify serverless function
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

  async function fetchContentData() {
    // Determine environment and fetch data accordingly
    if (isLocal) {
      console.log('Running in local environment');
      return await fetchLocalContentData();
    } else {
      console.log('Running in production environment');
      return await fetchProductionContentData();
    }
  }

  async function displayContent(data) {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer && data) {
      contentContainer.innerHTML = ''; // Clear existing content

      // Create a map to resolve assets
      const assetMap = new Map();
      if (data.includes && data.includes.Asset) {
        data.includes.Asset.forEach(asset => {
          assetMap.set(asset.sys.id, asset.fields.file.url);
        });
      }

      data.items.forEach(item => {
        const contentItem = document.createElement('div');
        contentItem.className = 'news-post';

        // Create the header with title and date
        const postHeader = document.createElement('div');
        postHeader.className = 'news-post-header';
        postHeader.innerHTML = `
          <h2>${item.fields.title}</h2>
          <span class="date">${new Date(item.sys.createdAt).toLocaleDateString()}</span>
        `;
        contentItem.appendChild(postHeader);

        // Create the description section
        const postDescription = document.createElement('div');
        postDescription.className = 'news-post-description';
        postDescription.innerHTML = `<p>${item.fields.description}</p>`;
        contentItem.appendChild(postDescription);

        // Create the gallery if images exist
        if (item.fields.images && item.fields.images.length > 0) {
          const galleryContainer = document.createElement('div');
          galleryContainer.className = 'gallery-container';

          item.fields.images.forEach(image => {
            const assetId = image.sys.id; // Get the ID of the linked asset
            const imageURL = assetMap.get(assetId); // Retrieve the URL from the asset map

            if (imageURL) {
              const imgElement = document.createElement('img');
              imgElement.src = `https:${imageURL}`; // Prefixing with https:
              imgElement.alt = item.fields.title || ''; // Use the post title as alt text if available
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

  // Fetch and display the content
  const data = await fetchContentData();
  if (data) {
    displayContent(data);
  }
});
