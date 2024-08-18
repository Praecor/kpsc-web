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

  function displayContent(data) {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer && data) {
      contentContainer.innerHTML = ''; // Clear existing content
      data.items.forEach(item => {
        const contentItem = document.createElement('div');
        contentItem.className = 'content-item';
        contentItem.innerHTML = `
          <h2>${item.fields.title}</h2>
          <p>${item.fields.description}</p>
          <a href="${item.fields.link}">Read more</a>
        `;
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
