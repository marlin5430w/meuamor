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
    const imagePreviews = [ // Estas são as tags <img>
        document.getElementById('imagePreview1'),
        document.getElementById('imagePreview2'),
        document.getElementById('imagePreview3')
    ];

    const personalMessageInput = document.getElementById('personalMessageInput');
    const personalMessageDisplay = document.getElementById('personalMessageDisplay');
    const messageSlot = document.getElementById('messageSlot');

    let startDate = null;
    let currentThemeColor = '#ff007f';
    let countdownInterval;
    let slideshowInterval;
    let currentImageIndex = 0;
    let activeImages = []; // Array para armazenar as referências das <img> com SRC válido

    // --- Funções de Aplicação de Tema e Visibilidade ---
    function applyThemeColor(color) {
        root.style.setProperty('--main-color', color);
        const hexToRgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
        const rgbToRgbA = (rgb, alpha) => `rgba(${rgb.join(',')}, ${alpha})`;
        const rgb = hexToRgb(color);
        const darkerRgb = rgb.map(c => Math.max(0, c - 30));
        root.style.setProperty('--main-color-dark', `rgb(${darkerRgb.join(',')})`);
        root.style.setProperty('--main-color-shadow', rgbToRgbA(rgb, 0.4));
        root.style.setProperty('--main-color-border-dash', rgbToRgbA(rgb, 0.5));
        root.style.setProperty('--main-color-hover-bg', rgbToRgbA(rgb, 0.1));
    }

    function hideEditingElements() {
        dateInputContainer.classList.add('hidden');
        startDatePicker.classList.add('hidden');
        setStartDateButton.classList.add('hidden');
        dateInputContainer.querySelector('label').classList.add('hidden');
        colorPickerContainer.classList.add('hidden');

        // Esconde os photo-uploaders para ativar o modo slideshow (CSS)
        photoUploaders.forEach(uploader => {
            if (uploader) uploader.classList.add('hidden');
        });
        if (generateLinkButton) generateLinkButton.classList.add('hidden');

        personalMessageInput.classList.add('hidden');
        personalMessageDisplay.classList.add('show');

        // Inicia o slideshow quando os elementos de edição são escondidos
        // Chamamos updateActiveImages para garantir que a lista esteja correta e o slideshow inicie
        updateActiveImages();
        startSlideshow(); // Força o início do slideshow
    }

    function showEditingElements() {
        dateInputContainer.classList.remove('hidden');
        startDatePicker.classList.remove('hidden');
        setStartDateButton.classList.remove('hidden');
        dateInputContainer.querySelector('label').classList.remove('hidden');
        colorPickerContainer.classList.remove('hidden');

        // Mostra os photo-uploaders para o modo edição (CSS)
        photoUploaders.forEach(uploader => {
            if (uploader) uploader.classList.remove('hidden');
        });
        if (generateLinkButton) generateLinkButton.classList.remove('hidden');

        personalMessageInput.classList.remove('hidden');
        personalMessageDisplay.classList.remove('show');

        // Para o slideshow quando os elementos de edição são mostrados
        clearInterval(slideshowInterval);
        // Reseta as imagens para o estado inicial de edição (todas visíveis e sem classes de slideshow)
        imagePreviews.forEach((img, index) => {
            img.classList.remove('active');
            img.style.opacity = ''; // Remove o estilo de opacidade inline
            img.style.zIndex = ''; // Remove o estilo de z-index inline
            // Garante que a imagem do preview esteja visível no modo edição
            // O src já deve estar definido via localStorage ou placeholder
            // A opacidade 1 no CSS via .photo-uploader img e .photo-uploader:not(.hidden)
            // deve cuidar disso.
        });
    }

    function hideDateInput() {
        dateInputContainer.classList.add('hidden');
        startDatePicker.classList.add('hidden');
        setStartDateButton.classList.add('hidden');
        dateInputContainer.querySelector('label').classList.add('hidden');
    }

    function showDateInput() {
        dateInputContainer.classList.remove('hidden');
        startDatePicker.classList.remove('hidden');
        setStartDateButton.classList.remove('hidden');
        dateInputContainer.querySelector('label').classList.remove('hidden');
    }

    // --- Lógica do Slideshow ---
    function startSlideshow() {
        clearInterval(slideshowInterval); // Limpa qualquer intervalo existente

        if (activeImages.length === 0) {
            console.log("Nenhuma imagem para o slideshow. Mostrando placeholders.");
            // Garante que os placeholders sejam visíveis e ocupem o espaço
            imagePreviews.forEach((img, index) => {
                img.classList.remove('active');
                img.src = 'https://via.placeholder.com/150x150?text=Foto+' + (index + 1); // Garante placeholder padrão
                img.style.opacity = '1';
                img.style.zIndex = '1';
            });
            // Não há imagens para slideshow, então não inicia o setInterval
            return;
        }

        // Garante que todas as imagens comecem invisíveis, exceto a primeira ativa
        imagePreviews.forEach(img => {
            img.classList.remove('active');
            img.style.opacity = '0';
            img.style.zIndex = '1'; // Z-index padrão
        });

        currentImageIndex = 0; // Começa sempre da primeira imagem válida
        activeImages[currentImageIndex].classList.add('active'); // Ativa a primeira imagem
        activeImages[currentImageIndex].style.opacity = '1'; // Garante que esteja visível
        activeImages[currentImageIndex].style.zIndex = '2'; // Garante que esteja acima


        slideshowInterval = setInterval(() => {
            // Desativa a imagem atual
            activeImages[currentImageIndex].classList.remove('active');
            activeImages[currentImageIndex].style.opacity = '0';
            activeImages[currentImageIndex].style.zIndex = '1'; // Volta ao z-index padrão

            // Avança para a próxima imagem
            currentImageIndex = (currentImageIndex + 1) % activeImages.length;

            // Ativa a próxima imagem
            activeImages[currentImageIndex].classList.add('active');
            activeImages[currentImageIndex].style.opacity = '1'; // Torna visível
            activeImages[currentImageIndex].style.zIndex = '2'; // Traz para frente

        }, 1000); // Mudar imagem a cada 1 segundo (1000 milissegundos)
    }

    // Atualiza a lista de imagens que devem participar do slideshow
    function updateActiveImages() {
        activeImages = imagePreviews.filter(img => !img.src.includes('via.placeholder.com'));
        console.log("Imagens ativas para slideshow:", activeImages.map(img => img.src));
        // Se já estiver no modo somente leitura (hidden), reinicia o slideshow com a nova lista
        if (dateInputContainer.classList.contains('hidden')) {
            startSlideshow();
        }
    }


    // --- Lógica de Carregamento (Prioridade: URL Hash > localStorage) ---
    const hashParams = window.location.hash.substring(1);

    if (hashParams) {
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

            // Carrega as imagens do link
            let imagesToLoadCount = 0;
            if (data.images && Array.isArray(data.images)) {
                 imagesToLoadCount = data.images.filter(imgData => imgData && typeof imgData === 'string' && imgData.startsWith('data:image')).length;
            }


            if (imagesToLoadCount > 0) {
                let imagesLoaded = 0;
                data.images.forEach((imgData, index) => {
                    if (imagePreviews[index]) {
                        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
                            imagePreviews[index].onload = () => {
                                imagesLoaded++;
                                if (imagesLoaded === imagesToLoadCount) {
                                    updateActiveImages(); // Todas as imagens carregadas, atualiza e inicia slideshow
                                }
                            };
                            imagePreviews[index].src = imgData;
                        } else {
                            imagePreviews[index].src = 'https://via.placeholder.com/150x150?text=Foto+' + (index + 1);
                        }
                    }
                });
            } else {
                // Se não há imagens válidas no link, usa placeholders e tenta iniciar slideshow
                imagePreviews.forEach((img, index) => {
                    img.src = 'https://via.placeholder.com/150x150?text=Foto+' + (index + 1);
                });
                updateActiveImages(); // Tenta iniciar slideshow com placeholders se for o caso
            }


            if (data.themeColor && typeof data.themeColor === 'string' && data.themeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                currentThemeColor = data.themeColor;
                themeColorPicker.value = storedThemeColor; // Define o valor do picker na UI
                applyThemeColor(currentThemeColor);
            }

            if (data.personalMessage && typeof data.personalMessage === 'string') {
                personalMessageDisplay.textContent = data.personalMessage;
            } else {
                personalMessageDisplay.textContent = "";
            }

            if (isValidDate(startDate)) {
                hideEditingElements(); // Isso vai chamar updateActiveImages() e startSlideshow() no final
            } else {
                updateDisplayForNoDate();
                showEditingElements(); // Isso vai parar qualquer slideshow
            }

        } catch (e) {
            console.error("Erro ao decodificar ou analisar o link:", e);
            alert("O link de personalização está inválido. Por favor, crie um novo.");
            updateDisplayForNoDate();
            showEditingElements();
        }
    } else {
        // Se não houver hash, tenta carregar do localStorage (modo editável)
        const storedStartDate = localStorage.getItem('countdownStartDate');
        if (storedStartDate) {
            startDate = new Date(storedStartDate);
            startDatePicker.value = storedStartDate.substring(0, 16);
            if (isValidDate(startDate)) {
                startCountdown();
                hideDateInput();
            } else {
                startDate = null;
                updateDisplayForNoDate();
                showDateInput();
            }
        } else {
            updateDisplayForNoDate();
            showDateInput();
        }

        imagePreviews.forEach((imgElement, index) => {
            const storedImage = localStorage.getItem(`uploadedImage${index + 1}`);
            if (storedImage) {
                imgElement.src = storedImage; // Apenas define o SRC, o onload será tratado por updateActiveImages
            } else {
                imgElement.src = 'https://via.placeholder.com/120x120?text=Foto ' + (index + 1);
            }
        });
        // Chama updateActiveImages após a carga inicial do localStorage para preencher activeImages
        // Isso é feito com um pequeno atraso para garantir que as imagens tenham chance de renderizar
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

        showEditingElements(); // Garante que todos os elementos de edição estejam visíveis por padrão no modo edição
    }


    // --- Listeners de Eventos ---
    setStartDateButton.addEventListener('click', () => {
        const inputDateValue = startDatePicker.value;
        if (inputDateValue) {
            startDate = new Date(inputDateValue);
            if (isValidDate(startDate)) {
                localStorage.setItem('countdownStartDate', startDate.toISOString());
                startCountdown();
                hideDateInput();
            } else {
                alert("Por favor, insira uma data e hora válidas.");
                updateDisplayForNoDate();
                showDateInput();
            }
        } else {
            alert("Por favor, selecione uma data e hora.");
            updateDisplayForNoDate();
            showDateInput();
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
                    updateActiveImages(); // Atualiza a lista de imagens ativas após o upload
                };
                reader.readAsDataURL(file);
            } else {
                // Se o usuário cancela a seleção de um arquivo ou remove
                imagePreviews[index].src = 'https://via.placeholder.com/120x120?text=Foto ' + (index + 1);
                localStorage.removeItem(`uploadedImage${index + 1}`);
                updateActiveImages(); // Atualiza a lista de imagens ativas se uma for removida
            }
        });
    });

    // --- Gerar Link (Inclui a mensagem personalizada) ---
    generateLinkButton.addEventListener('click', async () => {
        if (!startDate || !isValidDate(startDate)) {
            alert("Por favor, defina a data inicial antes de gerar o link.");
            return;
        }

        const config = {
            startDate: startDate.toISOString(),
            // Filtra URLs de placeholder antes de salvar
            images: imagePreviews.map(img => img.src.includes('via.placeholder.com') ? null : img.src),
            themeColor: currentThemeColor,
            personalMessage: personalMessageInput.value
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


    // --- Funções do Contador ---
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
