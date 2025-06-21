document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('startDate');
    const setStartDateButton = document.getElementById('setStartDateButton');
    const themeColorInput = document.getElementById('themeColor');
    const musicLinkInput = document.getElementById('musicLink');
    const musicNameInput = document.getElementById('musicName');
    const loadMusicButton = document.getElementById('loadMusicButton');
    const customMessageInput = document.getElementById('customMessage');
    const nextPage1Button = document.getElementById('nextPage1Button');
    const generateLinkButton = document.getElementById('generateLinkButton');
    const backToPage1Button = document.getElementById('backToPage1Button');
    const backToPage2Button = document.getElementById('backToPage2Button');

    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');

    const emojiInputs = document.querySelectorAll('.emoji-input');
    const photoUploadInputs = document.querySelectorAll('.hidden-file-input');
    const photoPreviews = document.querySelectorAll('[id^="photoPreview"]');
    const uploadTexts = document.querySelectorAll('[id^="uploadText"]');
    const removePhotoButtons = document.querySelectorAll('.remove-photo-button');

    const counterDisplay = document.getElementById('counterDisplay');
    const viewModeMessage = document.getElementById('viewModeMessage');
    const slideshowContainer = document.getElementById('slideshowContainer');
    const musicInfoDisplay = document.getElementById('musicInfoDisplay');
    const youtubePlayerDiv = document.getElementById('player');
    const shareLinkDisplay = document.getElementById('shareLinkDisplay');
    const copyLinkButton = document.getElementById('copyLinkButton');
    const copyMessage = document.getElementById('copyMessage');
    const shareLinkSection = document.getElementById('shareLinkSection');
    const emojiRainContainer = document.getElementById('emojiRainContainer');

    let initialDate = new Date('2023-10-14T00:00:00'); // Default date
    let themeColor = '#FF00FF'; // Default color
    let musicLink = '';
    let musicName = '';
    let customMessage = '';
    let selectedEmojis = ['', '', ''];
    let photoBase64s = ['', '', '']; // Armazena as imagens como Base64
    let currentPhotoIndex = 0;
    let slideshowInterval;
    let player; // Variável para o player do YouTube

    // --- Funções de Navegação de Página ---
    function showPage(pageToShow) {
        [page1, page2, page3].forEach(page => {
            page.classList.remove('active');
            page.classList.add('hidden'); // Esconde usando display: none
        });
        pageToShow.classList.remove('hidden');
        pageToShow.classList.add('active');
        // Rola para o topo da página ao mudar
        pageToShow.scrollTop = 0;
    }

    // --- Funções de Estado e Salvar/Carregar ---
    function saveState() {
        const state = {
            initialDate: initialDate.toISOString(),
            themeColor,
            musicLink,
            musicName,
            customMessage,
            selectedEmojis,
            photoBase64s // Salva as imagens em Base64
        };
        localStorage.setItem('appState', JSON.stringify(state));
    }

    function loadState() {
        const storedState = localStorage.getItem('appState');
        if (storedState) {
            const state = JSON.parse(storedState);
            initialDate = new Date(state.initialDate);
            themeColor = state.themeColor;
            musicLink = state.musicLink;
            musicName = state.musicName;
            customMessage = state.customMessage;
            selectedEmojis = state.selectedEmojis || ['', '', ''];
            photoBase64s = state.photoBase64s || ['', '', ''];

            startDateInput.value = initialDate.toISOString().substring(0, 16);
            themeColorInput.value = themeColor;
            musicLinkInput.value = musicLink;
            musicNameInput.value = musicName;
            customMessageInput.value = customMessage;

            document.documentElement.style.setProperty('--main-color', themeColor);
            document.documentElement.style.setProperty('--main-color-dark', tinycolor(themeColor).darken(10).toString());
            document.documentElement.style.setProperty('--main-color-shadow', tinycolor(themeColor).setAlpha(0.4).toString());
            document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(themeColor).setAlpha(0.5).toString());
            document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(themeColor).setAlpha(0.1).toString());

            emojiInputs.forEach((input, index) => {
                input.value = selectedEmojis[index] || '';
            });

            // Carrega as imagens Base64 nas pré-visualizações
            photoBase64s.forEach((base64, index) => {
                if (base64) {
                    photoPreviews[index].src = base64;
                    photoPreviews[index].style.opacity = 1;
                    uploadTexts[index].style.display = 'none'; // Esconde o texto "Foto X"
                    removePhotoButtons[index].classList.add('show-button');
                } else {
                    photoPreviews[index].src = '';
                    photoPreviews[index].style.opacity = 0;
                    uploadTexts[index].style.display = 'block'; // Mostra o texto "Foto X"
                    removePhotoButtons[index].classList.remove('show-button');
                }
            });
        }
    }

    // --- Contadores e Exibição de Tempo ---
    function updateCounter() {
        const now = new Date();
        const diff = now.getTime() - initialDate.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const years = Math.floor(days / 365.25); // Considera anos bissextos
        const remainingDays = Math.floor(days % 365.25);

        const displayMessage = `Estamos juntos há:\n${years} anos e ${remainingDays} dias`;
        counterDisplay.textContent = displayMessage;
    }

    // --- YouTube Player API ---
    function loadYoutubeAPI() {
        if (typeof(YT) == 'undefined' || !YT.Player) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            onYouTubeIframeAPIReady(); // Chama diretamente se já carregada
        }
    }

    window.onYouTubeIframeAPIReady = function() {
        if (musicLink) {
            const videoId = getYoutubeVideoId(musicLink);
            if (videoId) {
                player = new YT.Player('player', {
                    height: '100', // Ajuste a altura do player
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 1, // Autoplay para o link gerado
                        'controls': 1,
                        'modestbranding': 1,
                        'rel': 0
                    },
                    events: {
                        'onReady': onPlayerReady
                    }
                });
            } else {
                youtubePlayerDiv.innerHTML = '<p style="color: red;">Link de vídeo inválido.</p>';
            }
        }
    };

    function onPlayerReady(event) {
        event.target.playVideo();
        youtubePlayerDiv.classList.remove('hidden');
    }

    function getYoutubeVideoId(url) {
        const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
        const match = url.match(regExp);
        return (match && match[1]) ? match[1] : null;
    }

    // --- Slideshow de Fotos ---
    function startSlideshow() {
        if (photoBase64s.filter(p => p).length === 0) {
            slideshowContainer.classList.add('hidden');
            return;
        }

        slideshowContainer.classList.remove('hidden');
        // Limpa fotos anteriores
        slideshowContainer.innerHTML = '';

        const activePhotos = photoBase64s.filter(p => p); // Apenas fotos que foram carregadas

        if (activePhotos.length > 0) {
            activePhotos.forEach((base64, index) => {
                const img = document.createElement('img');
                img.src = base64;
                img.classList.add('slideshow-photo');
                img.alt = `Foto ${index + 1}`;
                slideshowContainer.appendChild(img);
            });

            const slideshowImages = slideshowContainer.querySelectorAll('.slideshow-photo');
            currentPhotoIndex = 0; // Reinicia o índice
            slideshowImages[currentPhotoIndex].classList.add('active');

            if (slideshowInterval) {
                clearInterval(slideshowInterval);
            }

            if (activePhotos.length > 1) { // Só inicia o intervalo se houver mais de uma foto
                slideshowInterval = setInterval(() => {
                    slideshowImages[currentPhotoIndex].classList.remove('active');
                    currentPhotoIndex = (currentPhotoIndex + 1) % slideshowImages.length;
                    slideshowImages[currentPhotoIndex].classList.add('active');
                }, 5000); // Muda a cada 5 segundos
            }
        } else {
             slideshowContainer.classList.add('hidden'); // Esconde se não houver fotos
        }
    }

    // --- Chuva de Emojis ---
    function startEmojiRain() {
        if (selectedEmojis.filter(e => e).length === 0) {
            emojiRainContainer.innerHTML = ''; // Limpa se não houver emojis
            return;
        }

        emojiRainContainer.innerHTML = ''; // Limpa antes de começar nova chuva

        const emojisToUse = selectedEmojis.filter(e => e); // Apenas emojis preenchidos

        if (emojisToUse.length === 0) return;

        setInterval(() => {
            const emoji = document.createElement('span');
            emoji.classList.add('falling-emoji');
            emoji.textContent = emojisToUse[Math.floor(Math.random() * emojisToUse.length)]; // Seleciona um emoji aleatório
            
            // Posição inicial aleatória na largura da tela
            const startX = Math.random() * 100; // Porcentagem
            emoji.style.left = `${startX}vw`;

            // Tempo de animação aleatório para variação
            const animationDuration = Math.random() * 5 + 5; // 5 a 10 segundos
            emoji.style.animationDuration = `${animationDuration}s`;

            // Offset X para a queda (para não cair reto)
            const offsetX = (Math.random() - 0.5) * 50; // -25vw a 25vw
            emoji.style.setProperty('--fall-x-offset', `${offsetX}vw`);

            emojiRainContainer.appendChild(emoji);

            // Remover emoji após a animação para otimização
            emoji.addEventListener('animationend', () => {
                emoji.remove();
            });
        }, 300); // A cada 300ms adiciona um novo emoji
    }


    // --- Event Listeners ---
    setStartDateButton.addEventListener('click', () => {
        initialDate = new Date(startDateInput.value);
        saveState();
        updateCounter();
    });

    themeColorInput.addEventListener('input', () => {
        themeColor = themeColorInput.value;
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', tinycolor(themeColor).darken(10).toString());
        document.documentElement.style.setProperty('--main-color-shadow', tinycolor(themeColor).setAlpha(0.4).toString());
        document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(themeColor).setAlpha(0.5).toString());
        document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(themeColor).setAlpha(0.1).toString());
        saveState();
    });

    loadMusicButton.addEventListener('click', () => {
        musicLink = musicLinkInput.value;
        musicName = musicNameInput.value;
        saveState();
        alert('Música salva! Ela será carregada na página final.');
    });

    customMessageInput.addEventListener('input', () => {
        customMessage = customMessageInput.value;
        saveState();
    });

    emojiInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Limita o input a apenas 1 emoji
            if (e.data && e.data.length > 1) { // Se colar algo com mais de 1 caractere
                input.value = e.data.charAt(0);
            } else if (e.data && !/\p{Extended_Pictographic}/u.test(e.data)) { // Se não for um emoji
                 input.value = ''; // Limpa o input
            }
            selectedEmojis[index] = input.value;
            saveState();
        });
    });


    // --- Lógica de Carregamento de Fotos ---
    photoUploadInputs.forEach((input, index) => {
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64String = e.target.result;
                    photoBase64s[index] = base64String; // Armazena a imagem como Base64
                    photoPreviews[index].src = base64String;
                    photoPreviews[index].style.opacity = 1;
                    uploadTexts[index].style.display = 'none'; // Esconde o texto "Foto X"
                    removePhotoButtons[index].classList.add('show-button');
                    saveState();
                };
                reader.readAsDataURL(file); // Lê o arquivo como URL de dados (Base64)
            } else {
                 // Se o usuário cancelar a seleção, limpa o slot
                photoBase64s[index] = '';
                photoPreviews[index].src = '';
                photoPreviews[index].style.opacity = 0;
                uploadTexts[index].style.display = 'block';
                removePhotoButtons[index].classList.remove('show-button');
                saveState();
            }
        });
    });

    removePhotoButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique propague para o label/input
            photoBase64s[index] = '';
            photoPreviews[index].src = '';
            photoPreviews[index].style.opacity = 0;
            uploadTexts[index].style.display = 'block';
            removePhotoButtons[index].classList.remove('show-button');
            photoUploadInputs[index].value = null; // Limpa o input file para permitir re-seleção
            saveState();
        });
    });


    // --- Botões de Navegação ---
    nextPage1Button.addEventListener('click', () => {
        showPage(page2);
        saveState();
    });

    generateLinkButton.addEventListener('click', () => {
        generateShareLink();
        showPage(page3);
    });

    backToPage1Button.addEventListener('click', () => {
        showPage(page1);
        saveState();
    });

    backToPage2Button.addEventListener('click', () => {
        showPage(page2);
        saveState();
    });

    // --- Gerar Link Compartilhável ---
    function generateShareLink() {
        const baseUrl = window.location.origin + window.location.pathname; // Pega a URL base do seu site
        const params = new URLSearchParams();

        params.append('date', initialDate.toISOString());
        params.append('color', themeColor.substring(1)); // Remove o #
        if (musicLink) params.append('music', encodeURIComponent(musicLink));
        if (musicName) params.append('musicName', encodeURIComponent(musicName));
        if (customMessage) params.append('message', encodeURIComponent(customMessage));
        
        selectedEmojis.forEach((emoji, index) => {
            if (emoji) params.append(`emoji${index + 1}`, encodeURIComponent(emoji));
        });

        // Adiciona as imagens Base64 aos parâmetros
        photoBase64s.forEach((base64, index) => {
            if (base64) {
                // Base64 pode ser muito longo para URL, considere um limite ou método alternativo para muitas fotos
                // Para 3 fotos pequenas, geralmente é ok.
                params.append(`photo${index + 1}`, encodeURIComponent(base64));
            }
        });

        const shareUrl = `${baseUrl}?${params.toString()}`;
        shareLinkDisplay.value = shareUrl;

        // Limita o tamanho do link para exibição
        if (shareUrl.length > 500) { // Exemplo de limite
            shareLinkDisplay.value = shareUrl.substring(0, 497) + '...';
        } else {
             shareLinkDisplay.value = shareUrl;
        }

        // Preenche os dados na página de visualização
        counterDisplay.style.color = themeColor;
        if (customMessage) {
            viewModeMessage.textContent = decodeURIComponent(customMessage);
            viewModeMessage.classList.remove('hidden');
        } else {
            viewModeMessage.classList.add('hidden');
        }

        if (musicLink) {
            musicInfoDisplay.textContent = musicName ? `Música: ${decodeURIComponent(musicName)}` : 'Música: Link Externo';
            musicInfoDisplay.classList.remove('hidden');
            youtubePlayerDiv.classList.remove('hidden'); // Garante que o player div esteja visível
            loadYoutubeAPI(); // Carrega o player quando o link é gerado
        } else {
            musicInfoDisplay.classList.add('hidden');
            youtubePlayerDiv.classList.add('hidden');
            if (player) { // Destruir player existente se não houver música
                player.destroy();
                player = null;
            }
        }
        
        startSlideshow(); // Inicia o slideshow com as fotos carregadas
        startEmojiRain(); // Inicia a chuva de emojis

        shareLinkSection.classList.remove('hidden');
    }

    copyLinkButton.addEventListener('click', () => {
        shareLinkDisplay.select();
        document.execCommand('copy');
        copyMessage.classList.add('show');
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 2000);
    });

    // --- Lógica de Carregamento de URL (para compartilhar) ---
    function loadFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        const dateParam = urlParams.get('date');
        if (dateParam) {
            initialDate = new Date(dateParam);
        }

        const colorParam = urlParams.get('color');
        if (colorParam) {
            themeColor = `#${colorParam}`;
            document.documentElement.style.setProperty('--main-color', themeColor);
            document.documentElement.style.setProperty('--main-color-dark', tinycolor(themeColor).darken(10).toString());
            document.documentElement.style.setProperty('--main-color-shadow', tinycolor(themeColor).setAlpha(0.4).toString());
            document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(themeColor).setAlpha(0.5).toString());
            document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(themeColor).setAlpha(0.1).toString());
        }

        musicLink = urlParams.get('music') ? decodeURIComponent(urlParams.get('music')) : '';
        musicName = urlParams.get('musicName') ? decodeURIComponent(urlParams.get('musicName')) : '';
        customMessage = urlParams.get('message') ? decodeURIComponent(urlParams.get('message')) : '';

        for (let i = 0; i < 3; i++) {
            const emojiParam = urlParams.get(`emoji${i + 1}`);
            if (emojiParam) {
                selectedEmojis[i] = decodeURIComponent(emojiParam);
            }
        }

        // Carrega as imagens Base64 dos parâmetros da URL
        for (let i = 0; i < 3; i++) {
            const photoParam = urlParams.get(`photo${i + 1}`);
            if (photoParam) {
                photoBase64s[i] = decodeURIComponent(photoParam);
            }
        }

        // Se houver qualquer parâmetro na URL, significa que é um link compartilhado
        if (urlParams.toString().length > 0) {
            showPage(page3); // Vai direto para a página de visualização
            updateCounter();
            counterDisplay.style.color = themeColor; // Aplica a cor do tema ao contador

            if (customMessage) {
                viewModeMessage.textContent = customMessage;
                viewModeMessage.classList.remove('hidden');
            } else {
                viewModeMessage.classList.add('hidden');
            }

            if (musicLink) {
                musicInfoDisplay.textContent = musicName ? `Música: ${musicName}` : 'Música: Link Externo';
                musicInfoDisplay.classList.remove('hidden');
                youtubePlayerDiv.classList.remove('hidden');
                loadYoutubeAPI(); // Carrega o player quando a página é acessada via link
            } else {
                musicInfoDisplay.classList.add('hidden');
                youtubePlayerDiv.classList.add('hidden');
            }
            
            startSlideshow(); // Inicia o slideshow
            startEmojiRain(); // Inicia a chuva de emojis

            shareLinkSection.classList.add('hidden'); // Esconde a seção de compartilhamento
            backToPage2Button.classList.add('hidden'); // Esconde o botão de voltar para edição
            page3.classList.add('hide-edit-options'); // Adiciona classe para esconder opções de edição
        } else {
            // Se não há parâmetros na URL, é a primeira vez ou está em edição
            loadState(); // Carrega o estado salvo do localStorage
            updateCounter();
        }
    }

    // --- Inicialização ---
    loadFromUrlParams(); // Tenta carregar do URL primeiro
    // Se não houver URL params, loadState() já terá sido chamado
    setInterval(updateCounter, 1000); // Atualiza o contador a cada segundo
});

// Inclua a biblioteca tinycolor.js (pode ser colocada no topo do script ou em um arquivo separado)
// Se você não tiver, adicione esta linha antes do seu script no HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.6.0/tinycolor.min.js"></script>
