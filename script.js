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
    const colorPickerContainer = document.querySelector('.color-picker-container');

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
    const messageSlot = document.getElementById('messageSlot');

    // ELEMENTOS PARA MÚSICA
    const musicInputContainer = document.querySelector('.music-input-container');
    const youtubeLinkInput = document.getElementById('youtubeLinkInput');
    const musicNameInput = document.getElementById('musicNameInput');
    const loadMusicButton = document.getElementById('loadMusicButton');
    const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
    const currentMusicNameElement = document.getElementById('currentMusicName');
    const musicLoadedMessage = document.getElementById('musicLoadedMessage');

    // NOVOS ELEMENTOS PARA EMOJIS
    const emojiInputContainer = document.querySelector('.emoji-input-container');
    const emojiInput1 = document.getElementById('emojiInput1');
    const emojiInput2 = document.getElementById('emojiInput2');
    const emojiInput3 = document.getElementById('emojiInput3');
    const emojiRainContainer = document.getElementById('emojiRainContainer');

    let startDate = null;
    let currentThemeColor = '#ff007f';
    let countdownInterval;
    let slideshowInterval;
    let currentImageIndex = 0;
    let activeImages = [];

    // Variáveis da Música
    let player;
    let currentYoutubeVideoId = null;
    let currentMusicTitle = "";

    // Variáveis dos Emojis
    let selectedEmojis = [];
    let emojiRainInterval;

    // A função que a API do YouTube chama quando está pronta
    window.onYouTubeIframeAPIReady = function() {
        console.log("YouTube IFrame API is ready.");
        loadMusicFromStorageOrURL();
    };

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
        startDatePicker.classList.add('hidden');
        setStartDateButton.classList.add('hidden');
        colorPickerContainer.classList.add('hidden');
        musicInputContainer.classList.add('hidden');
        emojiInputContainer.classList.add('hidden'); // Esconde inputs de emoji

        photosContainer.classList.add('slideshow-mode');

        if (generateLinkButton) generateLinkButton.classList.add('hidden');

        personalMessageInput.classList.add('hidden');
        personalMessageDisplay.classList.add('show');

        removePhotoButtons.forEach(button => button.classList.remove('show-button'));

        // Lógica de Música (Mantida)
        if (currentYoutubeVideoId) {
            musicPlayerDisplay.classList.add('show');
            currentMusicNameElement.textContent = currentMusicTitle || "Música em Reprodução";
            if (player) {
                player.playVideo();
            } else {
                createYoutubePlayer(currentYoutubeVideoId, true);
            }
        } else {
            musicPlayerDisplay.classList.remove('show');
            if (player) player.stopVideo();
        }

        updateActiveImages();
        startSlideshow();

        // Lógica de Emojis (Ativar chuva de emojis)
        if (selectedEmojis.length > 0) {
            emojiRainContainer.style.display = 'block'; // Mostra o contêiner
            startEmojiRain();
        }
    }

    function showEditingElements() {
        dateInputContainer.classList.remove('hidden');
        startDatePicker.classList.remove('hidden');
        setStartDateButton.classList.remove('hidden');
        colorPickerContainer.classList.remove('hidden');
        musicInputContainer.classList.remove('hidden');
        emojiInputContainer.classList.remove('hidden'); // Mostra inputs de emoji

        photosContainer.classList.remove('slideshow-mode');

        if (generateLinkButton) generateLinkButton.classList.remove('hidden');

        personalMessageInput.classList.remove('hidden');
        personalMessageDisplay.classList.remove('show');

        // Lógica de Música (Pausar/Esconder)
        musicPlayerDisplay.classList.remove('show');
        if (player) {
            player.stopVideo();
        }

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

        photoUploaders.forEach(uploader => {
            uploader.style.opacity = '1';
            uploader.style.position = 'relative';
            uploader.style.transform = 'none';
            uploader.style.zIndex = 'auto';
        });

        // Lógica de Emojis (Parar chuva de emojis)
        emojiRainContainer.style.display = 'none'; // Esconde o contêiner
        stopEmojiRain();
    }

    // --- Lógica do Slideshow (Mantida) ---
    function startSlideshow() {
        clearInterval(slideshowInterval);

        if (activeImages.length === 0) {
            console.log("Nenhuma imagem para o slideshow. Mostrando placeholders.");
            imagePreviews.forEach((img, index) => {
                img.classList.remove('active');
                img.src = `https://via.placeholder.com/120x180?text=Foto+${index + 1}`;
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
        console.log("Imagens ativas para slideshow:", activeImages.map(img => img.src));

        if (!dateInputContainer.classList.contains('hidden')) {
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

    // --- Funções para MÚSICA (YouTube) (Mantidas) ---
    function extractYoutubeVideoId(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    function createYoutubePlayer(videoId, autoplay = false) {
        if (player) {
            player.destroy();
        }

        player = new YT.Player('player', {
            videoId: videoId,
            playerVars: {
                'autoplay': autoplay ? 1 : 0,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'loop': 1,
                'playlist': videoId
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        console.log("Player is ready:", event.target);
        if (event.target.getPlayerState() !== YT.PlayerState.PLAYING && event.target.getPlaylistId()) {
             event.target.playVideo();
        }
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            player.seekTo(0);
            player.playVideo();
        } else if (event.data === YT.PlayerState.PAUSED && currentYoutubeVideoId && photosContainer.classList.contains('slideshow-mode')) {
            player.playVideo();
        }
    }

    function loadMusic() {
        const url = youtubeLinkInput.value.trim();
        const videoId = extractYoutubeVideoId(url);
        if (videoId) {
            currentYoutubeVideoId = videoId;
            currentMusicTitle = musicNameInput.value.trim() || "Música Selecionada";
            localStorage.setItem('youtubeVideoId', currentYoutubeVideoId);
            localStorage.setItem('musicTitle', currentMusicTitle);

            musicLoadedMessage.textContent = `Música carregada: ${currentMusicTitle}`;
            musicLoadedMessage.classList.add('show');
            setTimeout(() => {
                musicLoadedMessage.classList.remove('show');
            }, 3000);

            createYoutubePlayer(currentYoutubeVideoId, false);

        } else {
            alert("Por favor, insira um link de vídeo do YouTube válido.");
            currentYoutubeVideoId = null;
            currentMusicTitle = "";
            localStorage.removeItem('youtubeVideoId');
            localStorage.removeItem('musicTitle');
            if (player) {
                player.destroy();
                player = null;
            }
            musicLoadedMessage.textContent = "Link de música inválido.";
            musicLoadedMessage.classList.add('show');
            setTimeout(() => {
                musicLoadedMessage.classList.remove('show');
            }, 3000);
        }
    }

    function loadMusicFromStorageOrURL() {
        const hashParams = window.location.hash.substring(1);
        if (hashParams) {
            try {
                const decodedParams = decodeURIComponent(hashParams);
                const data = JSON.parse(decodedParams);
                if (data.youtubeVideoId) {
                    currentYoutubeVideoId = data.youtubeVideoId;
                    currentMusicTitle = data.musicTitle || "Música em Reprodução";
                    youtubeLinkInput.value = `https://www.youtube.com/watch?v=${currentYoutubeVideoId}`;
                    musicNameInput.value = currentMusicTitle;
                    return;
                }
            } catch (e) {
                console.error("Erro ao analisar dados do hash para música:", e);
            }
        }

        const storedVideoId = localStorage.getItem('youtubeVideoId');
        const storedMusicTitle = localStorage.getItem('musicTitle');
        if (storedVideoId) {
            currentYoutubeVideoId = storedVideoId;
            currentMusicTitle = storedMusicTitle || "Música Selecionada";
            youtubeLinkInput.value = `https://www.youtube.com/watch?v=${currentYoutubeVideoId}`;
            musicNameInput.value = currentMusicTitle;
            createYoutubePlayer(currentYoutubeVideoId, false);
        }
    }

    // --- NOVAS FUNÇÕES PARA EMOJIS ---
    function isValidEmoji(str) {
        // Verifica se a string contém pelo menos um caractere de emoji
        // Isso é uma verificação básica, pode não cobrir todos os casos complexos de emojis combinados
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        return emojiRegex.test(str);
    }

    function getSelectedEmojis() {
        const emojis = [
            emojiInput1.value.trim(),
            emojiInput2.value.trim(),
            emojiInput3.value.trim()
        ].filter(emoji => emoji && isValidEmoji(emoji)); // Filtra vazios e inválidos
        return emojis.length > 0 ? emojis : null; // Retorna null se nenhum emoji válido for selecionado
    }

    function createFallingEmoji() {
        if (selectedEmojis.length === 0) return;

        const emoji = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
        const emojiElement = document.createElement('span');
        emojiElement.classList.add('falling-emoji');
        emojiElement.textContent = emoji;

        const startX = Math.random() * (window.innerWidth - 50); // Posição X aleatória
        const animationDuration = Math.random() * 5 + 5; // Duração entre 5 e 10 segundos
        const delay = Math.random() * 3; // Delay de início para espalhar os emojis

        emojiElement.style.left = `${startX}px`;
        emojiElement.style.animationDuration = `${animationDuration}s`;
        emojiElement.style.animationDelay = `${delay}s`;

        emojiRainContainer.appendChild(emojiElement);

        // Remove o emoji após a animação para evitar acúmulo de elementos no DOM
        emojiElement.addEventListener('animationend', () => {
            emojiElement.remove();
        });
    }

    function startEmojiRain() {
        stopEmojiRain(); // Garante que não há múltiplos intervalos rodando
        emojiRainInterval = setInterval(createFallingEmoji, 300); // Cria um emoji a cada 300ms
    }

    function stopEmojiRain() {
        clearInterval(emojiRainInterval);
        // Opcional: Limpar todos os emojis existentes imediatamente
        while (emojiRainContainer.firstChild) {
            emojiRainContainer.removeChild(emojiRainContainer.firstChild);
        }
    }

    // --- Lógica de Carregamento Inicial (Prioridade: URL Hash > localStorage) ---
    const initialHashParams = window.location.hash.substring(1);

    if (initialHashParams) {
        try {
            const decodedParams = decodeURIComponent(initialHashParams);
            const data = JSON.parse(decodedParams);

            if (data.startDate) {
                startDate = new Date(data.startDate);
                if (isValidDate(startDate)) {
                    startCountdown();
                } else {
                    console.error("Data inválida no link.");
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
                            imagePreviews[index].src = `https://via.placeholder.com/120x180?text=Foto+${index + 1}`;
                        }
                    }
                });
            } else {
                imagePreviews.forEach((img, index) => {
                    img.src = `https://via.placeholder.com/120x180?text=Foto+${index + 1}`;
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

            // MÚSICA: Carrega do hash e prepara para autoplay se a data for válida
            if (data.youtubeVideoId) {
                currentYoutubeVideoId = data.youtubeVideoId;
                currentMusicTitle = data.musicTitle || "Música em Reprodução";
            }

            // EMOJIS: Carrega do hash
            if (data.selectedEmojis && Array.isArray(data.selectedEmojis)) {
                selectedEmojis = data.selectedEmojis.filter(emoji => isValidEmoji(emoji));
                if (selectedEmojis[0]) emojiInput1.value = selectedEmojis[0];
                if (selectedEmojis[1]) emojiInput2.value = selectedEmojis[1];
                if (selectedEmojis[2]) emojiInput3.value = selectedEmojis[2];
            }


            if (isValidDate(startDate)) {
                hideEditingElements();
            } else {
                updateDisplayForNoDate();
                showEditingElements();
            }

        } catch (e) {
            console.error("Erro ao decodificar ou analisar o link:", e);
            alert("O link de personalização está inválido. Por favor, crie um novo.");
            updateDisplayForNoDate();
            showEditingElements();
        }
    } else {
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
                imgElement.src = `https://via.placeholder.com/120x180?text=Foto+${index + 1}`;
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

        // EMOJIS: Carrega do localStorage no modo de edição
        const storedEmojis = JSON.parse(localStorage.getItem('selectedEmojis')) || [];
        if (storedEmojis.length > 0) {
            selectedEmojis = storedEmojis.filter(emoji => isValidEmoji(emoji)); // Garante que apenas emojis válidos são armazenados
            if (selectedEmojis[0]) emojiInput1.value = selectedEmojis[0];
            if (selectedEmojis[1]) emojiInput2.value = selectedEmojis[1];
            if (selectedEmojis[2]) emojiInput3.value = selectedEmojis[2];
        }

        showEditingElements();
    }

    if (typeof YT !== 'undefined' && YT.Player) {
        loadMusicFromStorageOrURL();
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

    // Atualiza os emojis selecionados no localStorage sempre que um input de emoji muda
    [emojiInput1, emojiInput2, emojiInput3].forEach(input => {
        input.addEventListener('input', () => {
            const currentEmojis = [
                emojiInput1.value.trim(),
                emojiInput2.value.trim(),
                emojiInput3.value.trim()
            ].filter(emoji => emoji && isValidEmoji(emoji));
            localStorage.setItem('selectedEmojis', JSON.stringify(currentEmojis));
        });
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
            const defaultPlaceholderSrc = `https://via.placeholder.com/120x180?text=Foto+${index + 1}`;

            imagePreviews[index].src = defaultPlaceholderSrc;
            localStorage.removeItem(`uploadedImage${index + 1}`);
            event.target.classList.remove('show-button');

            updateActiveImages();
        });
    });

    loadMusicButton.addEventListener('click', loadMusic);

    // --- Gerar Link (Inclui a mensagem personalizada, a música e os EMOJIS) ---
    generateLinkButton.addEventListener('click', async () => {
        if (!startDate || !isValidDate(startDate)) {
            alert("Por favor, defina a data inicial antes de gerar o link.");
            return;
        }

        // Obtém os emojis selecionados no momento da geração do link
        const currentSelectedEmojis = getSelectedEmojis();

        const config = {
            startDate: startDate.toISOString(),
            images: imagePreviews.map(img => img.src.includes('via.placeholder.com') ? null : img.src),
            themeColor: currentThemeColor,
            personalMessage: personalMessageInput.value,
            youtubeVideoId: currentYoutubeVideoId,
            musicTitle: currentMusicTitle,
            selectedEmojis: currentSelectedEmojis // Adiciona os emojis ao config
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

            // APÓS GERAR E COPIAR O LINK, ESCONDER OS ELEMENTOS DE EDIÇÃO
            hideEditingElements();

        } catch (err) {
            console.error('Falha ao copiar o link: ', err);
            copyMessage.textContent = "Erro ao copiar. Copie manualmente: " + link;
            copyMessage.classList.add('show');
        }
    });


    // --- Funções do Contador (Mantidas) ---
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
