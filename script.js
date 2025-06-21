// Variáveis Globais (Mantenha no topo do seu script.js)
const pages = document.querySelectorAll('.page');
let currentPage = 0; // Começa na primeira página (Configuração)

// Dados para gerar o link
let initialDate = '';
let themeColor = '#FF00FF'; // Cor padrão
let musicLink = '';
let musicName = '';
let message = '';
let emojis = ['', '', '']; // Array para armazenar os 3 emojis
const photoFiles = []; // Array para armazenar os arquivos de imagem
const uploadedPhotoUrls = []; // Array para armazenar as URLs das imagens base64

// Referências aos elementos - GARANTIR QUE ESSES IDs CORRESPONDAM AO SEU HTML
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

// REFERÊNCIAS DOS BOTÕES DE NAVEGAÇÃO ENTRE PÁGINAS
const nextButtonPage1 = document.getElementById('nextButtonPage2'); // Este é o botão "PRÓXIMO: EMOJIS E FOTOS" que está na Página 1
const prevButtonPage2 = document.getElementById('prevButtonPage2'); // Este é o botão "VOLTAR PARA CONFIGURAÇÕES" que está na Página 2
const prevButtonPage3 = document.getElementById('prevButtonPage3'); // Este é o botão "VOLTAR PARA EMOJIS E FOTOS" que está na Página 3

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
    // Esconde a página atual
    if (pages[currentPage]) { // Verifica se a página existe antes de manipular
        pages[currentPage].classList.remove('active');
        pages[currentPage].classList.add('hidden');
    }

    currentPage = pageIndex;

    // Mostra a nova página
    if (pages[currentPage]) { // Verifica se a página existe antes de manipular
        pages[currentPage].classList.remove('hidden');
        pages[currentPage].classList.add('active');

        // Scroll para o topo da página ao mudar
        pages[currentPage].scrollTop = 0;

        // Lógica específica para a página de visualização
        if (currentPage === 2) {
            updateViewMode();
            startSlideshow();
            startEmojiRain();
            // Esconder opções de edição se acessado via link direto
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('date')) { // Se a URL tiver parâmetros, esconde a seção de edição
                document.querySelector('.view-mode-page').classList.add('hide-edit-options');
            } else {
                document.querySelector('.view-mode-page').classList.remove('hide-edit-options');
            }
        } else {
            stopSlideshow();
            stopEmojiRain();
        }
    }
}

// --- Funções da Página 1 (Configuração) ---
if (defineDateButton) { // Adicionado verificação para garantir que o elemento existe
    defineDateButton.addEventListener('click', () => {
        const dateValue = initialDateInput.value;
        if (dateValue) {
            initialDate = new Date(dateValue);
            console.log('Data inicial definida:', initialDate);
            checkPage1Readiness(); // Revalida o botão "Próximo"
        } else {
            alert('Por favor, selecione uma data inicial.'); // Avisa se a data estiver vazia
        }
    });
}

if (initialDateInput) { // Adicionado verificação para garantir que o elemento existe
    initialDateInput.addEventListener('change', checkPage1Readiness); // 'change' é melhor para datetime-local
}

if (themeColorInput) { // Adicionado verificação
    themeColorInput.addEventListener('input', (event) => {
        themeColor = event.target.value;
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
        checkPage1Readiness();
    });
}

if (loadMusicButton) { // Adicionado verificação
    loadMusicButton.addEventListener('click', () => {
        const link = musicLinkInput.value.trim();
        if (link) {
            if (isValidYouTubeUrl(link)) {
                musicLink = link;
                musicName = musicNameInput.value.trim() || 'Música Carregada';
                console.log('Música carregada:', musicName, musicLink);
            } else {
                alert('Por favor, insira um link válido do YouTube.');
                musicLink = ''; // Limpa o link inválido
                musicName = '';
            }
        } else {
            musicLink = ''; // Permite link vazio
            musicName = '';
        }
        checkPage1Readiness(); // Revalida o botão "Próximo"
    });
}

if (musicLinkInput) { // Adicionado verificação
    musicLinkInput.addEventListener('input', checkPage1Readiness);
}
if (musicNameInput) { // Adicionado verificação
    musicNameInput.addEventListener('input', checkPage1Readiness);
}

if (messageInput) { // Adicionado verificação
    messageInput.addEventListener('input', (event) => {
        message = event.target.value.trim();
        checkPage1Readiness();
    });
}

// Habilitar/desabilitar botão "Próximo" da Página 1
function checkPage1Readiness() {
    // console.log("Verificando prontidão da Página 1...");
    // console.log("Data:", initialDate, "Válida?", initialDate instanceof Date && !isNaN(initialDate.getTime()));
    // console.log("Mensagem:", message, "Não vazia?", message.trim() !== '');
    // console.log("Link Música:", musicLinkInput.value, "Válido?", musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value));

    const isDateSet = initialDate instanceof Date && !isNaN(initialDate.getTime());
    const isMessageSet = messageInput.value.trim() !== '';
    const isMusicLinkValid = musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value);

    if (nextButtonPage1) { // Verifica se o botão existe antes de manipular
        if (isDateSet && isMessageSet && isMusicLinkValid) {
            nextButtonPage1.disabled = false;
            nextButtonPage1.classList.remove('secondary-button');
            nextButtonPage1.classList.add('main-button');
        } else {
            nextButtonPage1.disabled = true;
            nextButtonPage1.classList.add('secondary-button');
            nextButtonPage1.classList.remove('main-button');
        }
    }
}

// Função para validar URL do YouTube
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
    return youtubeRegex.test(url);
}


// --- Funções da Página 2 (Emojis e Fotos) ---

// Event Listeners para os inputs de emoji
emojiInputs.forEach((input, index) => {
    if (input) { // Verificação se o input existe
        input.addEventListener('input', (event) => {
            emojis[index] = event.target.value.trim().substring(0, 1); // Pega apenas o primeiro caractere
            event.target.value = emojis[index]; // Garante que apenas 1 caractere fica visível
            checkPage2Readiness(); // Verifica se pode gerar o link
        });
    }
});

// Adiciona event listeners para os photoUploaders
photoUploaders.forEach((uploader, index) => {
    if (uploader) { // Verificação se o uploader existe
        const fileInput = uploader.querySelector('.hidden-file-input');
        const uploadedImage = uploader.querySelector('img');
        const uploadText = uploader.querySelector('.upload-text');
        const removeButton = uploader.querySelector('.remove-photo-button');

        // Simula clique no input de arquivo quando o uploader é clicado
        uploader.addEventListener('click', () => {
            fileInput.click();
        });

        // Remove a imagem
        if (removeButton) { // Verificação se o botão de remover existe
            removeButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita que o clique no botão de remover acione o upload
                uploadedImage.src = '';
                uploadedImage.style.opacity = 0;
                uploadText.style.display = 'block';
                removeButton.classList.remove('show-button');
                photoFiles[index] = null; // Remove o arquivo do array
                uploadedPhotoUrls[index] = null; // Remove a URL do array
                checkPage2Readiness(); // Verifica o status do botão Gerar Link
            });
        }

        // Lida com a seleção de arquivo
        if (fileInput) { // Verificação se o input de arquivo existe
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    photoFiles[index] = file; // Armazena o arquivo
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        uploadedImage.src = e.target.result;
                        uploadedImage.style.opacity = 1;
                        uploadText.style.display = 'none';
                        removeButton.classList.add('show-button');
                        uploadedPhotoUrls[index] = e.target.result; // Armazena a URL base64
                        checkPage2Readiness(); // Verifica o status do botão Gerar Link
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
});

// Função para verificar se a Página 2 está pronta para gerar o link
function checkPage2Readiness() {
    // console.log("Verificando prontidão da Página 2...");
    // console.log("Emojis:", emojis, "Tem algum?", emojis.some(emoji => emoji.trim() !== ''));
    // console.log("Fotos:", uploadedPhotoUrls, "Tem alguma?", uploadedPhotoUrls.some(url => url !== null));

    const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
    const hasPhotos = uploadedPhotoUrls.some(url => url !== null);

    if (generateLinkButton) { // Verifica se o botão existe antes de manipular
        if (hasEmojis && hasPhotos) {
            generateLinkButton.disabled = false;
            generateLinkButton.classList.remove('secondary-button');
            generateLinkButton.classList.add('main-button');
        } else {
            generateLinkButton.disabled = true;
            generateLinkButton.classList.add('secondary-button');
            generateLinkButton.classList.remove('main-button');
        }
    }
}

if (generateLinkButton) { // Adicionado verificação
    generateLinkButton.addEventListener('click', () => {
        // Revalida a página 1 (Página de Configuração)
        const isDateSet = initialDate instanceof Date && !isNaN(initialDate.getTime());
        const isMessageSet = message.trim() !== '';
        const isMusicLinkValid = musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value);

        if (!isDateSet || !isMessageSet || !isMusicLinkValid) {
            alert('Por favor, preencha corretamente a data inicial, a mensagem especial e, se houver, o link da música na primeira página.');
            showPage(0); // Volta para a página 1 para o usuário corrigir
            return;
        }

        // Revalida a página 2 (Emojis e Fotos)
        const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
        const hasPhotos = uploadedPhotoUrls.some(url => url !== null);

        if (!hasEmojis) {
            alert('Por favor, escolha pelo menos um emoji.');
            return;
        }
        if (!hasPhotos) {
            alert('Por favor, carregue pelo menos uma foto.');
            return;
        }

        // Se tudo estiver ok, prossegue com a geração do link
        const encodedDate = initialDate.toISOString();
        const encodedColor = themeColor.replace('#', '');
        const encodedMusicLink = musicLink ? encodeURIComponent(musicLink) : '';
        const encodedMusicName = musicName ? encodeURIComponent(musicName) : '';
        const encodedMessage = encodeURIComponent(message);
        const encodedEmojis = encodeURIComponent(emojis.filter(e => e.trim() !== '').join('')); // Filtra vazios e junta
        const encodedPhotos = encodeURIComponent(uploadedPhotoUrls.filter(url => url !== null).join('|')); // Junta as URLs base64 com '|'

        // Monta o link
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

        shareLinkTextarea.value = shareableLink;
        shareLinkTextarea.style.display = 'block'; // Mostra a textarea
        copyLinkButton.style.display = 'block'; // Mostra o botão de copiar
        copyMessage.style.opacity = 0; // Esconde a mensagem de copiado

        // Move para a página de visualização
        showPage(2);
    });
}

if (copyLinkButton) { // Adicionado verificação
    copyLinkButton.addEventListener('click', () => {
        shareLinkTextarea.select();
        document.execCommand('copy');
        copyMessage.classList.add('show');
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 2000); // Mensagem some após 2 segundos
    });
}

// --- Funções da Página 3 (Visualização) ---
let slideshowInterval;
let currentSlideIndex = 0;
let emojiRainInterval;

function updateViewMode() {
    const urlParams = new URLSearchParams(window.location.search);

    // Carregar dados da URL ou usar dados do formulário
    const dateParam = urlParams.get('date');
    const colorParam = urlParams.get('color');
    const messageParam = urlParams.get('message');
    const emojisParam = urlParams.get('emojis');
    const musicParam = urlParams.get('music');
    const musicNameParam = urlParams.get('musicName');
    const photosParam = urlParams.get('photos');

    // Data
    let displayDate = initialDate; // Usa o valor do formulário como padrão
    if (dateParam) { // Se houver na URL, sobrescreve
        displayDate = new Date(dateParam);
    }
    if (displayDate instanceof Date && !isNaN(displayDate.getTime())) { // Usar getTime() para NaN check
        updateCounter(displayDate);
        // Limpa o intervalo anterior antes de criar um novo
        if (window._counterInterval) clearInterval(window._counterInterval);
        window._counterInterval = setInterval(() => updateCounter(displayDate), 1000); // Atualiza a cada segundo
    } else {
        counterDisplay.textContent = 'Data não definida.';
    }

    // Cor do Tema
    if (colorParam) {
        themeColor = '#' + colorParam; // Assume que a cor na URL não tem #
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    } else {
        // Se não houver na URL, usa a cor definida pelo usuário no formulário
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    }

    // Mensagem
    const displayMessage = messageParam ? decodeURIComponent(messageParam) : message;
    if (viewModeMessage) { // Verificação
        viewModeMessage.textContent = displayMessage;
    }


    // Emojis para chuva de emojis
    const displayEmojis = emojisParam ? decodeURIComponent(emojisParam).split('') : emojis.filter(e => e.trim() !== '');
    if (displayEmojis.length > 0) {
        startEmojiRain(displayEmojis);
    } else {
        stopEmojiRain(); // Garante que a chuva pare se não houver emojis
    }

    // Fotos para slideshow
    let displayPhotos = uploadedPhotoUrls.filter(url => url !== null); // Usa fotos do formulário como padrão
    if (photosParam) {
        // Prioriza as fotos da URL se existirem
        displayPhotos = decodeURIComponent(photosParam).split('|').filter(url => url !== '');
    }

    // Limpa todas as fotos antes de carregar novas
    slideshowPhotos.forEach(img => {
        img.src = '';
        img.classList.remove('active');
    });

    if (displayPhotos.length > 0) {
        slideshowPhotos.forEach((img, index) => {
            if (displayPhotos[index]) {
                img.src = displayPhotos[index];
                img.alt = `Foto ${index + 1}`;
            }
        });
        startSlideshow(); // Inicia o slideshow apenas se houver fotos
    } else {
        stopSlideshow();
    }


    // Música
    const displayMusicLink = musicParam ? decodeURIComponent(musicParam) : musicLink;
    const displayMusicName = musicNameParam ? decodeURIComponent(musicNameParam) : musicName;

    if (musicPlayerDisplay && musicInfoDisplay) { // Verificação
        if (displayMusicLink && isValidYouTubeUrl(displayMusicLink)) {
            musicPlayerDisplay.style.display = 'flex';
            musicInfoDisplay.textContent = displayMusicName || 'Música Carregada';
            loadYouTubePlayer(displayMusicLink);
        } else {
            musicPlayerDisplay.style.display = 'none';
            if (player) {
                player.destroy(); // Destroi o player se não houver música
                player = null;
            }
        }
    }
}

function updateCounter(date) {
    if (!counterDisplay) return; // Garante que o elemento existe

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.44); // Média de dias no mês
    const years = Math.floor(days / 365.25); // Média de dias no ano (considerando bissextos)

    let counterText = '';
    // Lógica para construir a string de tempo
    const parts = [];
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
    // Calcula meses restantes corretamente para não duplicar anos
    const remainingDaysAfterYears = days - (years * 365.25); // Dias restantes após anos completos
    if (Math.floor(remainingDaysAfterYears / 30.44) > 0) parts.push(`${Math.floor(remainingDaysAfterYears / 30.44)} mês${Math.floor(remainingDaysAfterYears / 30.44) > 1 ? 'es' : ''}`);

    const remainingDaysAfterMonths = days % 30.44; // Dias restantes após meses completos
    if (Math.floor(remainingDaysAfterMonths) > 0 || (years === 0 && months === 0 && days === 0)) parts.push(`${Math.floor(remainingDaysAfterMonths)} dia${(Math.floor(remainingDaysAfterMonths) !== 1) ? 's' : ''}`);

    parts.push(`${hours % 24} hora${(hours % 24) !== 1 ? 's' : ''}`);
    parts.push(`${minutes % 60} minuto${(minutes % 60) !== 1 ? 's' : ''}`);
    parts.push(`${seconds % 60} segundo${(seconds % 60) !== 1 ? 's' : ''}`);

    // Formatação para "e" no final
    if (parts.length > 1) {
        const lastPart = parts.pop();
        counterText = `${parts.join(', ')} e ${lastPart}`;
    } else if (parts.length === 1) {
        counterText = parts[0];
    } else {
        counterText = 'Calculando...'; // Caso não haja tempo passado ainda ou seja 0
    }

    counterDisplay.textContent = `Estamos juntos há:\n${counterText}`;
}


function startSlideshow() {
    stopSlideshow(); // Garante que não há slideshow rodando
    const activePhotos = slideshowPhotos.filter(img => img.src !== ''); // Pega apenas fotos que foram carregadas

    if (activePhotos.length > 0) {
        currentSlideIndex = 0;
        activePhotos[currentSlideIndex].classList.add('active');

        if (activePhotos.length > 1) {
            slideshowInterval = setInterval(() => {
                activePhotos[currentSlideIndex].classList.remove('active');
                currentSlideIndex = (currentSlideIndex + 1) % activePhotos.length;
                activePhotos[currentSlideIndex].classList.add('active');
            }, 5000); // Troca a cada 5 segundos
        }
    }
}

function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    slideshowPhotos.forEach(img => img.classList.remove('active'));
}

// YouTube Player API
// Este código permanece o mesmo. A URL da API do YouTube é carregada dinamicamente.
function loadYouTubePlayer(videoUrl) {
    if (player) {
        player.destroy(); // Destroi o player existente antes de criar um novo
    }

    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
        console.error("URL do YouTube inválida:", videoUrl);
        return;
    }

    // Garante que a API do YouTube esteja carregada
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        window.onYouTubeIframeAPIReady = () => {
            createPlayer(videoId);
        };
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api"; // URL correta para a API
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        createPlayer(videoId);
    }
}

function createPlayer(videoId) {
    player = new YT.Player('player', {
        height: '100', // Altura do player
        width: '100%', // Largura do player
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'autoplay': 1, // Autoplay para celular (pode ter restrições do navegador)
            'loop': 1,
            'controls': 1, // Mostra os controles
            'disablekb': 1, // Desabilita controles de teclado
            'modestbranding': 1, // Oculta o logo do YouTube nos controles
            'rel': 0, // Não mostra vídeos relacionados
            'playlist': videoId // Necessário para loop
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
    event.target.setVolume(50); // Inicia com volume em 50%
}

function onPlayerStateChange(event) {
    // Loop
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo();
    }
}

function getYouTubeVideoId(url) {
    let videoId = '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/ ]{11})/i;
    const match = url.match(regex);
    if (match && match[1]) {
        videoId = match[1];
    }
    return videoId;
}

// Chuva de Emojis (mantido como está, com verificação de elemento)
const emojiRainContainer = document.getElementById('emojiRainContainer');
const defaultEmojis = ['❤️', '✨', '😊']; // Emojis padrão para a chuva

function startEmojiRain(emojisToUse = defaultEmojis) {
    stopEmojiRain(); // Limpa qualquer chuva anterior

    if (!emojiRainContainer) { // Garante que o container existe
        console.warn("Elemento 'emojiRainContainer' não encontrado.");
        return;
    }

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

// Função para escurecer uma cor hexadecimal (mantido como está)
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

// Inicialização: Mostra a primeira página ao carregar e atribui eventos
document.addEventListener('DOMContentLoaded', () => {
    // Esconder todas as páginas inicialmente, exceto a primeira
    pages.forEach((page, index) => {
        if (index !== 0) {
            page.classList.add('hidden');
        }
    });
    showPage(0); // Garante que a primeira página seja exibida corretamente

    // Atribui event listeners para os botões de navegação APÓS garantir que existam
    if (nextButtonPage1) {
        nextButtonPage1.addEventListener('click', () => showPage(1));
    }
    if (prevButtonPage2) {
        prevButtonPage2.addEventListener('click', () => showPage(0));
    }
    if (prevButtonPage3) {
        prevButtonPage3.addEventListener('click', () => showPage(1));
    }

    // Executa as checagens de prontidão iniciais para os botões
    checkPage1Readiness(); // Verifica o estado inicial do botão "Próximo" da Pág 1
    checkPage2Readiness(); // Verifica o estado inicial do botão "Gerar Link" da Pág 2

    // Processa a URL se for um link de visualização (para acesso direto)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
        showPage(2); // Vai direto para a página de visualização
    }
});
