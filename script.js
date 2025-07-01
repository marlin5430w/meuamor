// Variáveis Globais
const pages = document.querySelectorAll('.page');
let currentPage = 0; // Começa na primeira página (Configuração)

// Dados para gerar o link
let initialDate = null;
let themeColor = '#FF00FF'; // Cor padrão
let musicLink = '';
let musicName = '';
let message = '';
let emojis = ['', '', '']; // Array para armazenar os emojis
const photoFiles = [null, null, null]; // Array para armazenar os objetos File
const uploadedPhotoUrls = [null, null, null]; // Array para armazenar as URLs Data URL das fotos

// Referências aos elementos
const initialDateInput = document.getElementById('startDate');
const defineDateButton = document.getElementById('setStartDateButton');
const themeColorInput = document.getElementById('themeColor');
const musicLinkInput = document.getElementById('musicLink');
const musicNameInput = document.getElementById('musicName');
const loadMusicButton = document.getElementById('loadMusicButton');
const messageInput = document.getElementById('customMessage');
const generateLinkButton = document.getElementById('generateLinkButton');
const shareLinkTextarea = document.getElementById('shareLinkDisplay');
const copyLinkButton = document.getElementById('copyLinkButton');
const copyMessage = document.getElementById('copyMessage');

const nextButtonPage2 = document.getElementById('nextPage1Button'); // Botão "Próximo" da Page 1
const prevButtonPage2 = document.getElementById('backToPage1Button'); // Botão "Voltar" da Page 2
const prevButtonPage3 = document.getElementById('backToPage2Button'); // Botão "Voltar" da Page 3

// Seleção dos inputs de emoji
const emojiInputs = document.querySelectorAll('.emoji-input'); // Seleciona todos os inputs com a classe 'emoji-input'

// Seleção dos photoUploaders - mais robusto
const photoUploadersElements = document.querySelectorAll('.photo-uploader');


// Elementos da página de visualização (Page 3)
const counterDisplay = document.getElementById('counterDisplay');
const viewModeMessage = document.getElementById('viewModeMessage');
const slideshowContainer = document.getElementById('slideshowContainer'); // O container onde as imagens estarão
const musicPlayerDisplay = document.getElementById('player'); // O div onde o player do YouTube será carregado
const musicInfoDisplay = document.getElementById('musicInfoDisplay');
let player; // Variável para o player do YouTube

// Função para exibir uma página
function showPage(pageIndex) {
    if (pages[currentPage]) {
        pages[currentPage].classList.remove('active');
        pages[currentPage].classList.add('hidden');
    }

    currentPage = pageIndex;

    if (pages[currentPage]) {
        pages[currentPage].classList.remove('hidden');
        pages[currentPage].classList.add('active');
        pages[currentPage].scrollTop = 0; // Volta para o topo da nova página
    }

    // Lógica para a página de visualização (Page 3)
    if (currentPage === 2) {
        updateViewMode();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('date')) {
            document.querySelector('.view-mode-page').classList.add('hide-edit-options');
        } else {
            document.querySelector('.view-mode-page').classList.remove('hide-edit-options');
        }
    } else {
        stopSlideshow();
        stopEmojiRain();
        // Limpa o player do YouTube se sair da página de visualização
        if (player) {
            player.destroy();
            player = null;
        }
    }
}

// Funções de Navegação
function goToNextPage() {
    if (currentPage < pages.length - 1) {
        showPage(currentPage + 1);
    }
}

function goToPrevPage() {
    if (currentPage > 0) {
        showPage(currentPage - 1);
    }
}

// --- Funções da Página 1 (Configuração) ---
if (defineDateButton) {
    defineDateButton.addEventListener('click', () => {
        const dateValue = initialDateInput.value;
        if (dateValue) {
            initialDate = new Date(dateValue);
            if (!isNaN(initialDate.getTime())) {
                alert('Data inicial definida!');
                checkPage1Readiness();
            } else {
                alert('Formato de data inválido. Por favor, selecione uma data válida.');
                initialDate = null;
            }
        } else {
            alert('Por favor, selecione uma data inicial.');
            initialDate = null;
        }
    });
}

if (themeColorInput) {
    themeColorInput.addEventListener('input', (event) => {
        themeColor = event.target.value;
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    });
}

if (loadMusicButton) {
    loadMusicButton.addEventListener('click', () => {
        const link = musicLinkInput.value.trim();
        if (link === '' || isValidYouTubeUrl(link)) {
            musicLink = link;
            musicName = musicNameInput.value.trim() || 'Música Carregada';
            alert('Música carregada! Ela tocará na visualização final.');
            checkPage1Readiness();
        } else {
            alert('Por favor, insira um link válido do YouTube ou deixe o campo vazio.');
            musicLink = '';
        }
    });
}

if (messageInput) {
    messageInput.addEventListener('input', (event) => {
        message = event.target.value;
        checkPage1Readiness();
    });
}

// Habilitar/desabilitar botão "Próximo" da Página 1
function checkPage1Readiness() {
    const isDateSet = initialDate instanceof Date && !isNaN(initialDate.getTime());
    const isMessageSet = messageInput && messageInput.value.trim() !== '';
    const isMusicLinkValid = musicLinkInput && (musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value.trim()));

    if (nextButtonPage2) {
        if (isDateSet && isMessageSet && isMusicLinkValid) {
            nextButtonPage2.disabled = false;
            nextButtonPage2.classList.remove('secondary-button');
            nextButtonPage2.classList.add('main-button');
        } else {
            nextButtonPage2.disabled = true;
            nextButtonPage2.classList.add('secondary-button');
            nextButtonPage2.classList.remove('main-button');
        }
    } else {
        console.warn("Elemento 'nextPage1Button' (Próximo) não encontrado no DOM. Verifique o ID no HTML.");
    }
}

// Chamar a checagem ao carregar a página e em cada input relevante
document.addEventListener('DOMContentLoaded', () => {
    checkPage1Readiness();
    checkPage2Readiness();
});

if (initialDateInput) {
    initialDateInput.addEventListener('change', checkPage1Readiness);
}
if (musicLinkInput) {
    musicLinkInput.addEventListener('input', checkPage1Readiness);
}
if (musicNameInput) {
    musicNameInput.addEventListener('input', checkPage1Readiness);
}
if (messageInput) {
    messageInput.addEventListener('input', checkPage1Readiness);
}

function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
    return youtubeRegex.test(url);
}

// --- Funções da Página 2 (Emojis e Fotos) ---

// Event Listeners para os inputs de emoji
emojiInputs.forEach((input, index) => {
    if (input) {
        input.addEventListener('input', (event) => {
            // Garante que apenas um caractere seja armazenado
            emojis[index] = event.target.value.trim().slice(0, 1);
            event.target.value = emojis[index]; // Atualiza o input para exibir apenas 1 caractere
            checkPage2Readiness();
        });
    } else {
        console.warn(`Emoji input ${index} não encontrado.`);
    }
});

// Adiciona event listeners para os photoUploaders
photoUploadersElements.forEach((uploader, index) => {
    if (uploader) {
        const fileInput = uploader.querySelector('.hidden-file-input');
        const uploadedImage = uploader.querySelector('img');
        const uploadText = uploader.querySelector('.upload-text');
        const removeButton = uploader.querySelector('.remove-photo-button');

        // Adiciona um listener ao uploader div para disparar o clique no input de arquivo
        uploader.addEventListener('click', () => {
            if (fileInput && event.target !== removeButton) { // Impede clique se o botão remover foi clicado
                fileInput.click();
            }
        });

        if (removeButton) {
            removeButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Impede que o clique no botão de remover ative o clique do uploader
                if (uploadedImage) { uploadedImage.src = ''; uploadedImage.style.opacity = 0; }
                if (uploadText) { uploadText.style.display = 'block'; }
                removeButton.classList.remove('show-button');
                photoFiles[index] = null;
                uploadedPhotoUrls[index] = null;
                checkPage2Readiness();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const maxSize = 2 * 1024 * 1024; // 2MB
                    if (file.size > maxSize) {
                        alert('A imagem é muito grande! Por favor, selecione uma imagem menor (máximo 2MB).');
                        event.target.value = ''; // Limpa o input do arquivo
                        // Restaura o estado visual se uma imagem anterior foi carregada
                        if (uploadedPhotoUrls[index]) {
                             if (uploadedImage) { uploadedImage.style.opacity = 1; }
                             if (uploadText) { uploadText.style.display = 'none'; }
                             if (removeButton) { removeButton.classList.add('show-button'); }
                        } else {
                            if (uploadedImage) { uploadedImage.src = ''; uploadedImage.style.opacity = 0; }
                            if (uploadText) { uploadText.style.display = 'block'; }
                            if (removeButton) { removeButton.classList.remove('show-button'); }
                        }
                        return;
                    }

                    photoFiles[index] = file;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (uploadedImage) {
                            uploadedImage.src = e.target.result;
                            uploadedImage.style.opacity = 1;
                        }
                        if (uploadText) { uploadText.style.display = 'none'; }
                        if (removeButton) { removeButton.classList.add('show-button'); }
                        uploadedPhotoUrls[index] = e.target.result; // Armazena a URL da imagem
                        checkPage2Readiness();
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Se nenhum arquivo for selecionado (ex: usuário cancelou), limpa o preview
                    if (uploadedImage) { uploadedImage.src = ''; uploadedImage.style.opacity = 0; }
                    if (uploadText) { uploadText.style.display = 'block'; }
                    if (removeButton) { removeButton.classList.remove('show-button'); }
                    photoFiles[index] = null;
                    uploadedPhotoUrls[index] = null;
                    checkPage2Readiness();
                }
            });
        }
    } else {
        console.warn(`Photo uploader ${index} não encontrado.`);
    }
});

// Função para verificar se a Página 2 está pronta para gerar o link
function checkPage2Readiness() {
    // Verifica se pelo menos um emoji foi inserido E se pelo menos uma foto foi carregada
    const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
    const hasPhotos = uploadedPhotoUrls.some(url => url !== null && url !== '');

    if (generateLinkButton) {
        if (hasEmojis && hasPhotos) {
            generateLinkButton.disabled = false;
            generateLinkButton.classList.remove('secondary-button');
            generateLinkButton.classList.add('main-button');
        } else {
            generateLinkButton.disabled = true;
            generateLinkButton.classList.add('secondary-button');
            generateLinkButton.classList.remove('main-button');
        }
    } else {
        console.warn("Elemento 'generateLinkButton' não encontrado no DOM. Verifique o ID no HTML.");
    }
}


// Evento de clique para o botão Gerar Link Compartilhável
if (generateLinkButton) {
    generateLinkButton.addEventListener('click', () => {
        // Validações adicionais antes de gerar o link
        if (!initialDate || isNaN(initialDate.getTime())) {
            alert('Por favor, defina a data inicial na primeira página.');
            return;
        }
        if (!message.trim()) {
            alert('Por favor, escreva a mensagem especial na primeira página.');
            return;
        }
        // Validações de emoji e foto já são feitas no checkPage2Readiness, mas reconfirmamos aqui
        const finalEmojis = emojis.filter(e => e.trim() !== '');
        if (finalEmojis.length === 0) {
            alert('Por favor, escolha pelo menos um emoji.');
            return;
        }
        const finalPhotos = uploadedPhotoUrls.filter(url => url !== null && url !== '');
        if (finalPhotos.length === 0) {
            alert('Por favor, carregue pelo menos uma foto.');
            return;
        }

        const encodedDate = initialDate.toISOString();
        const encodedColor = themeColor.replace('#', '');
        const encodedMusicLink = musicLink ? encodeURIComponent(musicLink) : '';
        const encodedMusicName = musicName ? encodeURIComponent(musicName) : '';
        const encodedMessage = encodeURIComponent(message);
        // Usa finalEmojis e finalPhotos para garantir que apenas os dados válidos sejam codificados
        const encodedEmojis = encodeURIComponent(finalEmojis.join(''));
        const encodedPhotos = encodeURIComponent(finalPhotos.join('|'));

        const baseUrl = window.location.origin + window.location.pathname;
        let shareableLink = `${baseUrl}?date=${encodedDate}&color=${encodedColor}&message=${encodedMessage}&emojis=${encodedEmojis}`;

        if (encodedMusicLink) {
            shareableLink += `&music=${encodedMusicLink}`;
        }
        if (encodedMusicName) {
            shareableLink += `&musicName=${encodedMusicName}`;
        }
        if (encodedPhotos) {
            shareableLink += `&photos=${encodedPhotos}`;
        }

        if (shareLinkTextarea) { shareLinkTextarea.value = shareableLink; shareLinkTextarea.style.display = 'block'; }
        if (copyLinkButton) { copyLinkButton.style.display = 'block'; }
        if (copyMessage) { copyMessage.style.opacity = 0; }

        showPage(2); // Vai para a página de visualização
    });
}

if (copyLinkButton) {
    copyLinkButton.addEventListener('click', () => {
        if (shareLinkTextarea) {
            shareLinkTextarea.select();
            document.execCommand('copy');
            if (copyMessage) {
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                }, 2000);
            }
        }
    });
}

// --- Funções da Página 3 (Visualização) ---
let slideshowInterval;
let currentSlideIndex = 0;
let emojiRainInterval;

function updateViewMode() {
    const urlParams = new URLSearchParams(window.location.search);

    const dateParam = urlParams.get('date');
    const colorParam = urlParams.get('color');
    const messageParam = urlParams.get('message');
    const emojisParam = urlParams.get('emojis');
    const musicParam = urlParams.get('music');
    const musicNameParam = urlParams.get('musicName');
    const photosParam = urlParams.get('photos');

    let displayDate = initialDate;
    if (dateParam) {
        const parsedDate = new Date(dateParam);
        if (!isNaN(parsedDate.getTime())) {
            displayDate = parsedDate;
        } else {
            console.error("Data da URL inválida, usando data do formulário ou null.");
            displayDate = initialDate;
        }
    }
    if (displayDate instanceof Date && !isNaN(displayDate.getTime())) {
        if (counterDisplay) {
            updateCounter(displayDate);
            if (!window.counterUpdateInterval) {
                window.counterUpdateInterval = setInterval(() => updateCounter(displayDate), 1000);
            }
        }
    } else {
        if (counterDisplay) { counterDisplay.textContent = 'Data não definida.'; }
    }

    if (colorParam) {
        themeColor = '#' + colorParam;
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    } else {
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    }

    if (viewModeMessage) {
        const displayMessage = messageParam ? decodeURIComponent(messageParam) : message;
        viewModeMessage.textContent = displayMessage;
        if (displayMessage.trim() !== '') {
            viewModeMessage.classList.remove('hidden');
        } else {
            viewModeMessage.classList.add('hidden');
        }
    }

    const displayEmojis = emojisParam ? decodeURIComponent(emojisParam).split('') : emojis.filter(e => e.trim() !== '');
    if (displayEmojis.length > 0) {
        startEmojiRain(displayEmojis);
    } else {
        stopEmojiRain();
    }

    let displayPhotos = uploadedPhotoUrls.filter(url => url !== null && url !== '');
    if (photosParam) {
        const decodedPhotos = decodeURIComponent(photosParam).split('|').filter(url => url !== '');
        if (decodedPhotos.length > 0) {
            displayPhotos = decodedPhotos;
        }
    }

    // Limpa o slideshowContainer antes de adicionar novas imagens
    if (slideshowContainer) {
        slideshowContainer.innerHTML = '';
        slideshowContainer.classList.add('hidden'); // Esconde por padrão
    }

    if (displayPhotos.length > 0 && slideshowContainer) {
        displayPhotos.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Foto ${index + 1}`;
            slideshowContainer.appendChild(img);
        });
        slideshowContainer.classList.remove('hidden'); // Mostra o container se houver fotos
        startSlideshow();
    } else {
        stopSlideshow();
    }


    if (musicPlayerDisplay) {
        const displayMusicLink = musicParam ? decodeURIComponent(musicParam) : musicLink;
        const displayMusicName = musicNameParam ? decodeURIComponent(musicNameParam) : musicName;

        if (displayMusicLink && isValidYouTubeUrl(displayMusicLink)) {
            musicPlayerDisplay.style.display = 'flex';
            if (musicInfoDisplay) { musicInfoDisplay.textContent = displayMusicName || 'Música Carregada'; }
            loadYouTubePlayer(displayMusicLink);
        } else {
            musicPlayerDisplay.style.display = 'none';
            if (player) {
                player.destroy();
                player = null;
            }
        }
    }
}

function updateCounter(date) {
    if (!counterDisplay) return;

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    let remainingDays = now.getDate() - date.getDate();

    if (remainingDays < 0) {
        months--;
        remainingDays += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    let remainingHours = hours % 24;
    let remainingMinutes = minutes % 60;
    let remainingSeconds = seconds % 60;

    let counterText = '';
    if (years > 0) {
        counterText += `${years} ano${years > 1 ? 's' : ''}, `;
    }
    if (months > 0) {
        counterText += `${months} mês${months > 1 ? 'es' : ''}, `;
    }

    counterText += `${remainingDays} dia${remainingDays !== 1 ? 's' : ''}, ${remainingHours} hora${remainingHours !== 1 ? 's' : ''}, ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;

    counterDisplay.textContent = `Estamos juntos há:\n${counterText}`;
}

function startSlideshow() {
    stopSlideshow();
    const imagesInSlideshow = slideshowContainer ? Array.from(slideshowContainer.querySelectorAll('img')) : [];

    if (imagesInSlideshow.length > 0) {
        currentSlideIndex = 0;
        imagesInSlideshow.forEach(img => img.classList.remove('active'));
        imagesInSlideshow[currentSlideIndex].classList.add('active');

        if (imagesInSlideshow.length > 1) {
            slideshowInterval = setInterval(() => {
                imagesInSlideshow[currentSlideIndex].classList.remove('active');
                currentSlideIndex = (currentSlideIndex + 1) % imagesInSlideshow.length;
                imagesInSlideshow[currentSlideIndex].classList.add('active');
            }, 5000); // Muda a cada 5 segundos
        }
    }
}

function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    if (slideshowContainer) {
        Array.from(slideshowContainer.querySelectorAll('img')).forEach(img => img.classList.remove('active'));
    }
}

// YouTube Player API
function loadYouTubePlayer(videoUrl) {
    if (player) {
        player.destroy();
    }

    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
        console.error("URL do YouTube inválida:", videoUrl);
        return;
    }

    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        window.onYouTubeIframeAPIReady = () => {
            createPlayer(videoId);
        };
        const tag = document.createElement('script');
        tag.src = "http://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        createPlayer(videoId);
    }
}

function createPlayer(videoId) {
    player = new YT.Player('player', {
        height: '100',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'autoplay': 1,
            'loop': 1,
            'controls': 1,
            'disablekb': 1,
            'modestbranding': 1,
            'rel': 0,
            'playlist': videoId
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
    event.target.setVolume(50);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo();
    }
}

function getYouTubeVideoId(url) {
    let videoId = '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    const match = url.match(regex);
    if (match && match[1]) {
        videoId = match[1];
    }
    return videoId;
}

// Chuva de Emojis
const emojiRainContainer = document.getElementById('emojiRainContainer');
const defaultEmojis = ['❤️', '✨', '😊'];

function startEmojiRain(emojisToUse = defaultEmojis) {
    stopEmojiRain();

    if (emojiRainContainer) {
        emojiRainContainer.style.display = 'block';
    }

    emojiRainInterval = setInterval(() => {
        if (!emojiRainContainer) return;

        const emoji = document.createElement('span');
        emoji.classList.add('falling-emoji');
        emoji.textContent = emojisToUse[Math.floor(Math.random() * emojisToUse.length)];

        const startX = Math.random() * window.innerWidth;
        emoji.style.left = `${startX}px`;

        const duration = Math.random() * 5 + 5;
        emoji.style.animationDuration = `${duration}s`;
        emoji.style.animationDelay = `-${Math.random() * 5}s`;

        const xOffset = (Math.random() - 0.5) * 200;
        emoji.style.setProperty('--fall-x-offset', `${xOffset}px`);

        emojiRainContainer.appendChild(emoji);

        emoji.addEventListener('animationend', () => {
            emoji.remove();
        });
    }, 300);
}

function stopEmojiRain() {
    if (emojiRainInterval) {
        clearInterval(emojiRainInterval);
        emojiRainInterval = null;
    }
    if (emojiRainContainer) {
        emojiRainContainer.innerHTML = '';
        emojiRainContainer.style.display = 'none';
    }
}

// Função para escurecer uma cor hexadecimal
function darkenColor(hex, percent) {
    let f = parseInt(hex.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = (f >> 8) & 0x00FF,
        B = f & 0x0000FF;
    return "#" + (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
    )
        .toString(16)
        .slice(1);
}

// Inicialização: Mostra a primeira página ao carregar
document.addEventListener('DOMContentLoaded', () => {
    pages.forEach((page, index) => {
        if (index !== 0) {
            page.classList.add('hidden');
        }
    });
    showPage(0); // Mostra a primeira página por padrão
    checkPage1Readiness();
    checkPage2Readiness(); // Garante que o botão Gerar Link seja avaliado no carregamento

    // Verifica se há parâmetros na URL para ir direto para a página de visualização
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
        showPage(2);
    }
});

// Event Listeners para botões de navegação
if (nextButtonPage2) {
    nextButtonPage2.addEventListener('click', () => showPage(1));
}
if (prevButtonPage2) {
    prevButtonPage2.addEventListener('click', () => showPage(0));
}
if (prevButtonPage3) {
    prevButtonPage3.addEventListener('click', () => showPage(1));
}
