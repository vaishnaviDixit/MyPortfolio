fs = require("fs");
const https = require("https");
process = require("process");
require("dotenv").config();

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const USE_GITHUB_DATA = process.env.USE_GITHUB_DATA;
const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME;

const ERR = {
  noUserName:
    "Github Username was found to be undefined. Please set all relevant environment variables.",
  requestFailed:
    "The request to GitHub didn't succeed. Check if GitHub token in your .env file is correct.",
  requestFailedMedium:
    "The request to Medium didn't succeed. Check if Medium username in your .env file is correct."
};

if (USE_GITHUB_DATA === "true") {
  if (GITHUB_USERNAME === undefined) {
    throw new Error(ERR.noUserName);
  }

  console.log(`Fetching profile data for ${GITHUB_USERNAME}`);
  var data = JSON.stringify({
    query: `
{
  user(login:"${GITHUB_USERNAME}") { 
    name
    bio
    avatarUrl
    location
    pinnedItems(first: 6, types: [REPOSITORY]) {
      totalCount
      edges {
        node {
          ... on Repository {
            name
            description
            forkCount
            stargazers {
              totalCount
            }
            url
            id
            diskUsage
            primaryLanguage {
              name
              color
            }
          }
        }
      }
    }
  }
}`
  });

  const default_options = {
    hostname: "api.github.com",
    path: "/graphql",
    port: 443,
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "Node"
    }
  };

  const req = https.request(default_options, res => {
    let responseData = "";

    console.log(`statusCode: ${res.statusCode}`);
    
    // Check if the status is 200 (OK) or not
    if (res.statusCode !== 200) {
      res.on("data", d => {
        responseData += d;
      });

      res.on("end", () => {
        console.error("Error fetching GitHub data:", responseData);
        throw new Error(ERR.requestFailed);
      });
    }

    res.on("data", d => {
      responseData += d;
    });

    res.on("end", () => {
      try {
        const parsedData = JSON.parse(responseData); // Ensure the data is parsed
        fs.writeFile("./public/profile.json", JSON.stringify(parsedData, null, 2), function (err) {
          if (err) return console.log(err);
          console.log("saved file to public/profile.json");
        });
      } catch (error) {
        console.error("Error parsing GitHub response:", error);
      }
    });
  });

  req.on("error", error => {
    throw error;
  });

  req.write(data);
  req.end();
}

if (MEDIUM_USERNAME !== undefined) {
  console.log(`Fetching Medium blogs data for ${MEDIUM_USERNAME}`);
  const options = {
    hostname: "api.rss2json.com",
    path: `/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USERNAME}`,
    port: 443,
    method: "GET"
  };

  const req = https.request(options, res => {
    let mediumData = "";

    console.log(`statusCode: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      res.on("data", d => {
        mediumData += d;
      });

      res.on("end", () => {
        console.error("Error fetching Medium data:", mediumData);
        throw new Error(ERR.requestFailedMedium);
      });
    }

    res.on("data", d => {
      mediumData += d;
    });

    res.on("end", () => {
      try {
        const parsedMediumData = JSON.parse(mediumData); // Ensure the data is parsed
        fs.writeFile("./public/blogs.json", JSON.stringify(parsedMediumData, null, 2), function (err) {
          if (err) return console.log(err);
          console.log("saved file to public/blogs.json");
        });
      } catch (error) {
        console.error("Error parsing Medium response:", error);
      }
    });
  });

  req.on("error", error => {
    throw error;
  });

  req.end();
}
