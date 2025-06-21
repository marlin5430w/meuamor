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

// Referências aos elementos
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

const prevButtonPage2 = document.getElementById('prevButtonPage2');
const nextButtonPage2 = document.getElementById('nextButtonPage2');
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
    pages[currentPage].classList.remove('active');
    pages[currentPage].classList.add('hidden'); // Oculta a página anterior completamente
    currentPage = pageIndex;
    pages[currentPage].classList.remove('hidden'); // Remove hidden antes de adicionar active
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
defineDateButton.addEventListener('click', () => {
    const dateValue = initialDateInput.value;
    if (dateValue) {
        initialDate = new Date(dateValue);
        alert('Data inicial definida!');
        // Habilitar a próxima página se todas as informações essenciais estiverem preenchidas
        checkPage1Readiness();
    } else {
        alert('Por favor, selecione uma data inicial.');
    }
});

themeColorInput.addEventListener('input', (event) => {
    themeColor = event.target.value;
    document.documentElement.style.setProperty('--main-color', themeColor);
    document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
    document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66'); // 40% opacity
    document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80'); // 50% opacity
    document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A'); // 10% opacity
    checkPage1Readiness();
});

loadMusicButton.addEventListener('click', () => {
    const link = musicLinkInput.value;
    if (link) {
        musicLink = link;
        musicName = musicNameInput.value || 'Música Carregada';
        alert('Música carregada! Ela tocará na visualização final.');
        checkPage1Readiness();
    } else {
        alert('Por favor, insira o link da música do YouTube.');
    }
});

messageInput.addEventListener('input', (event) => {
    message = event.target.value;
    checkPage1Readiness();
});

// Habilitar/desabilitar botão "Próximo" da Página 1
function checkPage1Readiness() {
    // Basicamente, garantir que data e link da música (se preenchido) estão ok
    const isDateSet = initialDate instanceof Date && !isNaN(initialDate);
    const isMusicLinkValid = musicLinkInput.value === '' || isValidYouTubeUrl(musicLinkInput.value); // Permite vazio ou link válido
    const isMessageSet = messageInput.value.trim() !== '';

    // O botão "Próximo: Emojis e Fotos" só será habilitado se a data e a mensagem estiverem preenchidas.
    // O link da música é opcional, mas se preenchido, deve ser válido.
    if (isDateSet && isMusicLinkValid && isMessageSet) {
        nextButtonPage2.disabled = false;
        nextButtonPage2.classList.remove('secondary-button');
        nextButtonPage2.classList.add('main-button');
    } else {
        nextButtonPage2.disabled = true;
        nextButtonPage2.classList.add('secondary-button');
        nextButtonPage2.classList.remove('main-button');
    }
}

// Chamar a checagem ao carregar a página e em cada input relevante
document.addEventListener('DOMContentLoaded', checkPage1Readiness);
initialDateInput.addEventListener('change', checkPage1Read readiness); // 'change' para o datetime-local
musicLinkInput.addEventListener('input', checkPage1Readiness);
messageInput.addEventListener('input', checkPage1Readiness);

// Função para validar URL do YouTube
function isValidYouTubeUrl(url) {
    // Regex mais robusta para links do YouTube, incluindo youtu.be e youtube.com/watch?v=
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
    return youtubeRegex.test(url);
}


// --- Funções da Página 2 (Emojis e Fotos) ---

// Event Listeners para os inputs de emoji
emojiInputs.forEach((input, index) => {
    input.addEventListener('input', (event) => {
        emojis[index] = event.target.value.trim().substring(0, 1); // Pega apenas o primeiro caractere
        event.target.value = emojis[index]; // Garante que apenas 1 caractere fica visível
        checkPage2Readiness(); // Verifica se pode gerar o link
    });
});

// Adiciona event listeners para os photoUploaders
photoUploaders.forEach((uploader, index) => {
    const fileInput = uploader.querySelector('.hidden-file-input');
    const uploadedImage = uploader.querySelector('img');
    const uploadText = uploader.querySelector('.upload-text');
    const removeButton = uploader.querySelector('.remove-photo-button');

    // Simula clique no input de arquivo quando o uploader é clicado
    uploader.addEventListener('click', () => {
        fileInput.click();
    });

    // Remove a imagem
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

    // Lida com a seleção de arquivo
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
});

// Função para verificar se a Página 2 está pronta para gerar o link
function checkPage2Readiness() {
    // Apenas habilitar o botão de gerar link se houver pelo menos 1 emoji e 1 foto.
    const hasEmojis = emojis.some(emoji => emoji.trim() !== ''); // Verifica se pelo menos um emoji foi inserido
    const hasPhotos = uploadedPhotoUrls.some(url => url !== null); // Verifica se pelo menos uma foto foi carregada

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

// Chamar checkPage2Readiness ao carregar a página inicialmente
document.addEventListener('DOMContentLoaded', checkPage2Readiness);


generateLinkButton.addEventListener('click', () => {
    // Assegura que todos os dados foram coletados antes de gerar o link
    if (!initialDate || !message.trim()) {
        alert('Por favor, preencha a data inicial e a mensagem especial na primeira página.');
        return;
    }
    if (!emojis.some(emoji => emoji.trim() !== '')) {
        alert('Por favor, escolha pelo menos um emoji.');
        return;
    }
    if (!uploadedPhotoUrls.some(url => url !== null)) {
        alert('Por favor, carregue pelo menos uma foto.');
        return;
    }

    // Codifica os dados para a URL
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

copyLinkButton.addEventListener('click', () => {
    shareLinkTextarea.select();
    document.execCommand('copy');
    copyMessage.classList.add('show');
    setTimeout(() => {
        copyMessage.classList.remove('show');
    }, 2000); // Mensagem some após 2 segundos
});

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
    let displayDate = initialDate;
    if (dateParam) {
        displayDate = new Date(dateParam);
    }
    if (displayDate instanceof Date && !isNaN(displayDate)) {
        updateCounter(displayDate);
        setInterval(() => updateCounter(displayDate), 1000); // Atualiza a cada segundo
    } else {
        counterDisplay.textContent = 'Data não definida.';
    }

    // Cor do Tema
    if (colorParam) {
        themeColor = '#' + colorParam;
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    } else {
        // Usa a cor padrão ou a definida pelo usuário se não houver na URL
        document.documentElement.style.setProperty('--main-color', themeColor);
        document.documentElement.style.setProperty('--main-color-dark', darkenColor(themeColor, -10));
        document.documentElement.style.setProperty('--main-color-shadow', themeColor + '66');
        document.documentElement.style.setProperty('--main-color-border-dash', themeColor + '80');
        document.documentElement.style.setProperty('--main-color-hover-bg', themeColor + '1A');
    }

    // Mensagem
    const displayMessage = messageParam ? decodeURIComponent(messageParam) : message;
    viewModeMessage.textContent = displayMessage;

    // Emojis para chuva de emojis
    const displayEmojis = emojisParam ? decodeURIComponent(emojisParam).split('') : emojis.filter(e => e.trim() !== '');
    if (displayEmojis.length > 0) {
        startEmojiRain(displayEmojis);
    }

    // Fotos para slideshow
    let displayPhotos = uploadedPhotoUrls.filter(url => url !== null);
    if (photosParam) {
        // Prioriza as fotos da URL se existirem
        displayPhotos = decodeURIComponent(photosParam).split('|').filter(url => url !== '');
    }

    slideshowPhotos.forEach((img, index) => {
        if (displayPhotos[index]) {
            img.src = displayPhotos[index];
            img.alt = `Foto ${index + 1}`;
            // Mantém a primeira foto visível no início do slideshow
            if (index === 0) {
                img.classList.add('active');
            }
        } else {
            img.src = ''; // Limpa a imagem se não houver URL
            img.classList.remove('active');
        }
    });

    // Música
    const displayMusicLink = musicParam ? decodeURIComponent(musicParam) : musicLink;
    const displayMusicName = musicNameParam ? decodeURIComponent(musicNameParam) : musicName;

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

function updateCounter(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.44); // Média de dias no mês
    const years = Math.floor(days / 365.25); // Média de dias no ano (considerando bissextos)

    let remainingDays = days;
    let remainingHours = hours % 24;
    let remainingMinutes = minutes % 60;
    let remainingSeconds = seconds % 60;

    let counterText = '';
    if (years > 0) {
        counterText += `${years} ano${years > 1 ? 's' : ''}, `;
        remainingDays = days % 365.25; // Remove os dias dos anos completos
    }
    if (months > 0) {
        counterText += `${Math.floor(remainingDays / 30.44)} mês${Math.floor(remainingDays / 30.44) > 1 ? 'es' : ''}, `;
    }
    // Sempre mostrar dias, horas, minutos e segundos, mesmo que sejam 0
    counterText += `${days % 30} dia${(days % 30) !== 1 ? 's' : ''}, ${remainingHours} hora${remainingHours !== 1 ? 's' : ''}, ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;

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
        tag.src = "https://www.youtube.com/iframe_api";
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
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    const match = url.match(regex);
    if (match && match[1]) {
        videoId = match[1];
    }
    return videoId;
}

// Chuva de Emojis
const emojiRainContainer = document.getElementById('emojiRainContainer');
const defaultEmojis = ['❤️', '✨', '😊']; // Emojis padrão para a chuva

function startEmojiRain(emojisToUse = defaultEmojis) {
    stopEmojiRain(); // Limpa qualquer chuva anterior

    // Garante que o container esteja visível
    if (emojiRainContainer) {
        emojiRainContainer.style.display = 'block';
    }

    emojiRainInterval = setInterval(() => {
        if (!emojiRainContainer) return; // Checagem adicional para o container

        const emoji = document.createElement('span');
        emoji.classList.add('falling-emoji');
        emoji.textContent = emojisToUse[Math.floor(Math.random() * emojisToUse.length)];

        // Posição inicial aleatória
        const startX = Math.random() * window.innerWidth;
        emoji.style.left = `${startX}px`;

        // Duração da queda e atraso para criar um efeito de chuva contínua
        const duration = Math.random() * 5 + 5; // 5 a 10 segundos
        emoji.style.animationDuration = `${duration}s`;
        emoji.style.animationDelay = `-${Math.random() * 5}s`; // Atraso negativo para começar escalonado

        // Pequeno offset horizontal aleatório para o movimento "lateral"
        const xOffset = (Math.random() - 0.5) * 200; // -100px a 100px
        emoji.style.setProperty('--fall-x-offset', `${xOffset}px`);

        emojiRainContainer.appendChild(emoji);

        // Remover emojis do DOM após a animação para evitar acúmulo
        emoji.addEventListener('animationend', () => {
            emoji.remove();
        });
    }, 300); // Adiciona um novo emoji a cada 300ms
}


function stopEmojiRain() {
    if (emojiRainInterval) {
        clearInterval(emojiRainInterval);
        emojiRainInterval = null;
    }
    // Remove todos os emojis existentes
    if (emojiRainContainer) {
        emojiRainContainer.innerHTML = '';
        emojiRainContainer.style.display = 'none'; // Esconde o container
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
    // Esconder todas as páginas inicialmente, exceto a primeira
    pages.forEach((page, index) => {
        if (index !== 0) {
            page.classList.add('hidden');
        }
    });
    showPage(0); // Garante que a primeira página seja exibida corretamente
    checkPage1Readiness(); // Verifica o estado inicial do botão "Próximo"
    checkPage2Readiness(); // Verifica o estado inicial do botão "Gerar Link"

    // Processa a URL se for um link de visualização
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
        showPage(2); // Vai direto para a página de visualização
    }
});

// Event Listeners para botões de navegação
document.getElementById('nextButtonPage2').addEventListener('click', () => showPage(1)); // Botão "Próximo" da Página 1
prevButtonPage2.addEventListener('click', () => showPage(0)); // Botão "Voltar" da Página 2
prevButtonPage3.addEventListener('click', () => showPage(1)); // Botão "Voltar" da Página 3
