document.addEventListener('DOMContentLoaded', () => {
    // === Seletores de Elementos ===
    const container = document.querySelector('.container'); // Seleciona o container principal
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

        // Ajusta a altura do container para se adaptar à altura da página ativa
        // Aumenta um pouco o setTimeout para garantir que o layout seja renderizado antes do cálculo
        setTimeout(() => {
            const activePageHeight = pageToShow.scrollHeight; // Inclui o padding da página
            container.style.height = `${activePageHeight}px`;
            // Para garantir que o container não exceda a altura da viewport, especialmente em mobile com teclado
            container.style.maxHeight = `calc(100vh - 40px)`; // 40px para o padding do body
        }, 150); // Atraso um pouco maior (150ms)
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
        // Mostra dias se não houver meses/anos E se houver dias relevantes (não zero)
        if (displayParts.length < 2 && Math.floor(days % 30.44) > 0) displayParts.push(`${Math.floor(days % 30.44)} dia${Math.floor(days % 30.44) !== 1 ? 's' : ''}`);

        const displayString = displayParts.length > 0 ? displayParts.join(', ') : '0 dias';

        const exactTimeString = `${years} ano${years !== 1 ? 's' : ''}, ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}, ${Math.floor(days % 30.44)} dia${Math.floor(days % 30.44) !== 1 ? 's' : ''}\n${remainingHours} hora${remainingHours !== 1 ? 's' : ''}, ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;

        return { display: displayString, exact: exactTimeString };
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
        stopSlideshow(); // Limpa qualquer slideshow anterior
        const photos = photosContainer.querySelectorAll('img');
        if (photos.length === 0) {
            photosContainer.style.display = 'none'; // Esconde se não houver fotos
            return;
        }
        photosContainer.style.display = 'flex'; // Garante que o container esteja visível
        photosContainer.classList.add('slideshow-mode'); // Adiciona a classe para o CSS do slideshow

        currentSlide = 0; // Reinicia o slide
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
        photosContainer.classList.remove('slideshow-mode'); // Remove a classe do slideshow
        // Certifica-se de que todas as imagens estejam ocultas após parar o slideshow
        photosContainer.querySelectorAll('img').forEach(img => img.classList.remove('active'));
    }

    function startEmojiRain() {
        stopEmojiRain(); // Limpa qualquer chuva de emojis anterior
        if (selectedEmojis.filter(e => e).length === 0) return; // Não inicia se não houver emojis
        emojiRainContainer.style.display = 'block';

        // Usa requestAnimationFrame para animação suave
        const createEmoji = () => {
            const emoji = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
            if (!emoji) return;

            const span = document.createElement('span');
            span.classList.add('falling-emoji');
            span.textContent = emoji;
            span.style.left = `${Math.random() * 100}vw`;
            span.style.animationDuration = `${Math.random() * 3 + 2}s`;
            span.style.animationDelay = `${Math.random() * 2}s`;
            emojiRainContainer.appendChild(span);

            span.addEventListener('animationend', () => {
                span.remove();
            });
        };

        // Cria emojis em intervalos regulares
        // Guarde o ID do setInterval para poder limpá-lo com stopEmojiRain
        emojiRainContainer.intervalId = setInterval(createEmoji, 300);
    }

    function stopEmojiRain() {
        emojiRainContainer.style.display = 'none';
        if (emojiRainContainer.intervalId) {
            clearInterval(emojiRainContainer.intervalId);
        }
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
        // Verifica se tinycolor está carregado antes de usar
        if (typeof tinycolor !== 'undefined') {
            document.documentElement.style.setProperty('--main-color-dark', tinycolor(newColor).darken(10).toString());
            document.documentElement.style.setProperty('--main-color-shadow', tinycolor(newColor).setAlpha(0.4).toString());
            document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(newColor).setAlpha(0.5).toString());
            document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(newColor).setAlpha(0.1).toString());
        }
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
                    // Esconde o texto "Foto X"
                    photoSlot.input.parentElement.querySelector('.upload-text').style.display = 'none';
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

        if (urlParams.date || urlParams.music || urlParams.emoji1 || urlParams.photos.length > 0 || urlParams.msg) {
            // Se houver parâmetros na URL, entra no modo de visualização
            renderViewMode(urlParams);
            showPage(viewModeDisplay);
        } else {
            // Caso contrário, carrega do localStorage e fica no modo de edição (Página 1)
            loadFromLocalStorage();
            showPage(page1); // Garante que a página 1 seja mostrada ao iniciar sem parâmetros
        }

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
            // Ajusta o fuso horário para exibir corretamente no input datetime-local
            startDatePicker.value = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().slice(0, -1);
            updateCountdown(); // Atualiza o contador na tela de edição
        } else {
            countdownMessage.textContent = "Selecione a data inicial"; // Mensagem padrão para a tela de edição
            exactTimeMessage.textContent = "";
        }

        // Carregar cor
        const storedThemeColor = localStorage.getItem('themeColor');
        if (storedThemeColor) {
            themeColorPicker.value = storedThemeColor;
            document.documentElement.style.setProperty('--main-color', storedThemeColor);
            if (typeof tinycolor !== 'undefined') {
                document.documentElement.style.setProperty('--main-color-dark', tinycolor(storedThemeColor).darken(10).toString());
                document.documentElement.style.setProperty('--main-color-shadow', tinycolor(storedThemeColor).setAlpha(0.4).toString());
                document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(storedThemeColor).setAlpha(0.5).toString());
                document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(storedThemeColor).setAlpha(0.1).toString());
            }
        }

        // Carregar música
        musicId = localStorage.getItem('musicId') || '';
        musicTitle = localStorage.getItem('musicTitle') || '';
        if (musicId) {
            // Note: O link do YouTube para display no input é diferente do embed
            musicLinkInput.value = `https://www.youtube.com/watch?v=${musicId}`;
            musicNameInput.value = musicTitle;
            musicLoadedMessage.textContent = `Música: "${musicTitle}" carregada!`;
            musicLoadedMessage.style.display = 'block';
            setTimeout(() => musicLoadedMessage.style.display = 'none', 3000);
        } else {
            musicLinkInput.value = '';
            musicNameInput.value = '';
        }


        // Carregar emojis
        emojiInputs.forEach((input, index) => {
            const storedEmoji = localStorage.getItem(`emoji${index + 1}`);
            if (storedEmoji) {
                input.value = storedEmoji;
                selectedEmojis[index] = storedEmoji;
            } else {
                input.value = ''; // Garante que o campo esteja vazio se não houver emoji armazenado
                selectedEmojis[index] = '';
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
                photoSlot.img.src = '';
                photoSlot.img.style.display = 'none';
                photoSlot.img.style.opacity = '0';
                photoSlot.button.classList.remove('show-button');
                uploadedPhotoData[index] = '';
            }
        });
    }

    function renderViewMode(params) {
        // Limpa intervalos antigos e elementos visuais de edição
        clearInterval(countdownInterval);
        stopSlideshow();
        stopEmojiRain();
        player.src = ''; // Limpa o player de música
        displayedMusicName.parentElement.style.display = 'none'; // Esconde o contêiner da música
        photosContainer.innerHTML = ''; // Limpa fotos antigas do slideshow

        // Aplicar cor do tema
        if (params.color) {
            const newColor = `#${params.color}`;
            document.documentElement.style.setProperty('--main-color', newColor);
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
        const photosInUrl = params.photos;

        if (photosInUrl && photosInUrl.length > 0) {
            photosInUrl.forEach((base64Data) => {
                const imgElement = document.createElement('img');
                imgElement.src = decodeURIComponent(base64Data);
                // Adiciona a imagem a um uploader fictício para manter a estrutura do slideshow CSS
                const uploaderDiv = document.createElement('div');
                uploaderDiv.classList.add('photo-uploader'); // Mantém a classe para o estilo de foto no slideshow
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

    // Adiciona um listener para redimensionamento para ajustar a altura do container dinamicamente
    // Isso é especialmente útil quando o teclado virtual do celular aparece/desaparece
    window.addEventListener('resize', () => {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            container.style.height = `${activePage.scrollHeight}px`;
            container.style.maxHeight = `calc(100vh - 40px)`; // Reajusta max-height em redimensionamento
        }
    });
});
