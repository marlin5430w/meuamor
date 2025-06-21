// Variáveis Globais (Mantenha no topo do seu script.js)
const pages = document.querySelectorAll('.page');
let currentPage = 0; // Começa na primeira página (Configuração)

// Dados para gerar o link
let initialDate = null; // Alterado para null, será um objeto Date
let themeColor = '#FF00FF'; // Cor padrão
let musicLink = '';
let musicName = '';
let message = '';
let emojis = ['', '', '']; // Array para armazenar os 3 emojis
const photoFiles = []; // Array para armazenar os arquivos de imagem
const uploadedPhotoUrls = []; // Array para armazenar as URLs das imagens base64

// Referências aos elementos - ADICIONANDO VERIFICAÇÕES AQUI TAMBÉM
// Se um elemento não for encontrado, a variável será null
const initialDateInput = document.getElementById('initialDate');
const defineDateButton = document.getElementById('defineDateButton');
const themeColorInput = document.getElementById('themeColor');
const musicLinkInput = document.getElementById('musicLink');
const musicNameInput = document.getElementById('musicName');
const loadMusicButton = document.getElementById('loadMusicButton');
const messageInput = document.getElementById('messageInput');
const generateLinkButton = document.getElementById('generateLinkButton');
const shareLinkTextarea = document.getElementById('shareLinkTextarea');
const copyLinkButton = document.getElementById('copyLinkButton');
const copyMessage = document.getElementById('copyMessage');

// O elemento problemático
const nextButtonPage2 = document.getElementById('nextButtonPage2'); 
const prevButtonPage2 = document.getElementById('prevButtonPage2'); 
const prevButtonPage3 = document.getElementById('prevButtonPage3'); 

const emojiInputs = [ // Seleciona todos os inputs de emoji
    document.getElementById('emoji1'),
    document.getElementById('emoji2'),
    document.getElementById('emoji3')
];

const photoUploaders = [ // Seleciona os containers de upload de foto
    document.getElementById('photoUploader1'),
    document.getElementById('photoUploader2'),
    document.getElementById('photoUploader3')
];

// Elementos da página de visualização (Page 3)
const counterDisplay = document.getElementById('counterDisplay');
const viewModeMessage = document.getElementById('viewModeMessage');
const slideshowPhotos = [
    document.getElementById('slideshowPhoto1'),
    document.getElementById('slideshowPhoto2'),
    document.getElementById('slideshowPhoto3')
];
const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
const musicInfoDisplay = document.getElementById('musicInfoDisplay');
let player; // Variável para o player do YouTube

// Função para exibir uma página
function showPage(pageIndex) {
    if (pages[currentPage]) { // Verifica se a página atual existe
        pages[currentPage].classList.remove('active');
        pages[currentPage].classList.add('hidden');
    }
    
    currentPage = pageIndex;
    
    if (pages[currentPage]) { // Verifica se a nova página existe
        pages[currentPage].classList.remove('hidden');
        pages[currentPage].classList.add('active');
        pages[currentPage].scrollTop = 0;
    }

    if (currentPage === 2) {
        updateViewMode();
        // startSlideshow() é chamado dentro de updateViewMode agora, se houver fotos.
        // startEmojiRain() é chamado dentro de updateViewMode agora, se houver emojis.
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('date')) {
            document.querySelector('.view-mode-page').classList.add('hide-edit-options');
        } else {
            document.querySelector('.view-mode-page').classList.remove('hide-edit-options');
        }
    } else {
        stopSlideshow();
        stopEmojiRain();
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
if (defineDateButton) { // Verifica se o botão existe antes de adicionar listener
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


if (themeColorInput) { // Verifica se o input existe
    themeColorInput.addEventListener('input', (event) => {
        themeColor = event.target.value;
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    });
}

if (loadMusicButton) { // Verifica se o botão existe
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

if (messageInput) { // Verifica se o input existe
    messageInput.addEventListener('input', (event) => {
        message = event.target.value;
        checkPage1Readiness();
    });
}


// Habilitar/desabilitar botão "Próximo" da Página 1
function checkPage1Readiness() {
    // A data deve ser um objeto Date válido E a mensagem não pode estar vazia
    const isDateSet = initialDate instanceof Date && !isNaN(initialDate.getTime());
    const isMessageSet = messageInput && messageInput.value.trim() !== ''; // Verifica se messageInput existe antes de acessar value
    const isMusicLinkValid = musicLinkInput && (musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value.trim())); // Verifica se musicLinkInput existe

    // APENAS tente modificar nextButtonPage2 se ele NÃO for null
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
        console.warn("Elemento 'nextButtonPage2' não encontrado no DOM. Verifique o ID no HTML.");
    }
}

// Chamar a checagem ao carregar a página e em cada input relevante
document.addEventListener('DOMContentLoaded', () => {
    checkPage1Readiness(); // Verifica o estado inicial do botão "Próximo"
    checkPage2Readiness(); // Verifica o estado inicial do botão "Gerar Link"
});

// Adicionando verificações de existência antes de adicionar event listeners
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

// Função para validar URL do YouTube
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
    return youtubeRegex.test(url);
}

// --- Funções da Página 2 (Emojis e Fotos) ---

// Event Listeners para os inputs de emoji
emojiInputs.forEach((input, index) => {
    if (input) { // Verifica se o input de emoji existe
        input.addEventListener('input', (event) => {
            emojis[index] = event.target.value.trim().substring(0, 1);
            event.target.value = emojis[index];
            checkPage2Readiness();
        });
    }
});

// Adiciona event listeners para os photoUploaders
photoUploaders.forEach((uploader, index) => {
    if (uploader) { // Verifica se o uploader existe
        const fileInput = uploader.querySelector('.hidden-file-input');
        const uploadedImage = uploader.querySelector('img');
        const uploadText = uploader.querySelector('.upload-text');
        const removeButton = uploader.querySelector('.remove-photo-button');

        uploader.addEventListener('click', () => {
            if (fileInput) { fileInput.click(); } // Clica apenas se o input de arquivo existir
        });

        if (removeButton) { // Verifica se o botão de remover existe
            removeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                if (uploadedImage) { uploadedImage.src = ''; uploadedImage.style.opacity = 0; }
                if (uploadText) { uploadText.style.display = 'block'; }
                removeButton.classList.remove('show-button');
                photoFiles[index] = null;
                uploadedPhotoUrls[index] = null;
                checkPage2Readiness();
            });
        }

        if (fileInput) { // Verifica se o input de arquivo existe
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const maxSize = 2 * 1024 * 1024; // 2MB
                    if (file.size > maxSize) {
                        alert('A imagem é muito grande! Por favor, selecione uma imagem menor (máximo 2MB).');
                        event.target.value = ''; 
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
                        uploadedPhotoUrls[index] = e.target.result;
                        checkPage2Readiness();
                    };
                    reader.readAsDataURL(file);
                } else {
                    if (uploadedImage) { uploadedImage.src = ''; uploadedImage.style.opacity = 0; }
                    if (uploadText) { uploadText.style.display = 'block'; }
                    if (removeButton) { removeButton.classList.remove('show-button'); }
                    photoFiles[index] = null;
                    uploadedPhotoUrls[index] = null;
                    checkPage2Readiness();
                }
            });
        }
    }
});

// Função para verificar se a Página 2 está pronta para gerar o link
function checkPage2Readiness() {
    const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
    const hasPhotos = uploadedPhotoUrls.some(url => url !== null && url !== '');

    // APENAS tente modificar generateLinkButton se ele NÃO for null
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
if (generateLinkButton) { // Verifica se o botão existe antes de adicionar listener
    generateLinkButton.addEventListener('click', () => {
        if (!initialDate || isNaN(initialDate.getTime())) {
            alert('Por favor, defina a data inicial na primeira página.');
            return;
        }
        if (!message.trim()) {
            alert('Por favor, escreva a mensagem especial na primeira página.');
            return;
        }
        if (!emojis.some(emoji => emoji.trim() !== '')) {
            alert('Por favor, escolha pelo menos um emoji.');
            return;
        }
        if (!uploadedPhotoUrls.some(url => url !== null && url !== '')) {
            alert('Por favor, carregue pelo menos uma foto.');
            return;
        }

        const encodedDate = initialDate.toISOString();
        const encodedColor = themeColor.replace('#', '');
        const encodedMusicLink = musicLink ? encodeURIComponent(musicLink) : '';
        const encodedMusicName = musicName ? encodeURIComponent(musicName) : '';
        const encodedMessage = encodeURIComponent(message);
        const encodedEmojis = encodeURIComponent(emojis.filter(e => e.trim() !== '').join('')); 
        const encodedPhotos = encodeURIComponent(uploadedPhotoUrls.filter(url => url !== null && url !== '').join('|')); 

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

        showPage(2);
    });
}

if (copyLinkButton) { // Verifica se o botão existe
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
        if (counterDisplay) { // Verifica se o elemento existe
            updateCounter(displayDate);
            // Garante que o intervalo só é criado uma vez
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

    if (viewModeMessage) { // Verifica se o elemento existe
        const displayMessage = messageParam ? decodeURIComponent(messageParam) : message;
        viewModeMessage.textContent = displayMessage;
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

    slideshowPhotos.forEach((img, index) => {
        if (img) { // Verifica se o elemento img existe
            if (displayPhotos[index]) {
                img.src = displayPhotos[index];
                img.alt = `Foto ${index + 1}`;
                if (index === 0) {
                    img.classList.add('active');
                }
            } else {
                img.src = '';
                img.classList.remove('active');
            }
        }
    });
    if (displayPhotos.length > 0) {
        startSlideshow();
    } else {
        stopSlideshow();
    }

    const displayMusicLink = musicParam ? decodeURIComponent(musicParam) : musicLink;
    const displayMusicName = musicNameParam ? decodeURIComponent(musicNameParam) : musicName;

    if (musicPlayerDisplay) { // Verifica se o player container existe
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
    if (!counterDisplay) return; // Sai da função se o display não existe

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
    const activePhotos = slideshowPhotos.filter(img => img && img.src !== ''); 

    if (activePhotos.length > 0) {
        currentSlideIndex = 0;
        activePhotos.forEach(img => img.classList.remove('active'));
        activePhotos[currentSlideIndex].classList.add('active');

        if (activePhotos.length > 1) {
            slideshowInterval = setInterval(() => {
                activePhotos[currentSlideIndex].classList.remove('active');
                currentSlideIndex = (currentSlideIndex + 1) % activePhotos.length;
                activePhotos[currentSlideIndex].classList.add('active');
            }, 5000);
        }
    }
}

function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    slideshowPhotos.forEach(img => { if (img) img.classList.remove('active'); });
}

// YouTube Player API (Manter igual)
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
        tag.src = "https://www.youtube.com/iframe_api";
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

// Chuva de Emojis (Manter igual)
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

// Função para escurecer uma cor hexadecimal (Manter igual)
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
    showPage(0);
    checkPage1Readiness();
    checkPage2Readiness();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
        showPage(2); 
    }
});

// Event Listeners para botões de navegação
// ADICIONANDO VERIFICAÇÕES DE EXISTÊNCIA AQUI TAMBÉM
if (document.getElementById('nextButtonPage2')) {
    document.getElementById('nextButtonPage2').addEventListener('click', () => showPage(1));
}
if (prevButtonPage2) { // Variável global já existe
    prevButtonPage2.addEventListener('click', () => showPage(0));
}
if (prevButtonPage3) { // Variável global já existe
    prevButtonPage3.addEventListener('click', () => showPage(1));
}
