(function() {
  // Check if the environment is local (development)
  const isLocal = window.location.hostname === 'localhost';

  // Initialize configuration variables
  let spaceId, accessToken;

  if (isLocal) {
    // Fetch configuration from config.json in local environment
    fetch('config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(config => {
        spaceId = config.CONTENTFUL_SPACE_ID;
        accessToken = config.CONTENTFUL_ACCESS_TOKEN;

        // Proceed with using spaceId and accessToken
        fetchContentData(spaceId, accessToken);
      })
      .catch(error => console.error('Error loading config:', error));
  } else {
    // For production, we will set these variables manually or using a build process
    spaceId = ''; // Replace with your Contentful Space ID for production
    accessToken = ''; // Replace with your Contentful Access Token for production

    if (!spaceId || !accessToken) {
      console.error('Missing Contentful configuration for production.');
      return;
    }

    // Proceed with using spaceId and accessToken
    fetchContentData(spaceId, accessToken);
  }

  // Function to fetch data from Contentful
  function fetchContentData(spaceId, accessToken) {
    fetch(`https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}`)
      .then(response => response.json())
      .then(data => {
        console.log('data', data); // Handle the data as needed
        displayContent(data); // Example function to display content
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  // Function to display fetched content on the page
  function displayContent(data) {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) {
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
})();
