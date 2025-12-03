let isMuted = true;

async function fetchVideos(search) {
    const res = await fetch("yt.php?q=" + encodeURIComponent(search));
    const data = await res.json();
    return data.items || [];
}

function renderStrip(videos, containerId) {
    const strip = document.getElementById(containerId);
    strip.innerHTML = "";

    videos.forEach(v => {
        const card = document.createElement("div");
        card.className = "video-card";
        const videoId = v.id.videoId;

        card.innerHTML = `
            <div class="video-wrapper">
                <div class="card-controls">
                    <button class="control-btn fs-btn" title="Full Screen">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    <button class="control-btn sound-btn" title="Mute/Unmute">
                        <i class="fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}"></i>
                    </button>
                </div>
                <img src="${v.snippet.thumbnails.medium.url}" class="thumb">
            </div>
            <h4>${v.snippet.title}</h4>
            <button class="like-btn">Like</button>
        `;

        const wrapper = card.querySelector(".video-wrapper");

        const fsBtn = card.querySelector(".fs-btn");
        const fsIcon = fsBtn.querySelector("i");

        fsBtn.onclick = (e) => {
            e.stopPropagation();
            if (!document.fullscreenElement) {
                wrapper.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
                fsIcon.classList.replace('fa-expand', 'fa-compress');
            } else {
                document.exitFullscreen();
                fsIcon.classList.replace('fa-compress', 'fa-expand');
            }
        };

        document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement) {
                const currentFsIcon = wrapper.querySelector(".fs-btn i");
                if (currentFsIcon) {
                    currentFsIcon.classList.replace('fa-compress', 'fa-expand');
                }
            }
        });

        const soundBtn = card.querySelector(".sound-btn");

        soundBtn.onclick = (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            document.querySelectorAll(".sound-btn i").forEach(icon => {
                icon.className = `fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`;
            });

            const currentIframe = wrapper.querySelector("iframe");
            if (currentIframe) {
                const newSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0`;
                currentIframe.src = newSrc;
            }
        };

        wrapper.onclick = (e) => {
            if (e.target.closest('.card-controls') || e.target.closest('.like-btn')) return;
            openPlayer(videoId);
        };

        let hoverTimeout;

        wrapper.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                if (!wrapper.querySelector("iframe")) {
                    const iframe = document.createElement("iframe");
                    iframe.className = "preview-frame";
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0`;
                    iframe.allow = "autoplay; encrypted-media; fullscreen";
                    wrapper.appendChild(iframe);
                }
            }, 400);
        });

        wrapper.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            if (!document.fullscreenElement) {
                const iframe = wrapper.querySelector("iframe");
                if (iframe) {
                    iframe.remove();
                }
            }
        });

        let likeBtn = card.querySelector(".like-btn");
        likeBtn.onclick = (e) => {
            e.stopPropagation();
            likeBtn.classList.toggle("liked");
            likeBtn.textContent = likeBtn.classList.contains("liked") ? "Unlike" : "Like";
        };

        strip.appendChild(card);
    });
}

function openPlayer(id) {
    document.getElementById("playerPopup").style.display = "flex";
    document.getElementById("ytPlayer").src =
        `https://www.youtube.com/embed/${id}?autoplay=1`;
}

document.getElementById("closePlayer").onclick = () => {
    document.getElementById("playerPopup").style.display = "none";
    document.getElementById("ytPlayer").src = "";
};

async function loadStrips() {
    const topics = ["music", "gaming", "football", "coding", "morocco"];
    for (let i = 0; i < topics.length; i++) {
        let videos = await fetchVideos(topics[i]);
        renderStrip(videos, "strip" + (i + 1));
    }
}

document.addEventListener("DOMContentLoaded", loadStrips);