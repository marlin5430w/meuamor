// Variáveis Globais
const pages = document.querySelectorAll('.page');
let currentPage = 0;

let initialDate = null; // Inicie como null para indicar que a data ainda não foi definida
let themeColor = '#FF00FF';
let musicLink = '';
let musicName = '';
let message = '';
let emojis = ['', '', ''];
const photoFiles = [];
const uploadedPhotoUrls = [];

// Referências aos elementos HTML (verifique esses IDs no seu index.html!)
const initialDateInput = document.getElementById('initialDate');
const defineDateButton = document.getElementById('defineDateButton'); // Botão "Definir Data"
const themeColorInput = document.getElementById('themeColor');
const musicLinkInput = document.getElementById('musicLink');
const musicNameInput = document.getElementById('musicName');
const loadMusicButton = document.getElementById('loadMusicButton'); // Botão "Carregar Música"
const messageInput = document.getElementById('messageInput');
const generateLinkButton = document.getElementById('generateLinkButton'); // Botão "Gerar Link Compartilhável"
const shareLinkTextarea = document.getElementById('shareLinkTextarea');
const copyLinkButton = document.getElementById('copyLinkButton');
const copyMessage = document.getElementById('copyMessage');

// Botões de Navegação
const nextButtonPage1 = document.getElementById('nextButtonPage2'); // ID no HTML para o botão PRÓXIMO na Página 1
const prevButtonPage2 = document.getElementById('prevButtonPage2');
const prevButtonPage3 = document.getElementById('prevButtonPage3');

const emojiInputs = [
    document.getElementById('emoji1'),
    document.getElementById('emoji2'),
    document.getElementById('emoji3')
];

const photoUploaders = [
    document.getElementById('photoUploader1'),
    document.getElementById('photoUploader2'),
    document.getElementById('photoUploader3')
];

const counterDisplay = document.getElementById('counterDisplay');
const viewModeMessage = document.getElementById('viewModeMessage');
const slideshowPhotos = [
    document.getElementById('slideshowPhoto1'),
    document.getElementById('slideshowPhoto2'),
    document.getElementById('slideshowPhoto3')
];
const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
const musicInfoDisplay = document.getElementById('musicInfoDisplay');
let player;

// Função para exibir uma página
function showPage(pageIndex) {
    console.log(`[showPage] Tentando ir para a página: ${pageIndex}`);
    if (pages[currentPage]) {
        pages[currentPage].classList.remove('active');
        pages[currentPage].classList.add('hidden');
    }

    currentPage = pageIndex;

    if (pages[currentPage]) {
        pages[currentPage].classList.remove('hidden');
        pages[currentPage].classList.add('active');
        pages[currentPage].scrollTop = 0;

        if (currentPage === 2) {
            updateViewMode();
            startSlideshow();
            startEmojiRain();
            const urlParams = new URLSearchParams(window.location.search);
            const viewModePage = document.querySelector('.view-mode-page');
            if (viewModePage) {
                if (urlParams.has('date')) {
                    viewModePage.classList.add('hide-edit-options');
                } else {
                    viewModePage.classList.remove('hide-edit-options');
                }
            }
        } else {
            stopSlideshow();
            stopEmojiRain();
        }
    } else {
        console.error(`[showPage] Erro: Página com índice ${pageIndex} não encontrada.`);
    }
}

// --- Funções da Página 1 (Configuração) ---

// Event Listener para o input de data
if (initialDateInput) {
    initialDateInput.addEventListener('change', () => {
        console.log("[initialDateInput] Valor alterado:", initialDateInput.value);
        if (initialDateInput.value) {
            // Tenta criar um objeto Date
            const tempDate = new Date(initialDateInput.value);
            // Verifica se a data é válida (não é 'Invalid Date')
            if (!isNaN(tempDate.getTime())) {
                initialDate = tempDate;
                console.log("[initialDateInput] Data inicial definida:", initialDate);
            } else {
                initialDate = null; // Define como nulo se for inválida
                console.log("[initialDateInput] Data inválida detectada.");
            }
        } else {
            initialDate = null; // Se o campo for limpo
            console.log("[initialDateInput] Campo de data vazio, initialDate = null.");
        }
        checkPage1Readiness(); // Sempre verifica a prontidão ao mudar o input
    });
} else {
    console.error("ERRO: Elemento 'initialDateInput' não encontrado.");
}

// Event Listener para o botão "Definir Data"
if (defineDateButton) {
    defineDateButton.addEventListener('click', () => {
        console.log("[defineDateButton] Botão clicado.");
        // A lógica de definir a data já acontece no 'change' do input.
        // Este botão serve mais como uma confirmação visual ou um trigger manual.
        // Podemos adicionar um alerta aqui se a data ainda não estiver válida.
        if (initialDate instanceof Date && !isNaN(initialDate.getTime())) {
            alert('Data definida com sucesso!');
        } else {
            alert('Por favor, selecione uma data inicial válida no campo acima.');
        }
        checkPage1Readiness(); // Revalida o botão "Próximo"
    });
} else {
    console.error("ERRO: Elemento 'defineDateButton' não encontrado.");
}

// Event Listener para o input de cor do tema
if (themeColorInput) {
    themeColorInput.addEventListener('input', (event) => {
        themeColor = event.target.value;
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
        checkPage1Readiness();
    });
} else {
    console.error("ERRO: Elemento 'themeColorInput' não encontrado.");
}

// Event Listener para o botão "Carregar Música"
if (loadMusicButton) {
    loadMusicButton.addEventListener('click', () => {
        console.log("[loadMusicButton] Botão clicado.");
        const link = musicLinkInput.value.trim();
        if (link) {
            if (isValidYouTubeUrl(link)) {
                musicLink = link;
                musicName = musicNameInput.value.trim() || 'Música Carregada';
                console.log('Música carregada:', musicName, musicLink);
                alert('Música carregada com sucesso! Ela tocará na visualização final.');
            } else {
                alert('Por favor, insira um link válido do YouTube. Ex: https://www.youtube.com/watch?v=VIDEO_ID');
                musicLink = '';
                musicName = '';
            }
        } else {
            musicLink = '';
            musicName = '';
            alert('Link da música removido. A visualização não terá música.');
        }
        checkPage1Readiness();
    });
} else {
    console.error("ERRO: Elemento 'loadMusicButton' não encontrado.");
}

// Event Listeners para inputs de música (também disparam checkPage1Readiness)
if (musicLinkInput) {
    musicLinkInput.addEventListener('input', checkPage1Readiness);
} else {
    console.error("ERRO: Elemento 'musicLinkInput' não encontrado.");
}
if (musicNameInput) {
    musicNameInput.addEventListener('input', checkPage1Readiness);
} else {
    console.error("ERRO: Elemento 'musicNameInput' não encontrado.");
}

// Event Listener para o input de mensagem
if (messageInput) {
    messageInput.addEventListener('input', (event) => {
        message = event.target.value.trim();
        checkPage1Readiness();
    });
} else {
    console.error("ERRO: Elemento 'messageInput' não encontrado.");
}

// Função para Habilitar/Desabilitar o botão "Próximo" da Página 1
function checkPage1Readiness() {
    console.log("--- Executando checkPage1Readiness ---");
    const isDateSetAndValid = initialDate instanceof Date && !isNaN(initialDate.getTime());
    const isMessageFilled = messageInput.value.trim().length > 0; // Verifica se tem algum texto
    const isMusicLinkValidOptionally = musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value);

    console.log(`Condições para 'Próximo':
    - Data Válida: ${isDateSetAndValid} (initialDate: ${initialDate})
    - Mensagem Preenchida: ${isMessageFilled} (messageInput.value: '${messageInput.value.trim()}')
    - Link Música (Opcional, se preenchido, válido): ${isMusicLinkValidOptionally} (musicLinkInput.value: '${musicLinkInput.value.trim()}')`);

    if (nextButtonPage1) {
        if (isDateSetAndValid && isMessageFilled && isMusicLinkValidOptionally) {
            nextButtonPage1.disabled = false;
            nextButtonPage1.classList.remove('secondary-button');
            nextButtonPage1.classList.add('main-button');
            console.log("Botão 'Próximo: Emojis e Fotos' HABILITADO.");
        } else {
            nextButtonPage1.disabled = true;
            nextButtonPage1.classList.add('secondary-button');
            nextButtonPage1.classList.remove('main-button');
            console.log("Botão 'Próximo: Emojis e Fotos' DESABILITADO.");
        }
    } else {
        console.error("ERRO: Elemento 'nextButtonPage1' (Botão Próximo da Página 1) não encontrado.");
    }
}

// Função para validar URL do YouTube
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
    return youtubeRegex.test(url);
}


// --- Funções da Página 2 (Emojis e Fotos) ---
emojiInputs.forEach((input, index) => {
    if (input) {
        input.addEventListener('input', (event) => {
            emojis[index] = event.target.value.trim().substring(0, 1);
            event.target.value = emojis[index];
            checkPage2Readiness();
        });
    }
});

photoUploaders.forEach((uploader, index) => {
    if (uploader) {
        const fileInput = uploader.querySelector('.hidden-file-input');
        const uploadedImage = uploader.querySelector('img');
        const uploadText = uploader.querySelector('.upload-text');
        const removeButton = uploader.querySelector('.remove-photo-button');

        uploader.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });

        if (removeButton) {
            removeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                if (uploadedImage) uploadedImage.src = '';
                if (uploadedImage) uploadedImage.style.opacity = 0;
                if (uploadText) uploadText.style.display = 'block';
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
                    photoFiles[index] = file;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (uploadedImage) {
                            uploadedImage.src = e.target.result;
                            uploadedImage.style.opacity = 1;
                        }
                        if (uploadText) uploadText.style.display = 'none';
                        if (removeButton) removeButton.classList.add('show-button');
                        uploadedPhotoUrls[index] = e.target.result;
                        checkPage2Readiness();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
});

// Função para verificar se a Página 2 está pronta para gerar o link
function checkPage2Readiness() {
    console.log("--- Executando checkPage2Readiness ---");
    const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
    const hasPhotos = uploadedPhotoUrls.some(url => url !== null && url !== '');

    console.log(`Condições para 'Gerar Link':
    - Tem Emojis: ${hasEmojis} (emojis: ${emojis})
    - Tem Fotos: ${hasPhotos} (uploadedPhotoUrls: ${uploadedPhotoUrls.filter(url => url !== null && url !== '').length > 0 ? 'sim' : 'não'} fotos)`);

    if (generateLinkButton) {
        if (hasEmojis && hasPhotos) {
            generateLinkButton.disabled = false;
            generateLinkButton.classList.remove('secondary-button');
            generateLinkButton.classList.add('main-button');
            console.log("Botão 'Gerar Link Compartilhável' HABILITADO.");
        } else {
            generateLinkButton.disabled = true;
            generateLinkButton.classList.add('secondary-button');
            generateLinkButton.classList.remove('main-button');
            console.log("Botão 'Gerar Link Compartilhável' DESABILITADO.");
        }
    } else {
        console.error("ERRO: Elemento 'generateLinkButton' não encontrado.");
    }
}

// Event Listener para o botão "Gerar Link Compartilhável"
if (generateLinkButton) {
    generateLinkButton.addEventListener('click', () => {
        console.log("[generateLinkButton] Botão clicado.");

        // Validações finais antes de gerar o link
        const isDateValid = initialDate instanceof Date && !isNaN(initialDate.getTime());
        const isMessageFilled = message.trim() !== '';
        const isMusicLinkValidOptionally = musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value);
        const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
        const hasPhotos = uploadedPhotoUrls.some(url => url !== null && url !== '');

        if (!isDateValid) {
            alert('Por favor, selecione uma data inicial válida na primeira página.');
            showPage(0); return;
        }
        if (!isMessageFilled) {
            alert('Por favor, preencha a mensagem especial na primeira página.');
            showPage(0); return;
        }
        if (!isMusicLinkValidOptionally) {
            alert('Por favor, insira um link de música válido do YouTube ou deixe o campo vazio na primeira página.');
            showPage(0); return;
        }
        if (!hasEmojis) {
            alert('Por favor, escolha pelo menos um emoji na página de Emojis e Fotos.');
            showPage(1); return; // Volta para a página de emojis
        }
        if (!hasPhotos) {
            alert('Por favor, carregue pelo menos uma foto na página de Emojis e Fotos.');
            showPage(1); return; // Volta para a página de fotos
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

        if (encodedMusicLink) shareableLink += `&music=${encodedMusicLink}`;
        if (encodedMusicName) shareableLink += `&musicName=${encodedMusicName}`;
        if (encodedPhotos) shareableLink += `&photos=${encodedPhotos}`;

        if (shareLinkTextarea && copyLinkButton && copyMessage) {
            shareLinkTextarea.value = shareableLink;
            shareLinkTextarea.style.display = 'block';
            copyLinkButton.style.display = 'block';
            copyMessage.style.opacity = 0;
        }

        showPage(2);
    });
} else {
    console.error("ERRO: Elemento 'generateLinkButton' não encontrado.");
}

if (copyLinkButton) {
    copyLinkButton.addEventListener('click', () => {
        if (shareLinkTextarea) {
            shareLinkTextarea.select();
            document.execCommand('copy');
            if (copyMessage) {
                copyMessage.classList.add('show');
                setTimeout(() => { copyMessage.classList.remove('show'); }, 2000);
            }
        }
    });
}


// --- Funções da Página 3 (Visualização) ---
let slideshowInterval;
let currentSlideIndex = 0;
let emojiRainInterval;
const defaultEmojis = ['❤️', '✨', '😊'];

function updateViewMode() {
    const urlParams = new URLSearchParams(window.location.search);
    let displayDate = initialDate;
    if (urlParams.has('date')) displayDate = new Date(urlParams.get('date'));
    if (displayDate instanceof Date && !isNaN(displayDate.getTime())) {
        updateCounter(displayDate);
        if (window._counterInterval) clearInterval(window._counterInterval);
        window._counterInterval = setInterval(() => updateCounter(displayDate), 1000);
    } else { if(counterDisplay) counterDisplay.textContent = 'Data não definida.'; }

    if (urlParams.has('color')) themeColor = '#' + urlParams.get('color');
    document.documentElement.style.setProperty('--main-color', themeColor);
    document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
    document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
    document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
    document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');

    const displayMessage = urlParams.has('message') ? decodeURIComponent(urlParams.get('message')) : message;
    if (viewModeMessage) viewModeMessage.textContent = displayMessage;

    const displayEmojis = urlParams.has('emojis') ? decodeURIComponent(urlParams.get('emojis')).split('') : emojis.filter(e => e.trim() !== '');
    if (displayEmojis.length > 0) startEmojiRain(displayEmojis); else stopEmojiRain();

    let displayPhotos = uploadedPhotoUrls.filter(url => url !== null && url !== '');
    if (urlParams.has('photos')) displayPhotos = decodeURIComponent(urlParams.get('photos')).split('|').filter(url => url !== '');
    slideshowPhotos.forEach(img => { img.src = ''; img.classList.remove('active'); });
    if (displayPhotos.length > 0) {
        slideshowPhotos.forEach((img, index) => { if (displayPhotos[index]) { img.src = displayPhotos[index]; img.alt = `Foto ${index + 1}`; }});
        startSlideshow();
    } else { stopSlideshow(); }

    const displayMusicLink = urlParams.has('music') ? decodeURIComponent(urlParams.get('music')) : musicLink;
    const displayMusicName = urlParams.has('musicName') ? decodeURIComponent(urlParams.get('musicName')) : musicName;

    if (musicPlayerDisplay && musicInfoDisplay) {
        if (displayMusicLink && isValidYouTubeUrl(displayMusicLink)) {
            musicPlayerDisplay.style.display = 'flex';
            musicInfoDisplay.textContent = displayMusicName || 'Música Carregada';
            loadYouTubePlayer(displayMusicLink);
        } else {
            musicPlayerDisplay.style.display = 'none';
            if (player) { player.destroy(); player = null; }
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
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);
    const parts = [];
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
    const remainingDaysAfterYears = days - (years * 365.25);
    if (Math.floor(remainingDaysAfterYears / 30.44) > 0) parts.push(`${Math.floor(remainingDaysAfterYears / 30.44)} mês${Math.floor(remainingDaysAfterYears / 30.44) > 1 ? 'es' : ''}`);
    const remainingDaysAfterMonths = days % 30.44;
    if (Math.floor(remainingDaysAfterMonths) > 0 || (years === 0 && months === 0 && days === 0 && hours === 0 && minutes === 0 && seconds === 0)) parts.push(`${Math.floor(remainingDaysAfterMonths)} dia${(Math.floor(remainingDaysAfterMonths) !== 1) ? 's' : ''}`);
    parts.push(`${hours % 24} hora${(hours % 24) !== 1 ? 's' : ''}`);
    parts.push(`${minutes % 60} minuto${(minutes % 60) !== 1 ? 's' : ''}`);
    parts.push(`${seconds % 60} segundo${(seconds % 60) !== 1 ? 's' : ''}`);
    let counterText = '';
    if (parts.length > 1) { const lastPart = parts.pop(); counterText = `${parts.join(', ')} e ${lastPart}`; } else if (parts.length === 1) { counterText = parts[0]; } else { counterText = 'Calculando...'; }
    counterDisplay.textContent = `Estamos juntos há:\n${counterText}`;
}

function startSlideshow() {
    stopSlideshow();
    const activePhotos = slideshowPhotos.filter(img => img.src !== '');
    if (activePhotos.length > 0) {
        currentSlideIndex = 0;
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
    if (slideshowInterval) { clearInterval(slideshowInterval); slideshowInterval = null; }
    slideshowPhotos.forEach(img => img.classList.remove('active'));
}

// YouTube Player API
function loadYouTubePlayer(videoUrl) {
    if (player) player.destroy();
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) { console.error("URL do YouTube inválida:", videoUrl); return; }
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        window.onYouTubeIframeAPIReady = () => { createPlayer(videoId); };
        const tag = document.createElement('script');
        tag.src = "http://www.youtube.com/iframe_api"; // URL oficial da API do YouTube
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else { createPlayer(videoId); }
}

function createPlayer(videoId) {
    player = new YT.Player('player', {
        height: '100', width: '100%', videoId: videoId,
        playerVars: { 'playsinline': 1, 'autoplay': 1, 'loop': 1, 'controls': 1, 'disablekb': 1, 'modestbranding': 1, 'rel': 0, 'playlist': videoId },
        events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
    });
}
function onPlayerReady(event) { event.target.playVideo(); event.target.setVolume(50); }
function onPlayerStateChange(event) { if (event.data === YT.PlayerState.ENDED) player.playVideo(); }
function getYouTubeVideoId(url) {
    let videoId = '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/ ]{11})/i;
    const match = url.match(regex);
    if (match && match[1]) videoId = match[1];
    return videoId;
}

// Chuva de Emojis
const emojiRainContainer = document.getElementById('emojiRainContainer');
function startEmojiRain(emojisToUse = defaultEmojis) {
    stopEmojiRain();
    if (!emojiRainContainer) { console.warn("Elemento 'emojiRainContainer' não encontrado."); return; }
    emojiRainContainer.style.display = 'block';
    emojiRainInterval = setInterval(() => {
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
        emoji.addEventListener('animationend', () => { emoji.remove(); });
    }, 300);
}
function stopEmojiRain() {
    if (emojiRainInterval) { clearInterval(emojiRainInterval); emojiRainInterval = null; }
    if (emojiRainContainer) { emojiRainContainer.innerHTML = ''; emojiRainContainer.style.display = 'none'; }
}

function darkenColor(hex, percent) {
    let f = parseInt(hex.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent,
        R = f >> 16, G = (f >> 8) & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}


// Inicialização Principal
document.addEventListener('DOMContentLoaded', () => {
    console.log("=============== DOMContentLoaded: Script Iniciado ===============");

    // Ocultar todas as páginas exceto a primeira
    pages.forEach((page, index) => {
        if (index !== 0) {
            page.classList.add('hidden');
        }
    });
    showPage(0); // Exibir a primeira página

    // Anexar Event Listeners aos botões de navegação
    if (nextButtonPage1) {
        nextButtonPage1.addEventListener('click', () => {
            console.log("[Navegação] Botão 'Próximo' da Página 1 clicado.");
            showPage(1);
        });
    } else {
        console.error("ERRO: Elemento 'nextButtonPage1' (ID 'nextButtonPage2' no HTML) não encontrado para navegação.");
    }

    if (prevButtonPage2) {
        prevButtonPage2.addEventListener('click', () => {
            console.log("[Navegação] Botão 'Voltar' da Página 2 clicado.");
            showPage(0);
        });
    } else {
        console.error("ERRO: Elemento 'prevButtonPage2' não encontrado para navegação.");
    }

    if (prevButtonPage3) {
        prevButtonPage3.addEventListener('click', () => {
            console.log("[Navegação] Botão 'Voltar' da Página 3 clicado.");
            showPage(1);
        });
    } else {
        console.error("ERRO: Elemento 'prevButtonPage3' não encontrado para navegação.");
    }

    // Inicializa o estado dos botões de prontidão
    checkPage1Readiness();
    checkPage2Readiness();

    // Verifica se a página foi carregada com parâmetros de URL (modo de visualização)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
        console.log("Parâmetros de URL detectados, indo para a página de visualização.");
        showPage(2);
    }
    console.log("=============== DOMContentLoaded: Fim da Inicialização ===============");
});
