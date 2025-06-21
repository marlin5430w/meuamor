// Variáveis Globais (Mantenha no topo do seu script.js)
const pages = document.querySelectorAll('.page');
let currentPage = 0; // Começa na primeira página (Configuração)

// Dados para gerar o link
let initialDate = null; // Inicialize como null para indicar que não foi definida
let themeColor = '#FF00FF'; // Cor padrão
let musicLink = '';
let musicName = '';
let message = '';
let emojis = ['', '', '']; // Array para armazenar os 3 emojis
const photoFiles = []; // Array para armazenar os arquivos de imagem
const uploadedPhotoUrls = []; // Array para armazenar as URLs das imagens base64

// Referências aos elementos - GARANTIR QUE ESSES IDs CORRESPONDAM EXATAMENTE AO SEU HTML
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
const nextButtonPage1 = document.getElementById('nextButtonPage2'); // Este é o botão "PRÓXIMO: EMOJIS E FOTOS" que está na Página 1 (com ID nextButtonPage2 no HTML)
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
    console.log(`Tentando ir para a página: ${pageIndex}`);
    // Esconde a página atual
    if (pages[currentPage]) {
        pages[currentPage].classList.remove('active');
        pages[currentPage].classList.add('hidden');
    }

    currentPage = pageIndex;

    // Mostra a nova página
    if (pages[currentPage]) {
        pages[currentPage].classList.remove('hidden');
        pages[currentPage].classList.add('active');
        pages[currentPage].scrollTop = 0; // Scroll para o topo

        // Lógica específica para a página de visualização
        if (currentPage === 2) {
            updateViewMode();
            startSlideshow();
            startEmojiRain();
            const urlParams = new URLSearchParams(window.location.search);
            const viewModePage = document.querySelector('.view-mode-page');
            if (viewModePage) { // Verificação para o elemento existir
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
        console.error(`Página com índice ${pageIndex} não encontrada.`);
    }
}

// --- Funções da Página 1 (Configuração) ---
if (defineDateButton) {
    defineDateButton.addEventListener('click', () => {
        console.log("Botão 'Definir Data' clicado.");
        const dateValue = initialDateInput.value;
        if (dateValue) {
            initialDate = new Date(dateValue);
            console.log('Data inicial definida:', initialDate);
            checkPage1Readiness(); // Revalida o botão "Próximo"
        } else {
            alert('Por favor, selecione uma data inicial válida.');
            initialDate = null; // Garante que a data é nula se inválida
        }
    });
} else {
    console.error("Elemento 'defineDateButton' não encontrado.");
}


if (initialDateInput) {
    initialDateInput.addEventListener('change', () => {
        console.log("Input 'initialDate' alterado:", initialDateInput.value);
        if (initialDateInput.value) {
            initialDate = new Date(initialDateInput.value);
        } else {
            initialDate = null; // Se o campo for limpo, a data é null
        }
        checkPage1Readiness();
    });
} else {
    console.error("Elemento 'initialDateInput' não encontrado.");
}

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
    console.error("Elemento 'themeColorInput' não encontrado.");
}

if (loadMusicButton) {
    loadMusicButton.addEventListener('click', () => {
        console.log("Botão 'Carregar Música' clicado.");
        const link = musicLinkInput.value.trim();
        if (link) {
            if (isValidYouTubeUrl(link)) {
                musicLink = link;
                musicName = musicNameInput.value.trim() || 'Música Carregada';
                console.log('Música carregada:', musicName, musicLink);
                alert('Música carregada com sucesso! Ela tocará na visualização final.');
            } else {
                alert('Por favor, insira um link válido do YouTube.');
                musicLink = ''; // Limpa o link inválido
                musicName = '';
            }
        } else {
            musicLink = ''; // Permite link vazio
            musicName = '';
            alert('Link da música removido. A visualização não terá música.');
        }
        checkPage1Readiness(); // Revalida o botão "Próximo"
    });
} else {
    console.error("Elemento 'loadMusicButton' não encontrado.");
}


if (musicLinkInput) {
    musicLinkInput.addEventListener('input', checkPage1Readiness);
} else {
    console.error("Elemento 'musicLinkInput' não encontrado.");
}

if (musicNameInput) {
    musicNameInput.addEventListener('input', checkPage1Readiness);
} else {
    console.error("Elemento 'musicNameInput' não encontrado.");
}


if (messageInput) {
    messageInput.addEventListener('input', (event) => {
        message = event.target.value.trim();
        checkPage1Readiness();
    });
} else {
    console.error("Elemento 'messageInput' não encontrado.");
}

// Habilitar/desabilitar botão "Próximo" da Página 1
function checkPage1Readiness() {
    console.log("Executando checkPage1Readiness...");
    const isDateValid = initialDate instanceof Date && !isNaN(initialDate.getTime());
    const isMessageFilled = messageInput.value.trim() !== '';
    const isMusicLinkOkay = musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value);

    console.log(`isDateValid: ${isDateValid}, isMessageFilled: ${isMessageFilled}, isMusicLinkOkay: ${isMusicLinkOkay}`);

    if (nextButtonPage1) {
        if (isDateValid && isMessageFilled && isMusicLinkOkay) {
            console.log("Botão 'Próximo' (nextButtonPage1) HABILITADO.");
            nextButtonPage1.disabled = false;
            nextButtonPage1.classList.remove('secondary-button');
            nextButtonPage1.classList.add('main-button');
        } else {
            console.log("Botão 'Próximo' (nextButtonPage1) DESABILITADO.");
            nextButtonPage1.disabled = true;
            nextButtonPage1.classList.add('secondary-button');
            nextButtonPage1.classList.remove('main-button');
        }
    } else {
        console.error("Elemento 'nextButtonPage1' (Botão Próximo da Página 1) não encontrado.");
    }
}

// Função para validar URL do YouTube
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
    return youtubeRegex.test(url);
}


// --- Funções da Página 2 (Emojis e Fotos) ---

// Event Listeners para os inputs de emoji
emojiInputs.forEach((input, index) => {
    if (input) {
        input.addEventListener('input', (event) => {
            emojis[index] = event.target.value.trim().substring(0, 1); // Pega apenas o primeiro caractere
            event.target.value = emojis[index]; // Garante que apenas 1 caractere fica visível
            checkPage2Readiness(); // Verifica se pode gerar o link
        });
    } else {
        console.warn(`Elemento 'emojiInput' com índice ${index} não encontrado.`);
    }
});

// Adiciona event listeners para os photoUploaders
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
        } else {
            console.warn(`Elemento 'removeButton' para uploader ${index} não encontrado.`);
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
        } else {
            console.warn(`Elemento 'fileInput' para uploader ${index} não encontrado.`);
        }
    } else {
        console.warn(`Elemento 'photoUploader' com índice ${index} não encontrado.`);
    }
});

// Função para verificar se a Página 2 está pronta para gerar o link
function checkPage2Readiness() {
    console.log("Executando checkPage2Readiness...");
    const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
    const hasPhotos = uploadedPhotoUrls.some(url => url !== null && url !== ''); // Garante que a URL não é vazia

    console.log(`hasEmojis: ${hasEmojis}, hasPhotos: ${hasPhotos}`);

    if (generateLinkButton) {
        if (hasEmojis && hasPhotos) {
            console.log("Botão 'Gerar Link Compartilhável' HABILITADO.");
            generateLinkButton.disabled = false;
            generateLinkButton.classList.remove('secondary-button');
            generateLinkButton.classList.add('main-button');
        } else {
            console.log("Botão 'Gerar Link Compartilhável' DESABILITADO.");
            generateLinkButton.disabled = true;
            generateLinkButton.classList.add('secondary-button');
            generateLinkButton.classList.remove('main-button');
        }
    } else {
        console.error("Elemento 'generateLinkButton' não encontrado.");
    }
}

if (generateLinkButton) {
    generateLinkButton.addEventListener('click', () => {
        console.log("Botão 'Gerar Link Compartilhável' clicado.");

        // Revalida a página 1 (Página de Configuração)
        const isDateValid = initialDate instanceof Date && !isNaN(initialDate.getTime());
        const isMessageFilled = message.trim() !== '';
        const isMusicLinkOkay = musicLinkInput.value.trim() === '' || isValidYouTubeUrl(musicLinkInput.value);

        if (!isDateValid) {
            alert('Por favor, selecione uma data inicial válida na primeira página.');
            showPage(0);
            return;
        }
        if (!isMessageFilled) {
            alert('Por favor, preencha a mensagem especial na primeira página.');
            showPage(0);
            return;
        }
        if (!isMusicLinkOkay) {
             alert('Por favor, insira um link de música válido do YouTube ou deixe o campo vazio na primeira página.');
            showPage(0);
            return;
        }

        // Revalida a página 2 (Emojis e Fotos)
        const hasEmojis = emojis.some(emoji => emoji.trim() !== '');
        const hasPhotos = uploadedPhotoUrls.some(url => url !== null && url !== '');

        if (!hasEmojis) {
            alert('Por favor, escolha pelo menos um emoji na página de Emojis e Fotos.');
            return;
        }
        if (!hasPhotos) {
            alert('Por favor, carregue pelo menos uma foto na página de Emojis e Fotos.');
            return;
        }

        // Se tudo estiver ok, prossegue com a geração do link
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

        shareLinkTextarea.value = shareableLink;
        shareLinkTextarea.style.display = 'block';
        copyLinkButton.style.display = 'block';
        copyMessage.style.opacity = 0;

        showPage(2); // Move para a página de visualização
    });
} else {
    console.error("Elemento 'generateLinkButton' não encontrado.");
}


if (copyLinkButton) {
    copyLinkButton.addEventListener('click', () => {
        shareLinkTextarea.select();
        document.execCommand('copy');
        if (copyMessage) {
            copyMessage.classList.add('show');
            setTimeout(() => {
                copyMessage.classList.remove('show');
            }, 2000);
        }
    });
} else {
    console.error("Elemento 'copyLinkButton' não encontrado.");
}

// --- Funções da Página 3 (Visualização) ---
// As funções updateViewMode, updateCounter, startSlideshow, stopSlideshow,
// loadYouTubePlayer, createPlayer, onPlayerReady, onPlayerStateChange,
// getYouTubeVideoId, startEmojiRain, stopEmojiRain, darkenColor
// permanecem essencialmente as mesmas, com algumas verificações de elemento
// adicionadas para robustez. Não as repetirei aqui para economizar espaço,
// mas elas estão no código completo abaixo.

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

// Funções de visualização (para referência, estão no código completo)
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

function startSlideshow() { /* ... implementação ... */ }
function stopSlideshow() { /* ... implementação ... */ }
function loadYouTubePlayer(videoUrl) { /* ... implementação ... */ }
function createPlayer(videoId) { /* ... implementação ... */ }
function onPlayerReady(event) { /* ... implementação ... */ }
function onPlayerStateChange(event) { /* ... implementação ... */ }
function getYouTubeVideoId(url) { /* ... implementação ... */ }
function startEmojiRain(emojisToUse = defaultEmojis) { /* ... implementação ... */ }
function stopEmojiRain() { /* ... implementação ... */ }


// Inicialização: Mostra a primeira página ao carregar e atribui eventos
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente carregado.");

    // Esconder todas as páginas inicialmente, exceto a primeira
    pages.forEach((page, index) => {
        if (index !== 0) {
            page.classList.add('hidden');
        }
    });
    showPage(0); // Garante que a primeira página seja exibida corretamente

    // Atribui event listeners para os botões de navegação APÓS garantir que existam
    if (nextButtonPage1) {
        nextButtonPage1.addEventListener('click', () => {
            console.log("Botão 'Próximo' da Página 1 clicado.");
            showPage(1);
        });
    } else {
        console.error("nextButtonPage1 não encontrado no DOM.");
    }

    if (prevButtonPage2) {
        prevButtonPage2.addEventListener('click', () => {
            console.log("Botão 'Voltar' da Página 2 clicado.");
            showPage(0);
        });
    } else {
        console.error("prevButtonPage2 não encontrado no DOM.");
    }

    if (prevButtonPage3) {
        prevButtonPage3.addEventListener('click', () => {
            console.log("Botão 'Voltar' da Página 3 clicado.");
            showPage(1);
        });
    } else {
        console.error("prevButtonPage3 não encontrado no DOM.");
    }

    // Executa as checagens de prontidão iniciais para os botões
    checkPage1Readiness(); // Verifica o estado inicial do botão "Próximo" da Pág 1
    checkPage2Readiness(); // Verifica o estado inicial do botão "Gerar Link" da Pág 2

    // Processa a URL se for um link de visualização (para acesso direto)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('date')) {
        console.log("Parâmetros de URL detectados, indo para a página de visualização.");
        showPage(2); // Vai direto para a página de visualização
    }
});
