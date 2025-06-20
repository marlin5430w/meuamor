document.addEventListener('DOMContentLoaded', () => {
    // === Seletores de Elementos ===
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const viewModeDisplay = document.getElementById('viewModeDisplay');

    const goToEmojiPageButton = document.getElementById('goToEmojiPageButton');
    const backToConfigButton = document.getElementById('backToConfigButton');
    const generateLinkButton = document.getElementById('generateLinkButton');
    const copyShareLinkButton = document.getElementById('copyShareLinkButton');
    const copyMessage = document.getElementById('copyMessage');

    const startDatePicker = document.getElementById('startDatePicker');
    const setStartDateButton = document.getElementById('setStartDateButton');
    const themeColorPicker = document.getElementById('themeColorPicker');
    const musicLinkInput = document.getElementById('musicLinkInput');
    const musicNameInput = document.getElementById('musicNameInput');
    const loadMusicButton = document.getElementById('loadMusicButton');
    const musicLoadedMessage = document.getElementById('musicLoadedMessage');

    const emojiInputs = [
        document.getElementById('emojiInput1'),
        document.getElementById('emojiInput2'),
        document.getElementById('emojiInput3')
    ];

    const photoUploads = [
        { input: document.getElementById('photoUpload1'), img: document.getElementById('uploadedPhoto1'), button: document.querySelector('.remove-photo-button[data-photo-id="1"]') },
        { input: document.getElementById('photoUpload2'), img: document.getElementById('uploadedPhoto2'), button: document.querySelector('.remove-photo-button[data-photo-id="2"]') },
        { input: document.getElementById('photoUpload3'), img: document.getElementById('uploadedPhoto3'), button: document.querySelector('.remove-photo-button[data-photo-id="3"]') }
    ];

    const personalMessageInput = document.getElementById('personalMessageInput');

    const countdownMessage = document.getElementById('countdownMessage');
    const exactTimeMessage = document.getElementById('exactTimeMessage');
    const displayedMusicName = document.getElementById('displayedMusicName');
    const player = document.getElementById('player');
    const displayedPersonalMessage = document.getElementById('displayedPersonalMessage');
    const photosContainer = document.querySelector('.photos-container.slideshow-mode');
    const emojiRainContainer = document.getElementById('emojiRainContainer');

    // === Variáveis Globais de Estado ===
    let startDate = null;
    let countdownInterval;
    let slideshowInterval;
    let currentSlide = 0;
    let uploadedPhotoData = []; // Para armazenar base64 das imagens
    let musicId = '';
    let musicTitle = '';
    let selectedEmojis = ['', '', ''];

    // === Funções de Navegação entre Páginas ===
    function showPage(pageToShow) {
        const pages = [page1, page2, viewModeDisplay];
        pages.forEach(page => {
            if (page === pageToShow) {
                page.classList.add('active');
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
                page.classList.remove('active');
            }
        });
        // Ajusta o padding do container principal quando as páginas ativas controlam o padding
        document.querySelector('.container').classList.add('page-active');
    }

    // === Funções de Utilitário ===
    function parseURLParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            date: params.get('date'),
            color: params.get('color'),
            music: params.get('music'),
            musicName: params.get('musicName'),
            emoji1: params.get('emoji1'),
            emoji2: params.get('emoji2'),
            emoji3: params.get('emoji3'),
            msg: params.get('msg'),
            photos: params.getAll('photo')
        };
    }

    function formatTimeDifference(ms) {
        if (isNaN(ms) || ms < 0) {
            return { display: "Tempo não definido.", exact: "" };
        }

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30.44); // Média de dias por mês
        const years = Math.floor(days / 365.25); // Média de dias por ano

        const remainingDays = days % 365.25;
        const remainingMonths = Math.floor(remainingDays / 30.44);
        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        let displayParts = [];
        if (years > 0) displayParts.push(`${years} ano${years !== 1 ? 's' : ''}`);
        if (remainingMonths > 0) displayParts.push(`${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}`);
        if (displayParts.length < 2 && days % 30.44 < 1 && days > 0) displayParts.push(`${days} dia${days !== 1 ? 's' : ''}`); // Mostra dias se não houver meses/anos e for relevante

        const displayString = displayParts.length > 0 ? displayParts.join(', ') : '0 dias';

        const exactTimeString = `${years} ano${years !== 1 ? 's' : ''}, ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}, ${Math.floor(days % 30.44)} dia${Math.floor(days % 30.44) !== 1 ? 's' : ''}\n${remainingHours} hora${remainingHours !== 1 ? 's' : ''}, ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;

        return { display: displayString, exact: exactTimeString };
    }

    function updateCountdown() {
        if (!startDate) {
            countdownMessage.textContent = "Selecione a data inicial acima";
            exactTimeMessage.textContent = "";
            return;
        }

        const now = new Date();
        const diff = now.getTime() - startDate.getTime();

        if (diff < 0) { // Se a data inicial ainda não chegou
            countdownMessage.textContent = "Ainda não chegamos lá...";
            exactTimeMessage.textContent = "";
            return;
        }

        const { display, exact } = formatTimeDifference(diff);
        countdownMessage.textContent = `Juntos há: ${display}`;
        exactTimeMessage.textContent = exact;
    }

    function isValidYouTubeUrl(url) {
        const regex = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    function loadYouTubePlayer(videoId) {
        if (videoId) {
            player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&disablekb=1&enablejsapi=1&iv_load_policy=3&loop=1&playlist=${videoId}`;
            player.style.display = 'block'; // Garante que o player seja visível
            player.style.opacity = '1';
            player.style.position = 'relative'; // Volta ao fluxo normal do documento
            player.style.left = 'auto';
            player.style.height = '100px'; // Altura visível
        } else {
            player.src = '';
            player.style.display = 'none';
        }
    }

    function startSlideshow() {
        const photos = photosContainer.querySelectorAll('img');
        if (photos.length === 0) {
            photosContainer.style.display = 'none'; // Esconde se não houver fotos
            return;
        }
        photosContainer.style.display = 'flex'; // Garante que o container esteja visível

        photos.forEach(img => img.classList.remove('active'));
        photos[currentSlide].classList.add('active');

        slideshowInterval = setInterval(() => {
            photos[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % photos.length;
            photos[currentSlide].classList.add('active');
        }, 5000); // Muda a cada 5 segundos
    }

    function stopSlideshow() {
        clearInterval(slideshowInterval);
    }

    function startEmojiRain() {
        if (selectedEmojis.filter(e => e).length === 0) return; // Não inicia se não houver emojis
        emojiRainContainer.style.display = 'block';

        setInterval(() => {
            const emoji = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
            if (!emoji) return; // Não crie emoji se for vazio

            const span = document.createElement('span');
            span.classList.add('falling-emoji');
            span.textContent = emoji;
            span.style.left = `${Math.random() * 100}vw`; // Posição horizontal aleatória
            span.style.animationDuration = `${Math.random() * 3 + 2}s`; // Duração aleatória (2-5s)
            span.style.animationDelay = `${Math.random() * 2}s`; // Atraso aleatório
            emojiRainContainer.appendChild(span);

            // Remove o emoji depois que ele cair para não sobrecarregar o DOM
            span.addEventListener('animationend', () => {
                span.remove();
            });
        }, 300); // Cria um emoji a cada 300ms
    }

    function stopEmojiRain() {
        emojiRainContainer.style.display = 'none';
        // Remove todos os emojis existentes
        emojiRainContainer.innerHTML = '';
    }

    // === Event Listeners de Edição ===
    setStartDateButton.addEventListener('click', () => {
        if (startDatePicker.value) {
            startDate = new Date(startDatePicker.value);
            localStorage.setItem('startDate', startDate.toISOString());
            updateCountdown();
            alert('Data inicial definida!');
        } else {
            alert('Por favor, selecione uma data e hora.');
        }
    });

    themeColorPicker.addEventListener('input', (event) => {
        const newColor = event.target.value;
        document.documentElement.style.setProperty('--main-color', newColor);
        document.documentElement.style.setProperty('--main-color-dark', tinycolor(newColor).darken(10).toString());
        document.documentElement.style.setProperty('--main-color-shadow', tinycolor(newColor).setAlpha(0.4).toString());
        document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(newColor).setAlpha(0.5).toString());
        document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(newColor).setAlpha(0.1).toString());
        localStorage.setItem('themeColor', newColor);
    });

    loadMusicButton.addEventListener('click', () => {
        const url = musicLinkInput.value;
        musicId = isValidYouTubeUrl(url);
        if (musicId) {
            musicTitle = musicNameInput.value || `Música: ${musicId}`;
            musicLoadedMessage.textContent = `Música: "${musicTitle}" carregada!`;
            musicLoadedMessage.style.display = 'block';
            localStorage.setItem('musicId', musicId);
            localStorage.setItem('musicTitle', musicTitle);
        } else {
            musicLoadedMessage.textContent = 'Link inválido do YouTube.';
            musicLoadedMessage.style.color = '#ff4444'; // Cor de erro
            musicLoadedMessage.style.display = 'block';
            localStorage.removeItem('musicId');
            localStorage.removeItem('musicTitle');
        }
        setTimeout(() => {
            musicLoadedMessage.style.display = 'none';
            musicLoadedMessage.style.color = '#4CAF50'; // Volta para cor de sucesso
        }, 3000);
    });

    emojiInputs.forEach((input, index) => {
        input.addEventListener('input', (event) => {
            let value = event.target.value;
            // Remove caracteres que não são emojis
            value = value.replace(/[^\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]/gu, '');
            // Limita a 1 ou 2 caracteres para a maioria dos emojis
            if (value.length > 2) {
                value = value.slice(0, 2);
            }
            event.target.value = value;
            selectedEmojis[index] = value;
            localStorage.setItem(`emoji${index + 1}`, value);
        });
    });

    photoUploads.forEach((photoSlot, index) => {
        photoSlot.input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoSlot.img.src = e.target.result;
                    photoSlot.img.style.display = 'block';
                    photoSlot.img.style.opacity = '1';
                    photoSlot.button.classList.add('show-button');
                    uploadedPhotoData[index] = e.target.result; // Armazena o Base64
                    localStorage.setItem(`uploadedPhoto${index + 1}`, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        photoSlot.button.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o envio do formulário ou clique no label
            photoSlot.img.src = '';
            photoSlot.img.style.display = 'none';
            photoSlot.img.style.opacity = '0';
            photoSlot.button.classList.remove('show-button');
            uploadedPhotoData[index] = ''; // Limpa o Base64
            localStorage.removeItem(`uploadedPhoto${index + 1}`);
            // Volta a exibir o texto "Foto X"
            photoSlot.input.parentElement.querySelector('.upload-text').style.display = 'block';
        });
    });

    personalMessageInput.addEventListener('input', (event) => {
        localStorage.setItem('personalMessage', event.target.value);
    });


    // === Event Listeners de Navegação ===
    goToEmojiPageButton.addEventListener('click', () => {
        showPage(page2);
    });

    backToConfigButton.addEventListener('click', () => {
        showPage(page1);
    });

    generateLinkButton.addEventListener('click', () => {
        // Coleta todos os dados para o link
        const params = new URLSearchParams();

        if (startDate) {
            params.set('date', startDate.toISOString());
        }
        const themeColor = themeColorPicker.value;
        params.set('color', themeColor.substring(1)); // Remove o #

        if (musicId) {
            params.set('music', musicId);
            if (musicNameInput.value) {
                params.set('musicName', encodeURIComponent(musicNameInput.value));
            }
        }

        selectedEmojis.forEach((emoji, index) => {
            if (emoji) params.set(`emoji${index + 1}`, encodeURIComponent(emoji));
        });

        if (personalMessageInput.value) {
            params.set('msg', encodeURIComponent(personalMessageInput.value));
        }

        // Adiciona as fotos em Base64 como múltiplos parâmetros 'photo'
        uploadedPhotoData.forEach(data => {
            if (data) params.append('photo', encodeURIComponent(data));
        });

        const shareLink = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        // Altera para o modo de visualização diretamente
        renderViewMode(params);
        showPage(viewModeDisplay);

        // Atualiza o histórico do navegador para refletir o novo URL
        window.history.pushState({}, '', shareLink);
    });

    copyShareLinkButton.addEventListener('click', () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                copyMessage.textContent = 'Link copiado!';
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                }, 2000);
            })
            .catch(err => {
                console.error('Falha ao copiar o link: ', err);
                copyMessage.textContent = 'Erro ao copiar!';
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                }, 2000);
            });
    });


    // === Inicialização da Aplicação ===
    function initialize() {
        const urlParams = parseURLParams();

        if (urlParams.date) {
            // Se houver parâmetros na URL, entra no modo de visualização
            renderViewMode(urlParams);
            showPage(viewModeDisplay);
        } else {
            // Caso contrário, carrega do localStorage e fica no modo de edição (Página 1)
            loadFromLocalStorage();
            showPage(page1);
        }

        // Atualiza a contagem a cada segundo
        clearInterval(countdownInterval); // Limpa qualquer intervalo anterior
        countdownInterval = setInterval(updateCountdown, 1000);

        // Garante que o player esteja invisível no início se não for modo de visualização com música
        if (!urlParams.music) {
            player.style.display = 'none';
        }
    }

    function loadFromLocalStorage() {
        // Carregar data
        const storedStartDate = localStorage.getItem('startDate');
        if (storedStartDate) {
            startDate = new Date(storedStartDate);
            startDatePicker.value = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().slice(0, -1);
        }

        // Carregar cor
        const storedThemeColor = localStorage.getItem('themeColor');
        if (storedThemeColor) {
            themeColorPicker.value = storedThemeColor;
            document.documentElement.style.setProperty('--main-color', storedThemeColor);
            document.documentElement.style.setProperty('--main-color-dark', tinycolor(storedThemeColor).darken(10).toString());
            document.documentElement.style.setProperty('--main-color-shadow', tinycolor(storedStartDate).setAlpha(0.4).toString());
            document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(storedStartDate).setAlpha(0.5).toString());
            document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(storedStartDate).setAlpha(0.1).toString());
        }

        // Carregar música
        musicId = localStorage.getItem('musicId') || '';
        musicTitle = localStorage.getItem('musicTitle') || '';
        musicLinkInput.value = musicId ? `https://www.youtube.com/watch?v=${musicId}` : '';
        musicNameInput.value = musicTitle;
        if (musicId) {
            musicLoadedMessage.textContent = `Música: "${musicTitle}" carregada!`;
            musicLoadedMessage.style.display = 'block';
            setTimeout(() => musicLoadedMessage.style.display = 'none', 3000);
        }

        // Carregar emojis
        emojiInputs.forEach((input, index) => {
            const storedEmoji = localStorage.getItem(`emoji${index + 1}`);
            if (storedEmoji) {
                input.value = storedEmoji;
                selectedEmojis[index] = storedEmoji;
            }
        });

        // Carregar mensagem
        const storedMessage = localStorage.getItem('personalMessage');
        if (storedMessage) {
            personalMessageInput.value = storedMessage;
        }

        // Carregar fotos
        uploadedPhotoData = [];
        photoUploads.forEach((photoSlot, index) => {
            const storedPhoto = localStorage.getItem(`uploadedPhoto${index + 1}`);
            if (storedPhoto) {
                photoSlot.img.src = storedPhoto;
                photoSlot.img.style.display = 'block';
                photoSlot.img.style.opacity = '1';
                photoSlot.button.classList.add('show-button');
                uploadedPhotoData[index] = storedPhoto;
                // Esconde o texto "Foto X"
                photoSlot.input.parentElement.querySelector('.upload-text').style.display = 'none';
            } else {
                 // Garante que o texto "Foto X" esteja visível se não houver foto
                photoSlot.input.parentElement.querySelector('.upload-text').style.display = 'block';
            }
        });
    }

    function renderViewMode(params) {
        // Limpa intervalos antigos
        clearInterval(countdownInterval);
        clearInterval(slideshowInterval);
        stopEmojiRain();

        // Aplicar cor do tema
        if (params.color) {
            const newColor = `#${params.color}`;
            document.documentElement.style.setProperty('--main-color', newColor);
            // Certifique-se de que tinycolor esteja carregado para estas funções
            if (typeof tinycolor !== 'undefined') {
                document.documentElement.style.setProperty('--main-color-dark', tinycolor(newColor).darken(10).toString());
                document.documentElement.style.setProperty('--main-color-shadow', tinycolor(newColor).setAlpha(0.4).toString());
                document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(newColor).setAlpha(0.5).toString());
                document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(newColor).setAlpha(0.1).toString());
            }
        }

        // Data Inicial
        if (params.date) {
            startDate = new Date(params.date);
            countdownInterval = setInterval(updateCountdown, 1000); // Inicia o contador
            updateCountdown(); // Atualiza imediatamente
        } else {
            countdownMessage.textContent = "Data inicial não definida.";
            exactTimeMessage.textContent = "";
        }

        // Música
        musicId = params.music || '';
        musicTitle = decodeURIComponent(params.musicName || '') || 'Música de Amor'; // Padrão se não houver nome
        if (musicId) {
            displayedMusicName.textContent = musicTitle;
            loadYouTubePlayer(musicId);
            displayedMusicName.parentElement.style.display = 'block'; // Mostra o container da música
        } else {
            displayedMusicName.parentElement.style.display = 'none'; // Esconde se não houver música
        }


        // Mensagem Personalizada
        if (params.msg) {
            displayedPersonalMessage.textContent = decodeURIComponent(params.msg);
            displayedPersonalMessage.classList.remove('hidden');
            displayedPersonalMessage.classList.add('show');
        } else {
            displayedPersonalMessage.classList.add('hidden');
            displayedPersonalMessage.classList.remove('show');
        }

        // Emojis
        selectedEmojis = [
            decodeURIComponent(params.emoji1 || ''),
            decodeURIComponent(params.emoji2 || ''),
            decodeURIComponent(params.emoji3 || '')
        ].filter(e => e); // Remove vazios
        if (selectedEmojis.length > 0) {
            startEmojiRain();
        }

        // Fotos
        // Limpa fotos antigas do slideshow
        photosContainer.innerHTML = '';
        const photosInUrl = params.photos;

        if (photosInUrl && photosInUrl.length > 0) {
            photosInUrl.forEach((base64Data) => {
                const imgElement = document.createElement('img');
                imgElement.src = decodeURIComponent(base64Data);
                // Adiciona a imagem a um uploader fictício para manter a estrutura do slideshow CSS
                const uploaderDiv = document.createElement('div');
                uploaderDiv.classList.add('photo-uploader');
                uploaderDiv.appendChild(imgElement);
                photosContainer.appendChild(uploaderDiv);
            });
            photosContainer.style.display = 'flex'; // Garante que o contêiner de fotos esteja visível
            startSlideshow();
        } else {
            photosContainer.style.display = 'none'; // Esconde se não houver fotos
        }

        // Exibe o botão de copiar link
        copyShareLinkButton.style.display = 'block';
    }


    // --- Carregamento inicial ---
    // Verifica se tinycolor.js está carregado, se não, carrega
    if (typeof tinycolor === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.6.0/tinycolor.min.js';
        script.onload = initialize; // Inicializa depois que tinycolor for carregado
        document.head.appendChild(script);
    } else {
        initialize(); // tinycolor já está carregado, inicializa diretamente
    }
});
