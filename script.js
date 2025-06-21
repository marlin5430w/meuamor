document.addEventListener('DOMContentLoaded', () => {
    // Referências para elementos HTML
    const startDateInput = document.getElementById('startDate');
    const setStartDateButton = document.getElementById('setStartDateButton');
    const themeColorInput = document.getElementById('themeColor');
    const musicLinkInput = document.getElementById('musicLink');
    const musicNameInput = document.getElementById('musicName');
    const loadMusicButton = document.getElementById('loadMusicButton');
    const nextPage1Button = document.getElementById('nextPage1Button');
    const generateLinkButton = document.getElementById('generateLinkButton');
    const backToPage1Button = document.getElementById('backToPage1Button');
    const backToPage2Button = document.getElementById('backToPage2Button'); // Botão "Voltar para Edição" na page3
    const customMessageInput = document.getElementById('customMessage');
    const copyMessage = document.getElementById('copyMessage');
    const photoUploaders = document.querySelectorAll('.photo-uploader');
    const emojiInputs = document.querySelectorAll('.emoji-input');
    const shareLinkDisplay = document.getElementById('shareLinkDisplay');
    const copyLinkButton = document.getElementById('copyLinkButton');
    const shareLinkSection = document.getElementById('shareLinkSection');

    // Elementos da Página de Visualização (Page 3)
    const counterDisplay = document.getElementById('counterDisplay');
    const viewModeMessageElement = document.getElementById('viewModeMessage');
    const slideshowContainer = document.getElementById('slideshowContainer');
    const musicPlayerDisplay = document.querySelector('.music-player-display');
    const musicInfoDisplay = document.getElementById('musicInfoDisplay');
    const emojiRainContainer = document.getElementById('emojiRainContainer');
    const playerDiv = document.getElementById('player');

    // Páginas
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');

    // Estado da aplicação
    let startDate = new Date('2023-10-14T00:00:00');
    let currentThemeColor = themeColorInput.value;
    let musicData = { link: '', name: '' };
    let photos = ['', '', ''];
    let currentPhotoIndex = 0;
    let photoSlideshowInterval;
    let player;
    let generatedShareLink = '';
    let counterInterval;

    // --- Funções Auxiliares ---

    function showPage(pageToShow) {
        console.log('Tentando mostrar página:', pageToShow.id);
        [page1, page2, page3].forEach(page => {
            page.classList.remove('active'); // Remove active de todas
            page.classList.add('hidden');    // Esconde todas
        });
        
        // Pequeno atraso para a transição CSS funcionar
        setTimeout(() => {
            pageToShow.classList.remove('hidden'); // Revela a página desejada
            pageToShow.classList.add('active');    // Ativa a página para a transição
        }, 10);
        
        if (pageToShow) {
            pageToShow.scrollTop = 0;
        }
    }

    function loadSavedData() {
        const savedDate = localStorage.getItem('startDate');
        if (savedDate) {
            startDate = new Date(savedDate);
            startDateInput.value = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().slice(0, -8);
        }

        const savedColor = localStorage.getItem('themeColor');
        if (savedColor) {
            currentThemeColor = savedColor;
            themeColorInput.value = savedColor;
            applyThemeColor(currentThemeColor);
        }

        const savedMusicLink = localStorage.getItem('musicLink');
        const savedMusicName = localStorage.getItem('musicName');
        if (savedMusicLink) musicData.link = savedMusicLink;
        if (savedMusicName) musicData.name = savedMusicName;
        musicLinkInput.value = musicData.link;
        musicNameInput.value = musicData.name;

        const savedMessage = localStorage.getItem('customMessage');
        if (savedMessage) customMessageInput.value = savedMessage;

        const savedPhotos = JSON.parse(localStorage.getItem('photos')) || [];
        savedPhotos.forEach((photo, index) => {
            if (photo) {
                photos[index] = photo;
                const imgPreview = document.getElementById(`photoPreview${index + 1}`);
                const uploadText = document.getElementById(`uploadText${index + 1}`);
                if (imgPreview) {
                    imgPreview.src = photo;
                    imgPreview.style.opacity = '1';
                    if (uploadText) {
                         uploadText.style.display = 'none';
                    }
                    const uploaderElement = photoUploaders[index];
                    const removeBtn = uploaderElement ? uploaderElement.querySelector('.remove-photo-button') : null;
                    if (removeBtn) removeBtn.classList.add('show-button');
                }
            }
        });

        const savedEmojis = JSON.parse(localStorage.getItem('emojis')) || ['', '', ''];
        emojiInputs.forEach((input, index) => {
            input.value = savedEmojis[index] || '';
        });
    }

    function saveAllData() {
        localStorage.setItem('startDate', startDate.toISOString());
        localStorage.setItem('themeColor', currentThemeColor);
        localStorage.setItem('musicLink', musicData.link);
        localStorage.setItem('musicName', musicData.name);
        localStorage.setItem('customMessage', customMessageInput.value);
        localStorage.setItem('photos', JSON.stringify(photos));
        const emojisToSave = Array.from(emojiInputs).map(input => input.value);
        localStorage.setItem('emojis', JSON.stringify(emojisToSave));
    }

    function applyThemeColor(color) {
        document.documentElement.style.setProperty('--main-color', color);
        if (typeof tinycolor !== 'undefined') {
            document.documentElement.style.setProperty('--main-color-dark', tinycolor(color).darken(10).toString());
            document.documentElement.style.setProperty('--main-color-shadow', tinycolor(color).setAlpha(0.4).toRgbString());
            document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(color).setAlpha(0.5).toRgbString());
            document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(color).setAlpha(0.1).toRgbString());
        }
    }

    function getYouTubeVideoId(url) {
        let videoId = '';
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match && match[1]) {
            videoId = match[1];
        }
        return videoId;
    }

    function updateCounter() {
        const now = new Date();
        const diff = now.getTime() - startDate.getTime();

        if (diff < 0) {
            counterDisplay.textContent = "Ainda não chegou a data!";
            return;
        }

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30.44);
        const years = Math.floor(days / 365.25);

        const remainingMonths = months % 12;
        const remainingDays = days % 30;
        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        counterDisplay.textContent =
            `${years} ano${years !== 1 ? 's' : ''}, ` +
            `${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}, ` +
            `${remainingDays} dia${remainingDays !== 1 ? 's' : ''}\n` +
            `${remainingHours} hora${remainingHours !== 1 ? 's' : ''}, ` +
            `${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''} e ` +
            `${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
    }

    function startEmojiRain() {
        const emojisToRain = Array.from(emojiInputs).map(input => input.value).filter(Boolean);
        if (emojisToRain.length === 0) {
            emojiRainContainer.style.display = 'none';
            return;
        }
        emojiRainContainer.style.display = 'block';
        emojiRainContainer.innerHTML = '';

        const createEmoji = () => {
            const emoji = document.createElement('span');
            emoji.classList.add('falling-emoji');
            emoji.textContent = emojisToRain[Math.floor(Math.random() * emojisToRain.length)];
            emoji.style.left = `${Math.random() * 100}vw`;
            emoji.style.animationDuration = `${Math.random() * 3 + 2}s`;
            emoji.style.animationDelay = `${Math.random() * 5}s`;
            emojiRainContainer.appendChild(emoji);

            emoji.addEventListener('animationend', () => {
                emoji.remove();
            });
        };

        for (let i = 0; i < 30; i++) {
            createEmoji();
        }
        setInterval(createEmoji, 500);
    }

    function onYouTubeIframeAPIReady() {
        const videoId = getYouTubeVideoId(musicData.link);
        if (videoId) {
            if (player) {
                player.destroy();
            }
            playerDiv.style.display = 'block';
            musicPlayerDisplay.classList.remove('hidden');

            player = new YT.Player('player', {
                height: '100',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'autoplay': 1,
                    'controls': 1,
                    'disablekb': 1,
                    'fs': 0,
                    'iv_load_policy': 3,
                    'modestbranding': 1,
                    'rel': 0,
                    'showinfo': 0,
                    'start': 0
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        } else {
            playerDiv.innerHTML = '';
            musicPlayerDisplay.classList.add('hidden');
            musicInfoDisplay.classList.add('hidden');
        }
    }
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    function onPlayerReady(event) {
        event.target.playVideo();
        musicPlayerDisplay.classList.remove('hidden');
        musicInfoDisplay.textContent = musicData.name || "Música Carregada";
        musicInfoDisplay.classList.remove('hidden');
    }

    function onPlayerStateChange(event) {
        // Lógica de loop ou outras reações
    }

    // --- Event Listeners ---

    setStartDateButton.addEventListener('click', () => {
        if (startDateInput.value) {
            startDate = new Date(startDateInput.value);
            saveAllData();
            alert('Data inicial definida!');
        } else {
            alert('Por favor, selecione uma data e hora.');
        }
    });

    themeColorInput.addEventListener('input', (event) => {
        currentThemeColor = event.target.value;
        applyThemeColor(currentThemeColor);
        saveAllData();
    });

    loadMusicButton.addEventListener('click', () => {
        const link = musicLinkInput.value.trim();
        const name = musicNameInput.value.trim();
        if (link) {
            musicData.link = link;
            musicData.name = name;
            saveAllData();
            alert('Música carregada! Ela tocará na visualização final.');
            if (page3.classList.contains('active') && typeof YT !== 'undefined' && YT.Player) {
                onYouTubeIframeAPIReady();
            }
        } else {
            alert('Por favor, insira um link do YouTube válido.');
        }
    });

    photoUploaders.forEach((uploader, index) => {
        const fileInput = uploader.querySelector('.hidden-file-input');
        const imgPreview = uploader.querySelector('img');
        const uploadText = uploader.querySelector('.upload-text');
        const removeBtn = uploader.querySelector('.remove-photo-button');

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photos[index] = e.target.result;
                    imgPreview.src = e.target.result;
                    imgPreview.style.opacity = '1';
                    if (uploadText) {
                        uploadText.style.display = 'none';
                    }
                    if (removeBtn) {
                        removeBtn.classList.add('show-button');
                    }
                    saveAllData();
                };
                reader.readAsDataURL(file);
            }
        });

        if (removeBtn) {
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                photos[index] = '';
                imgPreview.src = '';
                imgPreview.style.opacity = '0';
                if (uploadText) {
                    uploadText.style.display = 'block';
                }
                removeBtn.classList.remove('show-button');
                saveAllData();
            });
        }

        const customUploadLabel = uploader.querySelector('.custom-file-upload');
        if (customUploadLabel) {
            customUploadLabel.addEventListener('click', () => {
                fileInput.click();
            });
        }
    });

    emojiInputs.forEach(input => {
        input.addEventListener('input', saveAllData);
    });

    customMessageInput.addEventListener('input', saveAllData);

    // --- Navegação entre Páginas ---
    nextPage1Button.addEventListener('click', () => {
        showPage(page2);
    });

    backToPage1Button.addEventListener('click', () => {
        showPage(page1);
    });

    // Este botão será visível apenas no modo de edição na page3
    backToPage2Button.addEventListener('click', () => {
        showPage(page1); // Volta para a página 1 (edição principal)

        clearInterval(photoSlideshowInterval);
        photoSlideshowInterval = null;
        if (player) {
            player.destroy();
            player = null;
        }
        clearInterval(counterInterval);
        counterInterval = null;

        emojiRainContainer.style.display = 'none';
        slideshowContainer.innerHTML = '';
        musicInfoDisplay.classList.add('hidden');
        playerDiv.innerHTML = '';
        musicPlayerDisplay.classList.add('hidden');
        
        // Garante que a seção do link seja escondida na edição
        if (shareLinkSection) {
            shareLinkSection.classList.add('hidden');
        }
        // Remove a classe de visualização limpa ao voltar para a edição
        page3.classList.remove('hide-edit-options');
    });

    // --- Botão Gerar Link Compartilhável (CRÍTICO) ---
    generateLinkButton.addEventListener('click', async () => {
        await generateShareLink();
        showPage(page3); // Transição para a página 3 (visualização)
        updateViewModeContent(false); // Passa 'false' para indicar que não é um link direto (manter botões)
    });

    // Botão Copiar Link
    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', async () => {
            if (generatedShareLink) {
                try {
                    await navigator.clipboard.writeText(generatedShareLink);
                    copyMessage.textContent = 'Link copiado!';
                    copyMessage.classList.add('show');
                    setTimeout(() => {
                        copyMessage.classList.remove('show');
                        copyMessage.textContent = 'Copiado!';
                    }, 3000);
                } catch (err) {
                    console.error('Falha ao copiar o link: ', err);
                    alert('Não foi possível copiar o link automaticamente. Por favor, copie e cole manualmente:\n\n' + generatedShareLink);
                }
            } else {
                alert('Nenhum link para copiar. Gere o link primeiro.');
            }
        });
    }

    function generateShareLink() {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();

        params.append('date', startDate.toISOString());
        params.append('color', currentThemeColor.replace('#', ''));

        if (musicData.link) {
            params.append('musicLink', musicData.link);
            if (musicData.name) {
                params.append('musicName', musicData.name);
            }
        }

        const emojis = Array.from(emojiInputs).map(input => input.value).filter(Boolean);
        if (emojis.length > 0) {
            params.append('emojis', emojis.join(','));
        }

        if (customMessageInput.value) {
            params.append('message', customMessageInput.value);
        }

        const photosBase64 = photos.filter(Boolean);
        if (photosBase64.length > 0) {
            params.append('photos', JSON.stringify(photosBase64));
        }

        // Adiciona um parâmetro para indicar que é uma visualização sem edição
        params.append('mode', 'view'); 

        generatedShareLink = `${baseUrl}?${params.toString()}`;

        if (shareLinkDisplay && copyLinkButton && shareLinkSection) {
            shareLinkDisplay.value = generatedShareLink;
            shareLinkSection.classList.remove('hidden');
        }
        return Promise.resolve(); // Retorna uma Promise resolvida
    }

    // `isDirectLink` é um booleano que indica se a página foi carregada diretamente por um link compartilhado
    function updateViewModeContent(isDirectLink) {
        const urlParams = new URLSearchParams(window.location.search);

        clearInterval(counterInterval);
        clearInterval(photoSlideshowInterval);
        if (player) {
            player.destroy();
            player = null;
        }
        slideshowContainer.innerHTML = '';
        emojiRainContainer.innerHTML = '';
        emojiRainContainer.style.display = 'none';
        musicPlayerDisplay.classList.add('hidden');
        musicInfoDisplay.classList.add('hidden');
        playerDiv.innerHTML = '';
        counterDisplay.classList.add('hidden');
        viewModeMessageElement.classList.add('hidden');

        // Lógica para esconder opções de edição e botão de voltar
        if (isDirectLink) {
            page3.classList.add('hide-edit-options'); // Adiciona a classe para esconder botões e seção de link
        } else {
            page3.classList.remove('hide-edit-options'); // Remove se for do modo de edição
        }

        const dateParam = urlParams.get('date');
        if (dateParam) {
            startDate = new Date(dateParam);
            updateCounter();
            counterInterval = setInterval(updateCounter, 1000);
            counterDisplay.classList.remove('hidden');
        }

        const colorParam = urlParams.get('color');
        if (colorParam) {
            const loadedColor = '#' + colorParam;
            applyThemeColor(loadedColor);
        }

        const messageParam = urlParams.get('message');
        if (messageParam) {
            viewModeMessageElement.textContent = decodeURIComponent(messageParam); // Decodifica a mensagem
            viewModeMessageElement.classList.remove('hidden');
        }

        const emojisParam = urlParams.get('emojis');
        if (emojisParam) {
            const loadedEmojis = emojisParam.split(',');
            emojiInputs.forEach((input, index) => {
                input.value = loadedEmojis[index] || '';
            });
            startEmojiRain();
        }

        const photosParam = urlParams.get('photos');
        if (photosParam) {
            try {
                const loadedPhotos = JSON.parse(photosParam);
                if (loadedPhotos.length > 0) {
                    photos = loadedPhotos;
                    startSlideshow();
                    slideshowContainer.classList.remove('hidden');
                } else {
                    slideshowContainer.classList.add('hidden');
                }
            } catch (e) {
                console.error("Erro ao parsear fotos:", e);
                slideshowContainer.classList.add('hidden');
            }
        } else {
            slideshowContainer.classList.add('hidden');
        }

        const musicLinkParam = urlParams.get('musicLink');
        const musicNameParam = urlParams.get('musicName');
        
        if (musicLinkParam) {
            musicData.link = musicLinkParam;
            musicData.name = musicNameParam || '';
            if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api"; // URL CORRETA DA API DO YOUTUBE
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            } else {
                onYouTubeIframeAPIReady();
            }
        } else {
            playerDiv.innerHTML = '';
            musicPlayerDisplay.classList.add('hidden');
            musicInfoDisplay.classList.add('hidden');
        }
    }

    function startSlideshow() {
        if (photos.length === 0 || photos.every(p => !p)) {
            slideshowContainer.classList.add('hidden');
            return;
        }

        slideshowContainer.classList.remove('hidden');
        slideshowContainer.innerHTML = '';

        photos.forEach((photoSrc, index) => {
            if (photoSrc) {
                const imgWrapper = document.createElement('div');
                imgWrapper.classList.add('photo-wrapper');
                const img = document.createElement('img');
                img.src = photoSrc;
                img.alt = `Foto ${index + 1}`;
                img.classList.add('slideshow-photo');
                imgWrapper.appendChild(img);
                slideshowContainer.appendChild(imgWrapper);
            }
        });

        currentPhotoIndex = 0;
        const slideshowPhotos = slideshowContainer.querySelectorAll('.slideshow-photo');

        clearInterval(photoSlideshowInterval);

        if (slideshowPhotos.length > 0) {
            slideshowPhotos[0].classList.add('active');
            if (slideshowPhotos.length > 1) {
                photoSlideshowInterval = setInterval(() => {
                    slideshowPhotos[currentPhotoIndex].classList.remove('active');
                    currentPhotoIndex = (currentPhotoIndex + 1) % slideshowPhotos.length;
                    slideshowPhotos[currentPhotoIndex].classList.add('active');
                }, 3000);
            }
        }
    }

    // Polyfill básico para tinycolor (manter, se não estiver usando a lib externa)
    if (typeof tinycolor === 'undefined') {
        window.tinycolor = function(color) {
            let r, g, b, a = 1;
            if (color && typeof color === 'string' && color.startsWith('#') && color.length === 7) {
                r = parseInt(color.substring(1, 3), 16);
                g = parseInt(color.substring(3, 5), 16);
                b = parseInt(color.substring(5, 7), 16);
            }
            return {
                _r: r, _g: g, _b: b, _a: a,
                darken: function(amount) {
                    const val = (c, amt) => Math.max(0, Math.min(255, c - Math.floor(c * (amt / 100))));
                    return `rgb(${val(this._r, amount)}, ${val(this._g, amount)}, ${val(this._b, amount)})`;
                },
                setAlpha: function(newAlpha) {
                    this._a = newAlpha;
                    return this;
                },
                toRgbString: function() {
                    return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
                },
                toString: function() {
                    if (this._a === 1 && this._r !== undefined) {
                        const toHex = (c) => `0${c.toString(16)}`.slice(-2);
                        return `#${toHex(this._r)}${toHex(this._g)}${toHex(this._b)}`;
                    }
                    return this.toRgbString();
                }
            };
        };
    }

    // --- Inicialização ---

    loadSavedData();
    applyThemeColor(currentThemeColor);

    // Verifica se há parâmetros na URL, e se o modo é 'view'
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (mode === 'view') {
        showPage(page3);
        updateViewModeContent(true); // Passa 'true' para indicar que é um link direto (esconder botões)
    } else {
        showPage(page1);
    }
});
