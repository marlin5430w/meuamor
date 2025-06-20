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
    const backToPage2Button = document.getElementById('backToPage2Button');
    const customMessageInput = document.getElementById('customMessage');
    const copyMessage = document.getElementById('copyMessage');
    const photoUploaders = document.querySelectorAll('.photo-uploader');
    const removePhotoButtons = document.querySelectorAll('.remove-photo-button');
    const emojiInputs = document.querySelectorAll('.emoji-input');

    // Páginas
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');

    // Estado da aplicação
    let startDate = new Date('2023-10-14T00:00:00'); // Data inicial padrão
    let currentThemeColor = themeColorInput.value;
    let musicData = { link: '', name: '' };
    let photos = ['', '', '']; // Armazena URLs de imagens (base64 ou URL)
    let photoFiles = [null, null, null]; // Armazena os objetos File para Slideshow (usado para gerar o link)
    let currentPhotoIndex = 0;
    let photoSlideshowInterval;
    let player; // Variável global para o player do YouTube

    // --- Funções Auxiliares ---

    // Função para alternar páginas
    function showPage(pageToShow) {
        console.log('Tentando mostrar página:', pageToShow.id); // Log para depuração
        [page1, page2, page3].forEach(page => {
            if (page === pageToShow) {
                page.classList.remove('hidden');
                page.classList.add('active');
                console.log(page.id, 'agora é ATIVA');
            } else {
                page.classList.add('hidden');
                page.classList.remove('active');
                console.log(page.id, 'agora é ESCONDIDA');
            }
        });
        // Scrolla para o topo da nova página ativa
        if (pageToShow) {
            pageToShow.scrollTop = 0;
        }
    }

    // Carregar dados salvos no Local Storage
    function loadSavedData() {
        const savedDate = localStorage.getItem('startDate');
        if (savedDate) {
            startDate = new Date(savedDate);
            // Formata a data para o input datetime-local, ajustando para o fuso horário local
            startDateInput.value = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().slice(0, -8);
        }

        const savedColor = localStorage.getItem('themeColor');
        if (savedColor) {
            currentThemeColor = savedColor;
            themeColorInput.value = savedColor;
            applyThemeColor(currentThemeColor); // Aplica a cor ao carregar
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
                if (imgPreview) {
                    imgPreview.src = photo;
                    imgPreview.style.opacity = '1';
                    imgPreview.nextElementSibling.style.display = 'none'; // Esconde o texto "Foto X"
                    const removeBtn = photoUploaders[index].querySelector('.remove-photo-button');
                    if (removeBtn) removeBtn.classList.add('show-button');
                }
            }
        });

        const savedEmojis = JSON.parse(localStorage.getItem('emojis')) || ['', '', ''];
        emojiInputs.forEach((input, index) => {
            input.value = savedEmojis[index] || '';
        });
    }

    // Salvar dados no Local Storage
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

    // Aplica a cor do tema a todas as variáveis CSS
    function applyThemeColor(color) {
        document.documentElement.style.setProperty('--main-color', color);
        // Atualiza as cores secundárias baseadas na cor principal
        // Garante que tinycolor está definido antes de usá-lo
        if (typeof tinycolor !== 'undefined') {
            document.documentElement.style.setProperty('--main-color-dark', tinycolor(color).darken(10).toString());
            document.documentElement.style.setProperty('--main-color-shadow', tinycolor(color).setAlpha(0.4).toRgbString());
            document.documentElement.style.setProperty('--main-color-border-dash', tinycolor(color).setAlpha(0.5).toRgbString());
            document.documentElement.style.setProperty('--main-color-hover-bg', tinycolor(color).setAlpha(0.1).toRgbString());
        }
    }

    // Função para converter uma URL de vídeo do YouTube em um ID de vídeo
    function getYouTubeVideoId(url) {
        let videoId = '';
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match && match[1]) {
            videoId = match[1];
        }
        return videoId;
    }

    // Iniciar o contador de tempo
    function updateCounter() {
        const now = new Date();
        const diff = now.getTime() - startDate.getTime(); // Diferença em milissegundos

        if (diff < 0) { // Se a data for no futuro
            document.getElementById('counterDisplay').textContent = "Ainda não chegou a data!";
            return;
        }

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30.44); // Média de dias por mês
        const years = Math.floor(days / 365.25); // Média de dias por ano

        const remainingMonths = months % 12;
        const remainingDays = days % 30; // Aproximação, para melhor precisão precisaria de cálculos de data mais complexos
        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        document.getElementById('counterDisplay').textContent =
            `${years} ano${years !== 1 ? 's' : ''}, ` +
            `${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}, ` +
            `${remainingDays} dia${remainingDays !== 1 ? 's' : ''}\n` +
            `${remainingHours} hora${remainingHours !== 1 ? 's' : ''}, ` +
            `${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''} e ` +
            `${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
    }

    // Chuva de Emojis
    function startEmojiRain() {
        const emojiRainContainer = document.getElementById('emojiRainContainer');
        const emojisToRain = Array.from(emojiInputs).map(input => input.value).filter(Boolean); // Pega emojis preenchidos
        if (emojisToRain.length === 0) {
            emojiRainContainer.style.display = 'none';
            return;
        }
        emojiRainContainer.style.display = 'block';

        // Limpa emojis existentes para evitar duplicação
        emojiRainContainer.innerHTML = '';

        const createEmoji = () => {
            const emoji = document.createElement('span');
            emoji.classList.add('falling-emoji');
            emoji.textContent = emojisToRain[Math.floor(Math.random() * emojisToRain.length)];
            emoji.style.left = `${Math.random() * 100}vw`;
            emoji.style.animationDuration = `${Math.random() * 3 + 2}s`; // 2 to 5 seconds
            emoji.style.animationDelay = `${Math.random() * 5}s`; // Delay up to 5 seconds
            emojiRainContainer.appendChild(emoji);

            emoji.addEventListener('animationend', () => {
                emoji.remove();
            });
        };

        // Cria um número razoável de emojis. Ajuste conforme necessário.
        for (let i = 0; i < 30; i++) {
            createEmoji();
        }

        // Garante que a chuva continue
        setInterval(createEmoji, 500); // Adiciona um novo emoji a cada 0.5s
    }

    // Gerenciar o player do YouTube
    function onYouTubeIframeAPIReady() {
        const videoId = getYouTubeVideoId(musicData.link);
        if (videoId) {
            if (player) { // Se o player já existe, destruí-lo antes de criar um novo
                player.destroy();
            }
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
             // Esconde o player se não houver música
            document.getElementById('player').innerHTML = ''; // Limpa o div do player
            document.querySelector('.music-player-display').style.display = 'none';
            document.getElementById('musicInfoDisplay').classList.add('hidden');
        }
    }
    // Garante que a função esteja no escopo global para a API do YouTube
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady; 

    function onPlayerReady(event) {
        event.target.playVideo();
        document.querySelector('.music-player-display').style.display = 'block';
        document.getElementById('musicInfoDisplay').textContent = musicData.name || "Música Carregada";
        document.getElementById('musicInfoDisplay').classList.remove('hidden');
    }

    function onPlayerStateChange(event) {
        // Implementar lógica de loop ou outras reações ao estado do player
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
        applyThemeColor(currentThemeColor); // Aplica a cor imediatamente
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
            // Se já estiver na página de visualização, tenta carregar o player
            if (page3.classList.contains('active') && typeof YT !== 'undefined' && YT.Player) {
                onYouTubeIframeAPIReady();
            }
        } else {
            alert('Por favor, insira um link do YouTube válido.');
        }
    });

    // Adiciona event listeners para os inputs de arquivo
    photoUploaders.forEach((uploader, index) => {
        const fileInput = uploader.querySelector('.hidden-file-input');
        const imgPreview = uploader.querySelector('img');
        const uploadText = uploader.querySelector('.upload-text');
        const removeBtn = uploader.querySelector('.remove-photo-button');

        // Adiciona listener para o input de arquivo (o que realmente recebe o arquivo)
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                photoFiles[index] = file; // Salva o objeto File para potencial upload (se necessário)
                const reader = new FileReader();
                reader.onload = (e) => {
                    photos[index] = e.target.result; // Salva o Base64 para exibição e link
                    imgPreview.src = e.target.result;
                    imgPreview.style.opacity = '1';
                    uploadText.style.display = 'none'; // Esconde o texto
                    removeBtn.classList.add('show-button');
                    saveAllData();
                };
                reader.readAsDataURL(file);
            }
        });

        // Adiciona listener para o botão de remover foto
        removeBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique no botão de remover acione o uploader de arquivo
            photos[index] = '';
            photoFiles[index] = null; // Limpa o objeto File
            imgPreview.src = '';
            imgPreview.style.opacity = '0';
            uploadText.style.display = 'block'; // Mostra o texto novamente
            removeBtn.classList.remove('show-button');
            saveAllData();
        });

        // Adiciona listener para o custom-file-upload (o label)
        const customUploadLabel = uploader.querySelector('.custom-file-upload');
        if (customUploadLabel) {
            customUploadLabel.addEventListener('click', () => {
                fileInput.click(); // Redireciona o clique do label para o input file real
            });
        }
    });

    emojiInputs.forEach(input => {
        input.addEventListener('input', saveAllData);
    });

    customMessageInput.addEventListener('input', saveAllData);

    // --- Navegação entre Páginas ---
    nextPage1Button.addEventListener('click', () => {
        console.log('Clicou em Próximo: Emojis e Fotos'); // Log de depuração
        showPage(page2);
    });

    backToPage1Button.addEventListener('click', () => {
        console.log('Clicou em Voltar para Página 1'); // Log de depuração
        showPage(page1);
    });

    backToPage2Button.addEventListener('click', () => {
        console.log('Clicou em Voltar para Edição'); // Log de depuração
        showPage(page2);
        clearInterval(photoSlideshowInterval); // Para o slideshow ao voltar para edição
        photoSlideshowInterval = null; // Zera a variável do intervalo
        if (player) {
            player.destroy(); // Destrói o player do YouTube
            player = null;
        }
        document.getElementById('emojiRainContainer').style.display = 'none'; // Esconde a chuva de emojis
        document.getElementById('slideshowContainer').innerHTML = ''; // Limpa o slideshow
        document.getElementById('musicInfoDisplay').classList.add('hidden'); // Esconde info da musica
    });

    // --- Botão Gerar Link Compartilhável (CRÍTICO) ---
    generateLinkButton.addEventListener('click', async () => {
        console.log('Clicou em Gerar Link Compartilhável'); // Log de depuração
        await generateShareLink();
    });

    // Função para gerar o link compartilhável
    async function generateShareLink() {
        const baseUrl = window.location.origin + window.location.pathname; // marlin5430w.github.io/index.html
        const params = new URLSearchParams();

        // Adiciona a data
        params.append('date', startDate.toISOString());

        // Adiciona a cor do tema
        params.append('color', currentThemeColor.replace('#', '')); // Remove o # para a URL

        // Adiciona link e nome da música, se existirem
        if (musicData.link) {
            params.append('musicLink', musicData.link);
            if (musicData.name) {
                params.append('musicName', musicData.name);
            }
        }

        // Adiciona emojis
        const emojis = Array.from(emojiInputs).map(input => input.value).filter(Boolean);
        if (emojis.length > 0) {
            params.append('emojis', emojis.join(','));
        }

        // Adiciona mensagem personalizada
        if (customMessageInput.value) {
            params.append('message', customMessageInput.value);
        }

        // Adiciona fotos (converta para Base64 ou armazene de forma eficiente se for muita coisa)
        const photosBase64 = photos.filter(Boolean);
        if (photosBase64.length > 0) {
            params.append('photos', JSON.stringify(photosBase64));
        }

        const shareLink = `${baseUrl}?${params.toString()}`;

        try {
            await navigator.clipboard.writeText(shareLink);
            copyMessage.classList.add('show');
            setTimeout(() => {
                copyMessage.classList.remove('show');
            }, 3000); // Esconde a mensagem após 3 segundos

            // Após gerar e copiar o link, muda para a página de visualização
            showPage(page3);
            updateViewModeContent(); // Atualiza o conteúdo da página 3
        } catch (err) {
            console.error('Falha ao copiar o link: ', err);
            // Mensagem de alerta mais amigável para o usuário
            alert('Não foi possível copiar o link automaticamente. Por favor, copie e cole manualmente:\n\n' + shareLink);
        }
    }

    // --- Funções para a Página de Visualização (Page 3) ---
    function updateViewModeContent() {
        const urlParams = new URLSearchParams(window.location.search);

        // Data
        const dateParam = urlParams.get('date');
        if (dateParam) {
            startDate = new Date(dateParam);
            updateCounter();
            setInterval(updateCounter, 1000);
        } else {
            // Se não houver data na URL, usa a data do local storage
            updateCounter();
            setInterval(updateCounter, 1000);
        }

        // Cor do Tema
        const colorParam = urlParams.get('color');
        if (colorParam) {
            const loadedColor = '#' + colorParam;
            applyThemeColor(loadedColor); // Aplica a cor carregada da URL
        }

        // Mensagem Personalizada
        const messageParam = urlParams.get('message');
        const viewModeMessageElement = document.getElementById('viewModeMessage');
        if (messageParam) {
            viewModeMessageElement.textContent = messageParam;
            viewModeMessageElement.classList.remove('hidden');
        } else {
            viewModeMessageElement.classList.add('hidden');
        }

        // Emojis (para chuva de emojis)
        const emojisParam = urlParams.get('emojis');
        if (emojisParam) {
            const loadedEmojis = emojisParam.split(',');
            // Atualiza os inputs de emoji para a chuva de emojis usar os da URL
            emojiInputs.forEach((input, index) => {
                input.value = loadedEmojis[index] || '';
            });
            startEmojiRain();
        }

        // Fotos (para slideshow)
        const photosParam = urlParams.get('photos');
        const slideshowContainer = document.getElementById('slideshowContainer');
        slideshowContainer.innerHTML = ''; // Limpa qualquer conteúdo anterior
        if (photosParam) {
            const loadedPhotos = JSON.parse(photosParam);
            if (loadedPhotos.length > 0) {
                photoFiles = loadedPhotos; // Usa as URLs Base64 diretamente para o slideshow
                startSlideshow();
            } else {
                slideshowContainer.style.display = 'none'; // Esconde se não houver fotos
            }
        } else {
            slideshowContainer.style.display = 'none'; // Esconde se não houver fotos na URL
        }

        // Música (YouTube Embed)
        const musicLinkParam = urlParams.get('musicLink');
        const musicNameParam = urlParams.get('musicName');
        
        if (musicLinkParam) {
            musicData.link = musicLinkParam;
            musicData.name = musicNameParam || '';
            // Carrega o script da API do YouTube se ainda não foi carregado
            if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                // A função onYouTubeIframeAPIReady será chamada automaticamente
            } else {
                onYouTubeIframeAPIReady(); // Se já estiver pronto, chama imediatamente
            }
        } else {
            // Esconde o player se não houver música na URL
            document.getElementById('player').innerHTML = '';
            document.querySelector('.music-player-display').style.display = 'none';
            document.getElementById('musicInfoDisplay').classList.add('hidden');
        }
    }

    // Iniciar Slideshow de Fotos
    function startSlideshow() {
        if (photoFiles.length === 0) {
            document.getElementById('slideshowContainer').style.display = 'none';
            return;
        }

        document.getElementById('slideshowContainer').style.display = 'block';
        const slideshowContainer = document.getElementById('slideshowContainer');
        slideshowContainer.innerHTML = ''; // Limpa o container antes de adicionar imagens

        // Cria os elementos de imagem para o slideshow
        photoFiles.forEach((photoSrc, index) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('photo-uploader'); // Reutiliza o estilo do uploader
            const img = document.createElement('img');
            img.src = photoSrc;
            img.alt = `Foto ${index + 1}`;
            img.classList.add('slideshow-photo'); // Nova classe para as imagens do slideshow
            if (index === 0) {
                img.classList.add('active'); // Primeira imagem ativa
            }
            imgWrapper.appendChild(img);
            slideshowContainer.appendChild(imgWrapper);
        });

        currentPhotoIndex = 0;
        const slideshowPhotos = slideshowContainer.querySelectorAll('.slideshow-photo');

        clearInterval(photoSlideshowInterval); // Garante que nenhum intervalo anterior esteja rodando

        if (slideshowPhotos.length > 1) {
            photoSlideshowInterval = setInterval(() => {
                slideshowPhotos[currentPhotoIndex].classList.remove('active');
                currentPhotoIndex = (currentPhotoIndex + 1) % slideshowPhotos.length;
                slideshowPhotos[currentPhotoIndex].classList.add('active');
            }, 3000); // Troca a cada 3 segundos
        } else if (slideshowPhotos.length === 1) {
            slideshowPhotos[0].classList.add('active'); // Garante que a única foto seja exibida
        }
    }

    // Polyfill básico para tinycolor, caso não esteja carregado
    // (Útil se você não estiver usando um CDN para tinycolor.js)
    if (typeof tinycolor === 'undefined') {
        window.tinycolor = function(color) {
            let r, g, b, a = 1;
            // Tenta parsear hex
            if (color && typeof color === 'string' && color.startsWith('#') && color.length === 7) {
                r = parseInt(color.substring(1, 3), 16);
                g = parseInt(color.substring(3, 5), 16);
                b = parseInt(color.substring(5, 7), 16);
            }
            // Retorna um objeto com métodos essenciais
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
                    return this.toRgbString();
                }
            };
        };
    }

    // --- Inicialização ---

    loadSavedData(); // Carrega os dados salvos ao iniciar
    applyThemeColor(currentThemeColor); // Aplica a cor do tema salva ou padrão

    // Verifica se há parâmetros na URL (indicando que a página foi compartilhada)
    if (window.location.search) {
        showPage(page3); // Mostra a página de visualização se houver parâmetros
        updateViewModeContent();
    } else {
        showPage(page1); // Caso contrário, mostra a página de configuração inicial
    }

    // Adiciona o script da API do YouTube dinamicamente (se não for carregado via HTML)
    // Movido para dentro do DOMContentLoaded para garantir que o script seja inserido após o carregamento do DOM.
    // O script do YouTube é carregado se for necessário para a página 3 ou se a página 3 for acessada.
    // A linha <script src="https://www.youtube.com/iframe_api"></script> no HTML é incorreta.
    // A URL correta é https://www.youtube.com/iframe_api
    // Remova a linha incorreta do HTML e deixe o JS carregar se for preciso.
});

// Fora do DOMContentLoaded, a função onYouTubeIframeAPIReady precisa ser global.
// Se você está incluindo <script src="https://www.youtube.com/iframe_api"></script> no seu HTML,
// então esta função global será chamada automaticamente quando a API estiver pronta.
// Se você não está incluindo, ela será definida e aguardará o carregamento dinâmico.
// Se já definida acima, não precisa repetir.
