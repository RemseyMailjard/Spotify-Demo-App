const clientID = "188a1a3b8b224e2e89454dfcfa9d7ac3";
const clientSecret = "7b74426e78a94542a78228b3360d9f60";

async function getAuthorizationToken() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  // Using URLSearchParams
  const urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");
  urlencoded.append("client_id", clientID);
  urlencoded.append("client_secret", clientSecret);

  // Alternatively, using a manual string
  // const urlencoded = `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://accounts.spotify.com/api/token",
      requestOptions
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    const result = await response.json();
    localStorage.setItem("bearerToken", result.access_token);
    return result.access_token;
  } catch (error) {
    console.error("Failed to fetch the authorization token:", error);
  }
}

async function fetchGenres() {
  let bearerToken = localStorage.getItem("bearerToken");
  if (!bearerToken) {
    bearerToken = await getAuthorizationToken();
    if (!bearerToken) {
      console.error("Failed to obtain bearer token");
      return;
    }
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/recommendations/available-genre-seeds",
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    populateDropdown(data.genres);
  } catch (error) {
    console.error("Error fetching genre seeds:", error);
  }
}

function populateDropdown(genres) {
  const dropdown = document.getElementById("genresDropdown");
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.text = genre;
    dropdown.appendChild(option);
  });
}

async function main() {
  await fetchGenres();
}
async function searchArtist(artistName) {
  let bearerToken = localStorage.getItem("bearerToken");
  if (!bearerToken) {
    bearerToken = await getAuthorizationToken();
    if (!bearerToken) {
      console.error("Failed to obtain bearer token");
      return;
    }
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        artistName
      )}&type=artist`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    displayArtistInfo(data.artists.items[0]);
  } catch (error) {
    console.error("Error searching for artist:", error);
  }
}

function displayArtistInfo(artist) {
  const artistInfoDiv = document.getElementById("artistInfo");
  artistInfoDiv.innerHTML = `
        <h3>${artist.name}</h3>
        <p>Genres: ${artist.genres.join(", ")}</p>
        <P>Popularity: ${artist.popularity}</p>
        <p>Followers: ${artist.followers.total}</p>
        <img src="${artist.images[0] ? artist.images[0].url : ""}" alt="${
    artist.name
  }" height="640" width="640">
        <p><a href="${
          artist.external_urls.spotify
        }" target="_blank">Open in Spotify</a></p>
    `;
}

document.getElementById("searchButton").addEventListener("click", () => {
  const artistName = document.getElementById("artistSearch").value;
  if (artistName) {
    searchArtist(artistName);
  } else {
    alert("Please enter an artist name");
  }
});

async function main() {
  await fetchGenres();
}

window.onload = main;
