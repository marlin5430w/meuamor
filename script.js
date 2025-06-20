document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const dateInputContainer = document.getElementById('dateInputContainer');
    const startDatePicker = document.getElementById('startDatePicker');
    const setStartDateButton = document.getElementById('setStartDateButton');
    const yearsMonthsDaysElement = document.getElementById('years-months-days');
    const hoursMinutesSecondsElement = document.getElementById('hours-minutes-seconds');
    const generateLinkButton = document.getElementById('generateLinkButton');
    const copyMessage = document.getElementById('copyMessage');

    const themeColorPicker = document.getElementById('themeColorPicker');

    const photosContainer = document.querySelector('.photos-container');
    const photoUploaders = [
        document.querySelector('.photos-container > .photo-uploader:nth-child(1)'),
        document.querySelector('.photos-container > .photo-uploader:nth-child(2)'),
        document.querySelector('.photos-container > .photo-uploader:nth-child(3)')
    ];

    const imageUploads = [
        document.getElementById('imageUpload1'),
        document.getElementById('imageUpload2'),
        document.getElementById('imageUpload3')
    ];
    const imagePreviews = [
        document.getElementById('imagePreview1'),
        document.getElementById('imagePreview2'),
        document.getElementById('imagePreview3')
    ];

    const removePhotoButtons = document.querySelectorAll('.remove-photo-button');

    const personalMessageInput = document.getElementById('personalMessageInput');
    const personalMessageDisplay = document.getElementById('personalMessageDisplay');

    const musicInputContainer = document.getElementById('musicInputContainer');
    const musicLinkInput = document.getElementById('musicLinkInput');
    const musicNameInput = document.getElementById('musicNameInput'); // NOVO: Input para o nome da música
    const loadMusicButton = document.getElementById('loadMusicButton');
    const musicStatus = document.getElementById('musicStatus');
    const changeMusicButton = document.getElementById('changeMusicButton');

    // NOVO: Elementos do player customizado
    const customAudioPlayer = document.getElementById('customAudioPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const displayMusicName = document.getElementById('displayMusicName');
    const youtubePlayer = document.getElementById('youtubePlayer'); // O iframe oculto do YouTube

    let startDate = null;
    let currentThemeColor = '#ff007f';
    let countdownInterval;
    let slideshowInterval;
    let currentImageIndex = 0;
    let activeImages = [];
    let currentMusicLink = '';
    let currentMusicName = ''; // NOVO: Variável para o nome da música
    let youtubePlayerReady = false;
    let isPlaying = false; // Estado do player customizado

    // Variável para o objeto Player da API do YouTube Iframe
    let player;

    // Função de callback da API do YouTube
    window.onYouTubeIframeAPIReady = () => {
        youtubePlayerReady = true;
        if (currentMusicLink) {
            initializeYouTubePlayer(getYouTubeVideoId(currentMusicLink));
        }
    };

    function initializeYouTubePlayer(videoId) {
        if (player) {
            player.destroy(); // Destrói o player existente para recriar
        }
        player = new YT.Player('youtubePlayer', {
            videoId: videoId,
            playerVars: {
                'autoplay': 0, // Inicia pausado no modo de edição/configuração
                'controls': 0, // Sem controles do YouTube
                'disablekb': 1, // Desabilita controles de teclado
                'fs': 0, // Sem fullscreen
                'loop': 1, // Loop
                'modestbranding': 1, // Logo menor
                'rel': 0, // Sem vídeos relacionados
                'showinfo': 0, // Sem informações do vídeo
                'iv_load_policy': 3, // Esconde anotações
                'playlist': videoId, // Essencial para o loop funcionar corretamente
                'enablejsapi': 1, // Habilita a API JavaScript
                'mute': 0 // Inicia com som (mas será bloqueado por autoplay em alguns casos)
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    }

    function onPlayerReady(event) {
        // console.log("YouTube Player Ready!");
        // Não auto-play aqui, pois depende da interação do usuário.
        // O autoplay será tentado em playLoadedMusic para o modo de visualização.
    }

    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            isPlaying = true;
            playPauseIcon.classList.remove('fa-play');
            playPauseIcon.classList.add('fa-pause');
        } else {
            isPlaying = false;
            playPauseIcon.classList.remove('fa-pause');
            playPauseIcon.classList.add('fa-play');
        }
    }

    function onPlayerError(event) {
        console.error("Erro no player do YouTube:", event.data);
        musicStatus.textContent = "Erro ao carregar música do YouTube. Link inválido ou restrito.";
        musicStatus.classList.add('show');
        setTimeout(() => musicStatus.classList.remove('show'), 5000);
        stopMusic(); // Para a reprodução e limpa o player
    }


    // --- Funções de Aplicação de Tema e Visibilidade ---
    function applyThemeColor(color) {
        root.style.setProperty('--main-color', color);
        const hexToRgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
        const rgb = hexToRgb(color);
        const darkerRgb = rgb.map(c => Math.max(0, c - 30));
        root.style.setProperty('--main-color-dark', `rgb(${darkerRgb.join(',')})`);
        root.style.setProperty('--main-color-shadow', `rgba(${rgb.join(',')}, 0.4)`);
        root.style.setProperty('--main-color-border-dash', `rgba(${rgb.join(',')}, 0.5)`);
        root.style.setProperty('--main-color-hover-bg', `rgba(${rgb.join(',')}, 0.1)`);
    }

    function hideEditingElements() {
        dateInputContainer.classList.add('hidden');
        musicInputContainer.classList.add('hidden');
        customAudioPlayer.classList.remove('hidden-when-editing'); // Remove classe de esconder na edição
        customAudioPlayer.classList.remove('hidden'); // Certifica que o player customizado está visível
        photosContainer.classList.add('slideshow-mode');

        if (generateLinkButton) generateLinkButton.classList.add('hidden');
        if (currentMusicLink) {
            changeMusicButton.classList.remove('hidden');
            displayMusicName.textContent = currentMusicName || "Música"; // Exibe o nome da música
        } else {
            changeMusicButton.classList.add('hidden');
            customAudioPlayer.classList.add('hidden'); // Esconde o player se não houver música
        }

        personalMessageInput.classList.add('hidden');
        personalMessageDisplay.classList.add('show');

        removePhotoButtons.forEach(button => button.classList.remove('show-button'));

        updateActiveImages();
        startSlideshow();
        playLoadedMusic(); // Tenta tocar a música se já estiver carregada
    }

    function showEditingElements() {
        changeMusicButton.classList.add('hidden');
        customAudioPlayer.classList.add('hidden-when-editing'); // Esconde o player customizado na edição
        customAudioPlayer.classList.add('hidden'); // Garante que o player esteja escondido

        dateInputContainer.classList.remove('hidden');
        musicInputContainer.classList.remove('hidden');
        photosContainer.classList.remove('slideshow-mode');

        if (generateLinkButton) generateLinkButton.classList.remove('hidden');

        personalMessageInput.classList.remove('hidden');
        personalMessageDisplay.classList.remove('show');

        clearInterval(slideshowInterval);

        imagePreviews.forEach((img, index) => {
            img.classList.remove('active');
            img.style.opacity = '';
            img.style.zIndex = '';
            if (!img.src.includes('via.placeholder.com')) {
                removePhotoButtons[index].classList.add('show-button');
            } else {
                removePhotoButtons[index].classList.remove('show-button');
            }
        });

        stopMusic(); // Para a música no modo de edição (se estava tocando)
    }

    // --- Lógica do Slideshow (mantida da versão anterior) ---
    function startSlideshow() {
        clearInterval(slideshowInterval);

        if (activeImages.length === 0) {
            imagePreviews.forEach((img, index) => {
                img.classList.remove('active');
                img.src = 'https://via.placeholder.com/150x150?text=Sem+Fotos';
                img.style.opacity = '1';
                img.style.zIndex = '1';
                photoUploaders[index].style.opacity = '1';
                photoUploaders[index].style.position = 'relative';
                photoUploaders[index].style.transform = 'none';
            });
            photosContainer.classList.add('slideshow-mode');
            return;
        } else {
            photoUploaders.forEach(uploader => {
                 uploader.style.position = 'absolute';
                 uploader.style.transform = 'translate(-50%, -50%)';
                 uploader.style.opacity = '0';
                 uploader.style.zIndex = '1';
            });
            photosContainer.classList.add('slideshow-mode');
        }

        imagePreviews.forEach(img => {
            img.classList.remove('active');
            img.style.opacity = '0';
            img.style.zIndex = '1';
        });

        currentImageIndex = 0;

        activeImages[currentImageIndex].classList.add('active');
        activeImages[currentImageIndex].style.opacity = '1';
        activeImages[currentImageIndex].style.zIndex = '2';
        photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '1';
        photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '2';

        slideshowInterval = setInterval(() => {
            activeImages[currentImageIndex].classList.remove('active');
            activeImages[currentImageIndex].style.opacity = '0';
            activeImages[currentImageIndex].style.zIndex = '1';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '0';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '1';

            currentImageIndex = (currentImageIndex + 1) % activeImages.length;

            activeImages[currentImageIndex].classList.add('active');
            activeImages[currentImageIndex].style.opacity = '1';
            activeImages[currentImageIndex].style.zIndex = '2';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '1';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '2';

        }, 1000);
    }

    function updateActiveImages() {
        activeImages = imagePreviews.filter(img => !img.src.includes('via.placeholder.com'));

        if (!photosContainer.classList.contains('slideshow-mode')) {
            imagePreviews.forEach((img, index) => {
                if (!img.src.includes('via.placeholder.com')) {
                    removePhotoButtons[index].classList.add('show-button');
                } else {
                    removePhotoButtons[index].classList.remove('show-button');
                }
            });
        }

        if (dateInputContainer.classList.contains('hidden')) {
            startSlideshow();
        }
    }

    // --- Lógica da Música ---
    function getYouTubeVideoId(url) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
        const match = url.match(youtubeRegex);
        return match ? match[1] : null;
    }

    function loadMusic(link, name) {
        stopMusic(); // Para qualquer música tocando

        if (!link) {
            musicStatus.textContent = "Nenhuma música carregada.";
            musicStatus.classList.add('show');
            currentMusicLink = '';
            currentMusicName = '';
            localStorage.removeItem('musicLink');
            localStorage.removeItem('musicName');
            return;
        }

        const youtubeId = getYouTubeVideoId(link);
        if (!youtubeId) {
            musicStatus.textContent = "Por favor, insira um link válido do YouTube.";
            musicStatus.classList.add('show');
            setTimeout(() => musicStatus.classList.remove('show'), 3000);
            return;
        }

        currentMusicLink = link;
        currentMusicName = name;
        localStorage.setItem('musicLink', link);
        localStorage.setItem('musicName', name);

        displayMusicName.textContent = name || "Música do YouTube"; // Atualiza o nome no player customizado

        if (youtubePlayerReady) {
            initializeYouTubePlayer(youtubeId);
            musicStatus.textContent = "Música do YouTube carregada!";
            musicStatus.classList.add('show');
            setTimeout(() => musicStatus.classList.remove('show'), 3000);
        } else {
            musicStatus.textContent = "Carregando API do YouTube...";
            musicStatus.classList.add('show');
        }
    }

    function stopMusic() {
        if (player && typeof player.stopVideo === 'function') {
            player.stopVideo();
        }
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
        isPlaying = false;
        youtubePlayer.src = ''; // Limpa o src do iframe para parar o vídeo
    }

    function playLoadedMusic() {
        if (!currentMusicLink) {
            stopMusic();
            customAudioPlayer.classList.add('hidden'); // Esconde o player se não houver música
            return;
        }

        customAudioPlayer.classList.remove('hidden'); // Mostra o player se houver música

        if (player && typeof player.playVideo === 'function') {
            // Tenta tocar o vídeo. O navegador pode bloquear o autoplay.
            player.playVideo().catch(error => {
                console.warn("Autoplay do YouTube bloqueado:", error);
                // Pode exibir uma mensagem para o usuário clicar no botão de play
                musicStatus.textContent = "Clique no botão play para iniciar a música.";
                musicStatus.classList.add('show');
            });
        } else if (youtubePlayerReady) {
            // Se o player ainda não foi inicializado, inicializa e ele tentará tocar
            initializeYouTubePlayer(getYouTubeVideoId(currentMusicLink));
            // A reprodução ocorrerá no onPlayerReady ou quando o player for carregado.
        }
    }

    // --- Lógica de Carregamento (Prioridade: URL Hash > localStorage) ---
    const hashParams = window.location.hash.substring(1);

    if (hashParams) {
        // Modo de visualização (link gerado)
        try {
            const decodedParams = decodeURIComponent(hashParams);
            const data = JSON.parse(decodedParams);

            if (data.startDate) {
                startDate = new Date(data.startDate);
                if (isValidDate(startDate)) {
                    startCountdown();
                } else {
                    startDate = null;
                }
            } else {
                startDate = null;
            }

            let imagesToLoadCount = 0;
            if (data.images && Array.isArray(data.images)) {
                 imagesToLoadCount = data.images.filter(imgData => imgData && typeof imgData === 'string' && imgData.startsWith('data:image')).length;
            }

            if (imagesToLoadCount > 0) {
                let loadedCount = 0;
                data.images.forEach((imgData, index) => {
                    if (imagePreviews[index]) {
                        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
                            imagePreviews[index].onload = () => {
                                loadedCount++;
                                if (loadedCount === imagesToLoadCount) {
                                    updateActiveImages();
                                }
                            };
                            imagePreviews[index].src = imgData;
                        } else {
                            imagePreviews[index].src = 'https://via.placeholder.com/150x150?text=Foto+' + (index + 1);
                        }
                    }
                });
            } else {
                imagePreviews.forEach((img, index) => {
                    img.src = 'https://via.placeholder.com/150x150?text=Sem+Fotos';
                });
                updateActiveImages();
            }

            if (data.themeColor && typeof data.themeColor === 'string' && data.themeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                currentThemeColor = data.themeColor;
                themeColorPicker.value = currentThemeColor;
                applyThemeColor(currentThemeColor);
            }

            if (data.personalMessage && typeof data.personalMessage === 'string') {
                personalMessageDisplay.textContent = data.personalMessage;
            } else {
                personalMessageDisplay.textContent = "";
            }

            if (data.musicLink && typeof data.musicLink === 'string') {
                currentMusicLink = data.musicLink;
            } else {
                currentMusicLink = '';
            }
            if (data.musicName && typeof data.musicName === 'string') { // NOVO: Carrega nome da música
                currentMusicName = data.musicName;
            } else {
                currentMusicName = '';
            }

            hideEditingElements(); // Esconde tudo de edição e inicia slideshow/música

        } catch (e) {
            console.error("Erro ao decodificar ou analisar o link:", e);
            alert("O link de personalização está inválido. Por favor, crie um novo.");
            window.location.hash = '';
            location.reload();
        }
    } else {
        // Modo de edição (sem hash na URL)
        const storedStartDate = localStorage.getItem('countdownStartDate');
        if (storedStartDate) {
            startDate = new Date(storedStartDate);
            startDatePicker.value = storedStartDate.substring(0, 16);
            if (isValidDate(startDate)) {
                startCountdown();
            } else {
                startDate = null;
                updateDisplayForNoDate();
            }
        } else {
            updateDisplayForNoDate();
        }

        imagePreviews.forEach((imgElement, index) => {
            const storedImage = localStorage.getItem(`uploadedImage${index + 1}`);
            if (storedImage) {
                imgElement.src = storedImage;
            } else {
                imgElement.src = 'https://via.placeholder.com/120x120?text=Foto ' + (index + 1);
            }
        });
        setTimeout(updateActiveImages, 100);

        const storedThemeColor = localStorage.getItem('themeColor');
        if (storedThemeColor && storedThemeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
            currentThemeColor = storedThemeColor;
            themeColorPicker.value = storedThemeColor;
        }
        applyThemeColor(currentThemeColor);

        const storedPersonalMessage = localStorage.getItem('personalMessage');
        if (storedPersonalMessage) {
            personalMessageInput.value = storedPersonalMessage;
        }

        const storedMusicLink = localStorage.getItem('musicLink');
        const storedMusicName = localStorage.getItem('musicName'); // NOVO: Carrega nome da música
        if (storedMusicLink) {
            musicLinkInput.value = storedMusicLink;
            musicNameInput.value = storedMusicName || ''; // Preenche o input do nome
            currentMusicLink = storedMusicLink;
            currentMusicName = storedMusicName || '';
            loadMusic(storedMusicLink, storedMusicName); // Carrega a música no player de edição
        }

        showEditingElements();

        // Carrega a API do YouTube Player
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }


    // --- Listeners de Eventos ---
    setStartDateButton.addEventListener('click', () => {
        const inputDateValue = startDatePicker.value;
        if (inputDateValue) {
            startDate = new Date(inputDateValue);
            if (isValidDate(startDate)) {
                localStorage.setItem('countdownStartDate', startDate.toISOString());
                startCountdown();
            } else {
                alert("Por favor, insira uma data e hora válidas.");
                updateDisplayForNoDate();
            }
        } else {
            alert("Por favor, selecione uma data e hora.");
            updateDisplayForNoDate();
        }
    });

    themeColorPicker.addEventListener('input', (event) => {
        currentThemeColor = event.target.value;
        applyThemeColor(currentThemeColor);
        localStorage.setItem('themeColor', currentThemeColor);
    });

    personalMessageInput.addEventListener('input', (event) => {
        localStorage.setItem('personalMessage', event.target.value);
    });

    imageUploads.forEach((inputElement, index) => {
        inputElement.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDataUrl = e.target.result;
                    imagePreviews[index].src = imageDataUrl;
                    localStorage.setItem(`uploadedImage${index + 1}`, imageDataUrl);
                    updateActiveImages();
                };
                reader.readAsDataURL(file);
            }
        });
    });

    removePhotoButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const index = parseInt(event.target.dataset.index);
            const defaultPlaceholderSrc = `https://via.placeholder.com/120x120?text=Foto+${index + 1}`;

            imagePreviews[index].src = defaultPlaceholderSrc;
            localStorage.removeItem(`uploadedImage${index + 1}`);
            event.target.classList.remove('show-button');

            updateActiveImages();
        });
    });

    loadMusicButton.addEventListener('click', () => {
        const link = musicLinkInput.value.trim();
        const name = musicNameInput.value.trim(); // Pega o nome da música
        if (link) {
            loadMusic(link, name);
        } else {
            musicStatus.textContent = "Por favor, insira um link de música.";
            musicStatus.classList.add('show');
            stopMusic();
        }
    });

    changeMusicButton.addEventListener('click', () => {
        stopMusic();
        showEditingElements();
        window.location.hash = '';
    });

    // NOVO: Listener para o botão de play/pause do player customizado
    playPauseButton.addEventListener('click', () => {
        if (!player) return; // Se o player não está pronto, não faz nada

        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo().catch(error => {
                console.warn("Play manual do YouTube bloqueado (possível restrição):", error);
                musicStatus.textContent = "Não foi possível iniciar a música. Tente novamente.";
                musicStatus.classList.add('show');
            });
        }
    });

    // --- Gerar Link (Inclui a música e o nome) ---
    generateLinkButton.addEventListener('click', async () => {
        if (!startDate || !isValidDate(startDate)) {
            alert("Por favor, defina a data inicial antes de gerar o link.");
            return;
        }

        const config = {
            startDate: startDate.toISOString(),
            images: imagePreviews.map(img => img.src.includes('via.placeholder.com') ? null : img.src),
            themeColor: currentThemeColor,
            personalMessage: personalMessageInput.value,
            musicLink: currentMusicLink,
            musicName: currentMusicName // NOVO: Adiciona o nome da música à configuração
        };

        const configString = JSON.stringify(config);
        const encodedConfig = encodeURIComponent(configString);
        const link = window.location.origin + window.location.pathname + '#' + encodedConfig;

        try {
            await navigator.clipboard.writeText(link);
            copyMessage.textContent = "Link copiado!";
            copyMessage.classList.add('show');
            setTimeout(() => {
                copyMessage.classList.remove('show');
                copyMessage.textContent = "";
            }, 3000);
        } catch (err) {
            console.error('Falha ao copiar o link: ', err);
            copyMessage.textContent = "Erro ao copiar. Copie manualmente: " + link;
            copyMessage.classList.add('show');
        }
    });


    // --- Funções do Contador (mantidas da versão anterior) ---
    function startCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        updateCounter();
        countdownInterval = setInterval(updateCounter, 1000);
    }

    function updateDisplayForNoDate() {
        yearsMonthsDaysElement.textContent = "Selecione a data inicial acima";
        hoursMinutesSecondsElement.textContent = "";
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    }

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    function updateCounter() {
        if (!startDate || !isValidDate(startDate)) {
            updateDisplayForNoDate();
            return;
        }

        const now = new Date();
        let diff = now.getTime() - startDate.getTime();

        if (diff < 0) {
            yearsMonthsDaysElement.textContent = "Aguardando o início...";
            let futureDiff = startDate.getTime() - now.getTime();
            let futureSeconds = Math.floor(futureDiff / 1000);
            let futureMinutes = Math.floor(futureSeconds / 60);
            let futureHours = Math.floor(futureMinutes / 60);
            let futureDays = Math.floor(futureHours / 24);

            futureSeconds %= 60;
            futureMinutes %= 60;
            futureHours %= 24;

            hoursMinutesSecondsElement.textContent =
                `Faltam: ${futureDays} dias, ${futureHours} horas, ${futureMinutes} minutos e ${futureSeconds} segundos`;
            return;
        }

        let seconds = Math.floor(diff / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        let years = 0;
        let months = 0;
        let tempDate = new Date(startDate);

        while (tempDate < now) {
            const nextMonth = new Date(tempDate);
            nextMonth.setMonth(tempDate.getMonth() + 1);

            if (nextMonth.getDate() !== tempDate.getDate()) {
                const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
                if (tempDate.getDate() > lastDayOfNextMonth) {
                    nextMonth.setDate(lastDayOfNextMonth);
                }
            }

            if (nextMonth <= now) {
                months++;
                tempDate = nextMonth;
            } else {
                break;
            }
        }

        years = Math.floor(months / 12);
        months %= 12;

        const adjustedStartDateForDays = new Date(startDate);
        adjustedStartDateForDays.setFullYear(startDate.getFullYear() + years);
        adjustedStartDateForDays.setMonth(startDate.getMonth() + months);

        let totalDaysFromAdjusted = Math.floor((now.getTime() - adjustedStartDateForDays.getTime()) / (1000 * 60 * 60 * 24));
        if (totalDaysFromAdjusted < 0) totalDaysFromAdjusted = 0;

        yearsMonthsDaysElement.textContent =
            `${years} ano${years !== 1 ? 's' : ''}, ` +
            `${months} mês${months !== 1 ? 'es' : ''}, ` +
            `${totalDaysFromAdjusted} dia${totalDaysFromAdjusted !== 1 ? 's' : ''}`;

        hoursMinutesSecondsElement.textContent =
            `${hours} hora${hours !== 1 ? 's' : ''}, ` +
            `${minutes} minuto${minutes !== 1 ? 's' : ''} e ` +
            `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
});
