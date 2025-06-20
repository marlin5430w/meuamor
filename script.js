document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const dateInputContainer = document.getElementById('dateInputContainer');
    const startDatePicker = document.getElementById('startDatePicker');
    const setStartDateButton = document.getElementById('setStartDateButton');
    const yearsMonthsDaysElement = document.getElementById('years-months-days');
    const hoursMinutesSecondsElement = document.getElementById('hours-minutes-seconds');
    const generateLinkButton = document.getElementById('generateLinkButton');
    const copyMessage = document.getElementById('copyMessage');

    const themeColorPicker = document.getElementById('themeColorPicker');
    const colorPickerContainer = document.querySelector('.color-picker-container');

    const photosContainer = document.querySelector('.photos-container');
    const photoUploaders = [
        document.querySelector('.photos-container > .photo-uploader:nth-child(1)'),
        document.querySelector('.photos-container > .photo-uploader:nth-child(2)'),
        document.querySelector('.photos-container > .photo-uploader:nth-child(3)')
    ];

    const imageUploads = [
        document.getElementById('imageUpload1'),
        document.getElementById('imageUpload2'),
        document.getElementById('imageUpload3')
    ];
    const imagePreviews = [
        document.getElementById('imagePreview1'),
        document.getElementById('imagePreview2'),
        document.getElementById('imagePreview3')
    ];

    const removePhotoButtons = document.querySelectorAll('.remove-photo-button');

    const personalMessageInput = document.getElementById('personalMessageInput');
    const personalMessageDisplay = document.getElementById('personalMessageDisplay');
    const messageSlot = document.getElementById('messageSlot');

    const musicInputContainer = document.getElementById('musicInputContainer');
    const musicLinkInput = document.getElementById('musicLinkInput');
    const loadMusicButton = document.getElementById('loadMusicButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const youtubePlayer = document.getElementById('youtubePlayer');
    const musicStatus = document.getElementById('musicStatus');
    // NOVO: Botão para trocar a música
    const changeMusicButton = document.getElementById('changeMusicButton');

    let startDate = null;
    let currentThemeColor = '#ff007f';
    let countdownInterval;
    let slideshowInterval;
    let currentImageIndex = 0;
    let activeImages = [];
    let currentMusicLink = '';

    // --- Funções de Aplicação de Tema e Visibilidade ---
    function applyThemeColor(color) {
        root.style.setProperty('--main-color', color);
        const hexToRgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
        const rgb = hexToRgb(color);
        const darkerRgb = rgb.map(c => Math.max(0, c - 30));
        root.style.setProperty('--main-color-dark', `rgb(${darkerRgb.join(',')})`);
        root.style.setProperty('--main-color-shadow', `rgba(${rgb.join(',')}, 0.4)`);
        root.style.setProperty('--main-color-border-dash', `rgba(${rgb.join(',')}, 0.5)`);
        root.style.setProperty('--main-color-hover-bg', `rgba(${rgb.join(',')}, 0.1)`);
    }

    function hideEditingElements() {
        dateInputContainer.classList.add('hidden');
        musicInputContainer.classList.add('hidden');
        photosContainer.classList.add('slideshow-mode');

        photoUploaders.forEach(uploader => {});
        if (generateLinkButton) generateLinkButton.classList.add('hidden');
        // NOVO: Mostra o botão "Trocar Música" no modo de visualização, se houver música
        if (currentMusicLink) {
            changeMusicButton.classList.remove('hidden');
        } else {
            changeMusicButton.classList.add('hidden');
        }


        personalMessageInput.classList.add('hidden');
        personalMessageDisplay.classList.add('show');

        removePhotoButtons.forEach(button => button.classList.remove('show-button'));

        updateActiveImages();
        startSlideshow();
        playLoadedMusic();
    }

    function showEditingElements() {
        // Esconde o botão "Trocar Música" no modo de edição
        changeMusicButton.classList.add('hidden');

        dateInputContainer.classList.remove('hidden');
        musicInputContainer.classList.remove('hidden');
        photosContainer.classList.remove('slideshow-mode');

        photoUploaders.forEach(uploader => {});
        if (generateLinkButton) generateLinkButton.classList.remove('hidden');

        personalMessageInput.classList.remove('hidden');
        personalMessageDisplay.classList.remove('show');

        clearInterval(slideshowInterval);

        imagePreviews.forEach((img, index) => {
            img.classList.remove('active');
            img.style.opacity = '';
            img.style.zIndex = '';
            if (!img.src.includes('via.placeholder.com')) {
                removePhotoButtons[index].classList.add('show-button');
            } else {
                removePhotoButtons[index].classList.remove('show-button');
            }
        });

        stopMusic();
    }

    // --- Lógica do Slideshow (mantida da versão anterior) ---
    function startSlideshow() {
        clearInterval(slideshowInterval);

        if (activeImages.length === 0) {
            console.log("Nenhuma imagem para o slideshow. Mostrando placeholders.");
            imagePreviews.forEach((img, index) => {
                img.classList.remove('active');
                img.src = 'https://via.placeholder.com/150x150?text=Sem+Fotos';
                img.style.opacity = '1';
                img.style.zIndex = '1';
                photoUploaders[index].style.opacity = '1';
                photoUploaders[index].style.position = 'relative';
                photoUploaders[index].style.transform = 'none';
            });
            photosContainer.classList.add('slideshow-mode');
            return;
        } else {
            photoUploaders.forEach(uploader => {
                 uploader.style.position = 'absolute';
                 uploader.style.transform = 'translate(-50%, -50%)';
                 uploader.style.opacity = '0';
                 uploader.style.zIndex = '1';
            });
            photosContainer.classList.add('slideshow-mode');
        }

        imagePreviews.forEach(img => {
            img.classList.remove('active');
            img.style.opacity = '0';
            img.style.zIndex = '1';
        });

        currentImageIndex = 0;

        activeImages[currentImageIndex].classList.add('active');
        activeImages[currentImageIndex].style.opacity = '1';
        activeImages[currentImageIndex].style.zIndex = '2';
        photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '1';
        photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '2';

        slideshowInterval = setInterval(() => {
            activeImages[currentImageIndex].classList.remove('active');
            activeImages[currentImageIndex].style.opacity = '0';
            activeImages[currentImageIndex].style.zIndex = '1';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '0';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '1';

            currentImageIndex = (currentImageIndex + 1) % activeImages.length;

            activeImages[currentImageIndex].classList.add('active');
            activeImages[currentImageIndex].style.opacity = '1';
            activeImages[currentImageIndex].style.zIndex = '2';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '1';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '2';

        }, 1000);
    }

    function updateActiveImages() {
        activeImages = imagePreviews.filter(img => !img.src.includes('via.placeholder.com'));
        console.log("Imagens ativas para slideshow:", activeImages.map(img => img.src));

        if (!photosContainer.classList.contains('slideshow-mode')) {
            imagePreviews.forEach((img, index) => {
                if (!img.src.includes('via.placeholder.com')) {
                    removePhotoButtons[index].classList.add('show-button');
                } else {
                    removePhotoButtons[index].classList.remove('show-button');
                }
            });
        }

        if (dateInputContainer.classList.contains('hidden')) {
            startSlideshow();
        }
    }

    // --- Lógica da Música ---
    function isYouTubeLink(url) {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    function getYouTubeVideoId(url) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
        const match = url.match(youtubeRegex);
        return match ? match[1] : null;
    }

    function loadMusic(link) {
        stopMusic();

        if (!link) {
            musicStatus.textContent = "Nenhuma música carregada.";
            musicStatus.classList.add('show');
            currentMusicLink = ''; // Limpa o link da música se for vazio
            localStorage.removeItem('musicLink'); // Remove do LocalStorage
            return;
        }

        currentMusicLink = link;
        localStorage.setItem('musicLink', link);

        const youtubeId = getYouTubeVideoId(link);
        if (youtubeId) {
            audioPlayer.style.display = 'none';
            youtubePlayer.style.display = 'block';
            youtubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&mute=0`;
            musicStatus.textContent = "Música do YouTube carregada!";
            musicStatus.classList.add('show');
            setTimeout(() => musicStatus.classList.remove('show'), 3000);
            return;
        }

        try {
            audioPlayer.src = link;
            audioPlayer.style.display = 'block';
            youtubePlayer.style.display = 'none';
            audioPlayer.load();
            audioPlayer.play().then(() => {
                musicStatus.textContent = "Música carregada e tocando!";
                musicStatus.classList.add('show');
                setTimeout(() => musicStatus.classList.remove('show'), 3000);
            }).catch(error => {
                console.error("Erro ao tocar a música:", error);
                musicStatus.textContent = "Erro ao tocar. Verifique o link ou se o navegador permite autoplay.";
                musicStatus.classList.add('show');
            });
        } catch (e) {
            console.error("Erro ao carregar link de áudio:", e);
            musicStatus.textContent = "Não foi possível carregar esta música. Tente outro link.";
            musicStatus.classList.add('show');
        }
    }

    function stopMusic() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.style.display = 'none';
        youtubePlayer.src = '';
        youtubePlayer.style.display = 'none';
    }

    function playLoadedMusic() {
        if (!currentMusicLink) {
            stopMusic(); // Garante que nenhum player esteja visível se não houver link
            return;
        }

        const youtubeId = getYouTubeVideoId(currentMusicLink);
        if (youtubeId) {
            youtubePlayer.style.display = 'block';
            youtubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&mute=0`;
        } else if (audioPlayer.src === currentMusicLink) { // Verifica se o SRC já está configurado
            audioPlayer.style.display = 'block';
            audioPlayer.play().catch(error => {
                console.warn("Autoplay de áudio bloqueado:", error);
            });
        } else { // Se o SRC do audioPlayer não corresponde ao currentMusicLink (pode ter sido limpo)
            loadMusic(currentMusicLink); // Recarrega a música para garantir
        }
    }


    // --- Lógica de Carregamento (Prioridade: URL Hash > localStorage) ---
    const hashParams = window.location.hash.substring(1);

    if (hashParams) {
        // Modo de visualização (link gerado)
        try {
            const decodedParams = decodeURIComponent(hashParams);
            const data = JSON.parse(decodedParams);

            if (data.startDate) {
                startDate = new Date(data.startDate);
                if (isValidDate(startDate)) {
                    startCountdown();
                } else {
                    console.error("Data inválida no link.");
                    startDate = null;
                }
            } else {
                startDate = null;
            }

            let imagesToLoadCount = 0;
            if (data.images && Array.isArray(data.images)) {
                 imagesToLoadCount = data.images.filter(imgData => imgData && typeof imgData === 'string' && imgData.startsWith('data:image')).length;
            }

            if (imagesToLoadCount > 0) {
                let loadedCount = 0;
                data.images.forEach((imgData, index) => {
                    if (imagePreviews[index]) {
                        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
                            imagePreviews[index].onload = () => {
                                loadedCount++;
                                if (loadedCount === imagesToLoadCount) {
                                    updateActiveImages();
                                }
                            };
                            imagePreviews[index].src = imgData;
                        } else {
                            imagePreviews[index].src = 'https://via.placeholder.com/150x150?text=Foto+' + (index + 1);
                        }
                    }
                });
            } else {
                imagePreviews.forEach((img, index) => {
                    img.src = 'https://via.placeholder.com/150x150?text=Sem+Fotos';
                });
                updateActiveImages();
            }


            if (data.themeColor && typeof data.themeColor === 'string' && data.themeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                currentThemeColor = data.themeColor;
                themeColorPicker.value = currentThemeColor;
                applyThemeColor(currentThemeColor);
            }

            if (data.personalMessage && typeof data.personalMessage === 'string') {
                personalMessageDisplay.textContent = data.personalMessage;
            } else {
                personalMessageDisplay.textContent = "";
            }

            if (data.musicLink && typeof data.musicLink === 'string') {
                currentMusicLink = data.musicLink;
            } else {
                currentMusicLink = '';
            }

            hideEditingElements(); // Esconde tudo de edição e inicia slideshow/música

        } catch (e) {
            console.error("Erro ao decodificar ou analisar o link:", e);
            alert("O link de personalização está inválido. Por favor, crie um novo.");
            // Não chama showEditingElements aqui, pois o usuário tentou acessar um link quebrado.
            // A página ficará com os placeholders e sem contagem.
            // Para permitir que edite, o usuário precisaria apagar o hash da URL ou recarregar a página sem o hash.
            window.location.hash = ''; // Limpa o hash para voltar ao modo edição limpo
            location.reload(); // Recarrega a página no modo edição
        }
    } else {
        // Modo de edição (sem hash na URL)
        const storedStartDate = localStorage.getItem('countdownStartDate');
        if (storedStartDate) {
            startDate = new Date(storedStartDate);
            startDatePicker.value = storedStartDate.substring(0, 16);
            if (isValidDate(startDate)) {
                startCountdown();
            } else {
                startDate = null;
                updateDisplayForNoDate();
            }
        } else {
            updateDisplayForNoDate();
        }

        imagePreviews.forEach((imgElement, index) => {
            const storedImage = localStorage.getItem(`uploadedImage${index + 1}`);
            if (storedImage) {
                imgElement.src = storedImage;
            } else {
                imgElement.src = 'https://via.placeholder.com/120x120?text=Foto ' + (index + 1);
            }
        });
        setTimeout(updateActiveImages, 100);

        const storedThemeColor = localStorage.getItem('themeColor');
        if (storedThemeColor && storedThemeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
            currentThemeColor = storedThemeColor;
            themeColorPicker.value = storedThemeColor;
        }
        applyThemeColor(currentThemeColor);

        const storedPersonalMessage = localStorage.getItem('personalMessage');
        if (storedPersonalMessage) {
            personalMessageInput.value = storedPersonalMessage;
        }

        const storedMusicLink = localStorage.getItem('musicLink');
        if (storedMusicLink) {
            musicLinkInput.value = storedMusicLink;
            currentMusicLink = storedMusicLink;
            loadMusic(storedMusicLink);
        }

        showEditingElements();
    }


    // --- Listeners de Eventos ---
    setStartDateButton.addEventListener('click', () => {
        const inputDateValue = startDatePicker.value;
        if (inputDateValue) {
            startDate = new Date(inputDateValue);
            if (isValidDate(startDate)) {
                localStorage.setItem('countdownStartDate', startDate.toISOString());
                startCountdown();
            } else {
                alert("Por favor, insira uma data e hora válidas.");
                updateDisplayForNoDate();
            }
        } else {
            alert("Por favor, selecione uma data e hora.");
            updateDisplayForNoDate();
        }
    });

    themeColorPicker.addEventListener('input', (event) => {
        currentThemeColor = event.target.value;
        applyThemeColor(currentThemeColor);
        localStorage.setItem('themeColor', currentThemeColor);
    });

    personalMessageInput.addEventListener('input', (event) => {
        localStorage.setItem('personalMessage', event.target.value);
    });

    imageUploads.forEach((inputElement, index) => {
        inputElement.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDataUrl = e.target.result;
                    imagePreviews[index].src = imageDataUrl;
                    localStorage.setItem(`uploadedImage${index + 1}`, imageDataUrl);
                    updateActiveImages();
                };
                reader.readAsDataURL(file);
            }
        });
    });

    removePhotoButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const index = parseInt(event.target.dataset.index);
            const defaultPlaceholderSrc = `https://via.placeholder.com/120x120?text=Foto+${index + 1}`;

            imagePreviews[index].src = defaultPlaceholderSrc;
            localStorage.removeItem(`uploadedImage${index + 1}`);
            event.target.classList.remove('show-button');

            updateActiveImages();
        });
    });

    loadMusicButton.addEventListener('click', () => {
        const link = musicLinkInput.value.trim();
        if (link) {
            loadMusic(link);
        } else {
            musicStatus.textContent = "Por favor, insira um link de música.";
            musicStatus.classList.add('show');
            stopMusic();
        }
    });

    // NOVO: Listener para o botão "Trocar Música"
    changeMusicButton.addEventListener('click', () => {
        // Para a música e retorna para o modo de edição
        stopMusic();
        showEditingElements();
        // Limpa o hash da URL para que a página possa ser editada novamente
        window.location.hash = '';
    });


    // --- Gerar Link (Inclui a música) ---
    generateLinkButton.addEventListener('click', async () => {
        if (!startDate || !isValidDate(startDate)) {
            alert("Por favor, defina a data inicial antes de gerar o link.");
            return;
        }

        const config = {
            startDate: startDate.toISOString(),
            images: imagePreviews.map(img => img.src.includes('via.placeholder.com') ? null : img.src),
            themeColor: currentThemeColor,
            personalMessage: personalMessageInput.value,
            musicLink: currentMusicLink
        };

        const configString = JSON.stringify(config);
        const encodedConfig = encodeURIComponent(configString);
        const link = window.location.origin + window.location.pathname + '#' + encodedConfig;

        try {
            await navigator.clipboard.writeText(link);
            copyMessage.textContent = "Link copiado!";
            copyMessage.classList.add('show');
            setTimeout(() => {
                copyMessage.classList.remove('show');
                copyMessage.textContent = "";
            }, 3000);
        } catch (err) {
            console.error('Falha ao copiar o link: ', err);
            copyMessage.textContent = "Erro ao copiar. Copie manualmente: " + link;
            copyMessage.classList.add('show');
        }
    });


    // --- Funções do Contador (mantidas da versão anterior) ---
    function startCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        updateCounter();
        countdownInterval = setInterval(updateCounter, 1000);
    }

    function updateDisplayForNoDate() {
        yearsMonthsDaysElement.textContent = "Selecione a data inicial acima";
        hoursMinutesSecondsElement.textContent = "";
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    }

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    function updateCounter() {
        if (!startDate || !isValidDate(startDate)) {
            updateDisplayForNoDate();
            return;
        }

        const now = new Date();
        let diff = now.getTime() - startDate.getTime();

        if (diff < 0) {
            yearsMonthsDaysElement.textContent = "Aguardando o início...";
            let futureDiff = startDate.getTime() - now.getTime();
            let futureSeconds = Math.floor(futureDiff / 1000);
            let futureMinutes = Math.floor(futureSeconds / 60);
            let futureHours = Math.floor(futureMinutes / 60);
            let futureDays = Math.floor(futureHours / 24);

            futureSeconds %= 60;
            futureMinutes %= 60;
            futureHours %= 24;

            hoursMinutesSecondsElement.textContent =
                `Faltam: ${futureDays} dias, ${futureHours} horas, ${futureMinutes} minutos e ${futureSeconds} segundos`;
            return;
        }

        let seconds = Math.floor(diff / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        let years = 0;
        let months = 0;
        let tempDate = new Date(startDate);

        while (tempDate < now) {
            const nextMonth = new Date(tempDate);
            nextMonth.setMonth(tempDate.getMonth() + 1);

            if (nextMonth.getDate() !== tempDate.getDate()) {
                const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
                if (tempDate.getDate() > lastDayOfNextMonth) {
                    nextMonth.setDate(lastDayOfNextMonth);
                }
            }

            if (nextMonth <= now) {
                months++;
                tempDate = nextMonth;
            } else {
                break;
            }
        }

        years = Math.floor(months / 12);
        months %= 12;

        const adjustedStartDateForDays = new Date(startDate);
        adjustedStartDateForDays.setFullYear(startDate.getFullYear() + years);
        adjustedStartDateForDays.setMonth(startDate.getMonth() + months);

        let totalDaysFromAdjusted = Math.floor((now.getTime() - adjustedStartDateForDays.getTime()) / (1000 * 60 * 60 * 24));
        if (totalDaysFromAdjusted < 0) totalDaysFromAdjusted = 0;

        yearsMonthsDaysElement.textContent =
            `${years} ano${years !== 1 ? 's' : ''}, ` +
            `${months} mês${months !== 1 ? 'es' : ''}, ` +
            `${totalDaysFromAdjusted} dia${totalDaysFromAdjusted !== 1 ? 's' : ''}`;

        hoursMinutesSecondsElement.textContent =
            `${hours} hora${hours !== 1 ? 's' : ''}, ` +
            `${minutes} minuto${minutes !== 1 ? 's' : ''} e ` +
            `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
});
