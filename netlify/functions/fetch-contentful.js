const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !accessToken) {
    return {
      statusCode: 400,
      body: 'Missing Contentful configuration.',
    };
  }

  try {
    const response = await fetch(`https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}`);
    if (!response.ok) {
      console.error('Failed to fetch from Contentful:', response.statusText);
      return {
        statusCode: response.status,
        body: 'Failed to fetch data from Contentful',
      };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`,
    };
  }
};
