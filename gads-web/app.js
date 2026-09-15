/* =========================================
   GADS PRO WEB
   YouTube API
========================================= */


/* =========================================
   API KEY
========================================= */

/*
   PEGA AQUÍ TU NUEVA API KEY DE YOUTUBE.

   Ejemplo:

   const API_KEY = "AIzaSyXXXXXXXXXXXX";
*/

const API_KEY = "PEGA_AQUI_TU_API_KEY";


const API_URL =
    "https://www.googleapis.com/youtube/v3";


/* =========================================
   VARIABLES
========================================= */

let nextPageToken = "";

let currentMode = "popular";

let currentQuery = "";


/* =========================================
   ELEMENTOS HTML
========================================= */

const videosContainer =
    document.getElementById("videos");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const loadMoreButton =
    document.getElementById("loadMore");

const status =
    document.getElementById("status");

const sectionTitle =
    document.getElementById("sectionTitle");

const player =
    document.getElementById("player");

const videoFrame =
    document.getElementById("videoFrame");

const videoTitle =
    document.getElementById("videoTitle");

const videoChannel =
    document.getElementById("videoChannel");

const closePlayer =
    document.getElementById("closePlayer");


/* =========================================
   CONEXIÓN CON YOUTUBE
========================================= */

async function youtubeRequest(endpoint) {

    const response = await fetch(
        `${API_URL}/${endpoint}&key=${API_KEY}`
    );

    const data = await response.json();


    if (!response.ok || data.error) {

        throw new Error(
            data?.error?.message ||
            "Error al conectar con YouTube"
        );

    }


    return data;
}


/* =========================================
   VIDEOS POPULARES
========================================= */

async function loadPopular() {

    status.textContent =
        "Cargando videos...";


    const endpoint =
        `videos?part=snippet,contentDetails,statistics` +
        `&chart=mostPopular` +
        `&regionCode=US` +
        `&maxResults=24` +
        `&pageToken=${nextPageToken}`;


    const data =
        await youtubeRequest(endpoint);


    renderVideos(
        data.items || []
    );


    nextPageToken =
        data.nextPageToken || "";


    status.textContent =
        `${data.items?.length || 0} videos`;

}


/* =========================================
   CATEGORÍAS
========================================= */

const categories = {

    gaming: "20",

    music: "10",

    news: "25",

    technology: "28"

};


async function loadCategory(category) {

    const categoryId =
        categories[category];


    if (!categoryId) {

        await loadPopular();

        return;

    }


    status.textContent =
        "Cargando categoría...";


    const endpoint =
        `videos?part=snippet,contentDetails,statistics` +
        `&chart=mostPopular` +
        `&videoCategoryId=${categoryId}` +
        `&regionCode=US` +
        `&maxResults=24` +
        `&pageToken=${nextPageToken}`;


    const data =
        await youtubeRequest(endpoint);


    renderVideos(
        data.items || []
    );


    nextPageToken =
        data.nextPageToken || "";


    status.textContent =
        `${data.items?.length || 0} videos`;

}


/* =========================================
   BUSCAR VIDEOS
========================================= */

async function searchVideos() {

    const query =
        searchInput.value.trim();


    if (!query) {

        return;

    }


    currentMode =
        "search";


    currentQuery =
        query;


    nextPageToken =
        "";


    videosContainer.innerHTML =
        "";


    sectionTitle.textContent =
        `Resultados para "${query}"`;


    status.textContent =
        "Buscando videos...";


    try {

        await executeSearch();

    } catch (error) {

        showError(error);

    }

}


/* =========================================
   EJECUTAR BÚSQUEDA
========================================= */

async function executeSearch() {

    const endpoint =
        `search?part=snippet` +
        `&type=video` +
        `&maxResults=24` +
        `&q=${encodeURIComponent(currentQuery)}` +
        `&pageToken=${nextPageToken}`;


    const data =
        await youtubeRequest(endpoint);


    const videos =
        (data.items || [])
            .filter(item =>
                item.id &&
                item.id.videoId
            )
            .map(item => ({

                id:
                    item.id.videoId,

                snippet:
                    item.snippet

            }));


    renderVideos(videos);


    nextPageToken =
        data.nextPageToken || "";


    status.textContent =
        `${videos.length} resultados`;

}


/* =========================================
   MOSTRAR VIDEOS
========================================= */

function renderVideos(videos) {

    if (!videos.length) {

        status.textContent =
            "No se encontraron videos.";

        return;

    }


    videos.forEach(video => {

        const id =
            video.id?.videoId ||
            video.id;


        if (!id) {

            return;

        }


        const snippet =
            video.snippet;


        const thumbnail =
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url;


        const card =
            document.createElement("article");


        card.className =
            "card";


        card.tabIndex =
            0;


        card.innerHTML = `

            <div class="thumbnail">

                <img
                    src="${thumbnail}"
                    alt="${escapeHTML(snippet.title)}"
                    loading="lazy"
                >

                <div class="play">
                    ▶
                </div>

            </div>


            <div class="card-info">

                <div class="card-title">
                    ${escapeHTML(snippet.title)}
                </div>


                <div class="channel">
                    ${escapeHTML(
                        snippet.channelTitle || ""
                    )}
                </div>

            </div>

        `;


        /* CLICK */

        card.addEventListener(
            "click",
            () => {

                openPlayer(
                    id,
                    snippet.title,
                    snippet.channelTitle
                );

            }
        );


        /* TECLADO / TV */

        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();


                    openPlayer(
                        id,
                        snippet.title,
                        snippet.channelTitle
                    );

                }

            }
        );


        videosContainer.appendChild(
            card
        );

    });

}


/* =========================================
   ABRIR REPRODUCTOR
========================================= */

function openPlayer(
    videoId,
    title,
    channel
) {

    player.classList.remove(
        "hidden"
    );


    videoFrame.src =
        `https://www.youtube.com/embed/${videoId}` +
        `?autoplay=1&rel=0`;


    videoTitle.textContent =
        title;


    videoChannel.textContent =
        channel || "";


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   CERRAR REPRODUCTOR
========================================= */

function closeVideo() {

    player.classList.add(
        "hidden"
    );


    videoFrame.src =
        "";


    document.body.style.overflow =
        "";

}


closePlayer.addEventListener(
    "click",
    closeVideo
);


/* =========================================
   BOTÓN BUSCAR
========================================= */

searchButton.addEventListener(
    "click",
    searchVideos
);


/* =========================================
   ENTER EN BUSCADOR
========================================= */

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchVideos();

        }

    }
);


/* =========================================
   CATEGORÍAS
========================================= */

document
    .querySelectorAll(
        ".categories button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const category =
                    button.dataset.category;


                currentMode =
                    category;


                currentQuery =
                    "";


                nextPageToken =
                    "";


                videosContainer.innerHTML =
                    "";


                sectionTitle.textContent =
                    button.textContent.trim();


                try {

                    if (
                        category ===
                        "popular"
                    ) {

                        await loadPopular();

                    } else {

                        await loadCategory(
                            category
                        );

                    }

                } catch (error) {

                    showError(error);

                }

            }
        );

    });


/* =========================================
   CARGAR MÁS
========================================= */

loadMoreButton.addEventListener(
    "click",
    async () => {

        if (!nextPageToken) {

            return;

        }


        try {

            status.textContent =
                "Cargando más videos...";


            if (
                currentMode ===
                "search"
            ) {

                await executeSearch();

            }

            else if (
                currentMode ===
                "popular"
            ) {

                await loadPopular();

            }

            else {

                await loadCategory(
                    currentMode
                );

            }

        }

        catch (error) {

            showError(error);

        }

    }
);


/* =========================================
   MOSTRAR ERRORES
========================================= */

function showError(error) {

    console.error(error);


    status.textContent =
        "Error";


    videosContainer.innerHTML = `

        <div style="
            grid-column: 1 / -1;
            padding: 30px;
            text-align: center;
            background: #101722;
            border: 1px solid #26384d;
            border-radius: 15px;
        ">

            <h3>
                ⚠️ GADS PRO WEB
            </h3>


            <p style="
                color: #9eafc2;
                margin-top: 10px;
            ">
                ${escapeHTML(
                    error.message
                )}
            </p>

        </div>

    `;

}


/* =========================================
   PROTECCIÓN DE TEXTO HTML
========================================= */

function escapeHTML(text) {

    return String(text || "")
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character])
        );

}


/* =========================================
   INICIAR GADS PRO WEB
========================================= */

(async function init() {


    if (
        !API_KEY ||
        API_KEY ===
        "PEGA_AQUI_TU_API_KEY"
    ) {

        showError(
            new Error(
                "Falta colocar la API Key de YouTube en app.js."
            )
        );


        return;

    }


    try {

        await loadPopular();

    }

    catch (error) {

        showError(error);

    }

})();
