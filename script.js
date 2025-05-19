console.log("Let build spotify clone")

let currentSong = new Audio();
let currentIndex;
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums(){
    console.log("Displaying Albums")
    let a = await fetch("assets/songs/")
    let response = await a.text()
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.querySelectorAll("a")
    let cardContainer = document.querySelector(".album-section")
    let array = Array.from(anchors)
    for(let index = 0; index < array.length; index++){
        const e = array[index]
        if(e.href.includes("/songs/")){
            let folder = e.href.split("songs/")[1].replaceAll("%20", " ")
            console.log(folder)
            // get metadata from info.json
            let a = await fetch(`assets/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="album-card">
                                        <img class="album-pic" src="assets/songs/${folder}/cover.jpg" alt="">
                                        <p class="song-name">${response.title}</p>
                                        <p class="no-of-songs">${response.noOfSongs} songs</p>
                                    </div>`
        }
    }

    //Event listener whenever an albumcard is clicked,  their respective songs populate in left sidebar
    let folders = Array.from(document.querySelectorAll(".album-card"))
    folders.forEach(e =>{
        e.addEventListener("click", async item =>{
            console.log("Fetching songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`assets/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.querySelectorAll("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1].split("/")[1].replace(".mp3", ""))
        }
    }
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img id="music-svg" src="assets/music.svg" alt="">
                            <div class="left-song-info">
                                <h4>${song.replaceAll("%20", " ")}</h4>
                            </div>
                            <div class="play-now">
                                <p>Play</p>
                                <img class="song-play" src="assets/play.svg" alt="">
                            </div>
                        </li>`;

    }

    // Modify the event listener that plays the song to also update currentIndex
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            currentIndex = index;
            console.log("playmusic - " + e.querySelector(".left-song-info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".left-song-info").firstElementChild.innerHTML);
        });
    });

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `assets/${currFolder}/${track}.mp3`
    if (!pause) {
        currentSong.play();
        play.src = "assets/pause.svg"
    }
    document.querySelector(".play-bar").firstElementChild.innerHTML = decodeURI(track) + ".mp3";
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
}

async function main() {
    
    displayAlbums()
    // Event listener to play pause from playbar
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assets/play.svg"
        }
    })

    //Event listener for previous
    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex].replaceAll("%20", " "))
        }
    })

    //Event listener fro next
    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex].replaceAll("%20", " "))
        }
    })

    //Eventlistener for left sidebar open and close
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left-sidebar").style.top = "75px"
    })

    document.querySelector(".cross-svg").addEventListener("click", () => {
        document.querySelector(".left-sidebar").style.top = "-200%"
    })

    // Event listener for seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".seek-circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //Event listener to update song time and seek bar movement
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".seek-circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Event Listener for volumer bar
    document.querySelector(".volume-bar").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100
    })
}

main()