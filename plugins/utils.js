const fs = require('fs');
const fetch = require('node-fetch');
const he = require('he');
/**
 * createFile
 */

async function createFile({file, name, directory, location, verbose = false}) {
  try {
    mkdirp(directory);
    verbose && console.log(`[${name}] Created directory ${directory}`);
    await promiseToWriteFile(location, file);
    verbose && console.log(`[${name}] Successfully wrote file to ${location}`);
    return `[${name}] Successfully wrote file to ${location}`
  } catch (e) {
    throw new Error(`[${name}] Failed to create file: ${e.message}`);
  }
}

/**
 * promiseToWriteFile
 */

function promiseToWriteFile(location, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(location, content, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function generateIndexSearch({ posts }) {

  const index = posts.edges.map((edge = {}) => {

    // We need to decode the title because we're using the
    // rendered version which assumes this value will be used
    // within the DOM
    const post = edge.node
    const title = he.decode(post.title);

    return {
      title,
      slug: post.slug,
      date: post.date,
    };
  });

  return JSON.stringify({
    generated: Date.now(),
    posts: index,
  });
}

/**
 * mkdirp
 */

function mkdirp(directory) {
  const split = directory.split('/');
  let temp = '.';

  split.forEach((dir) => {
    temp = `${temp}/${dir}`;

    if (!fs.existsSync(temp)) {
      fs.mkdirSync(temp);
    }
  });
}

async function fetchAPI(query, { variables } = {}) {
  const api_url = 'https://etheadless.wpengine.com/graphql/'

  const https = require("https");
  const agent = new https.Agent({
    rejectUnauthorized: false
  })
  console.log('api_url', api_url)

  const res = await fetch(api_url, {
    method: 'POST',
    // @ts-ignore
    agent,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const json = await res.json()
  if (json.errors) {
    console.error(json.errors)
    throw new Error('WP QUERY FETCH' + json.errors)
  }
  return json.data
}

function lowercaseFirstChar (text) {
  return text && text[0].toLowerCase() + text.slice(1) || text;
};

module.exports = {
  createFile,
  lowercaseFirstChar,
  fetchAPI,
  generateIndexSearch
}
