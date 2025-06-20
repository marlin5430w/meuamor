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

    const photosContainer = document.querySelector('.photos-container'); // Seleciona o contêiner principal das fotos
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

    const removePhotoButtons = document.querySelectorAll('.remove-photo-button');

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
        // Esconde o container completo da data e cor
        dateInputContainer.classList.add('hidden');

        // Adiciona a classe para ativar o modo slideshow no CSS
        photosContainer.classList.add('slideshow-mode');

        // Esconde os photo-uploaders individuais (eles serão controlados pelo slideshow)
        photoUploaders.forEach(uploader => {
            // O CSS com .slideshow-mode .photo-uploader já cuida do position: absolute e opacity:0
            // Mas para garantir, podemos adicionar uma classe 'hidden' se necessário para controle individual.
            // Por enquanto, o CSS do slideshow-mode no container é suficiente.
        });
        if (generateLinkButton) generateLinkButton.classList.add('hidden');

        personalMessageInput.classList.add('hidden');
        personalMessageDisplay.classList.add('show');

        // Esconde os botões de remover no modo de visualização
        removePhotoButtons.forEach(button => button.classList.remove('show-button'));

        updateActiveImages(); // Garante que a lista de imagens para o slideshow esteja atualizada
        startSlideshow(); // Força o início do slideshow
    }

    function showEditingElements() {
        // Mostra o container completo da data e cor
        dateInputContainer.classList.remove('hidden');

        // Remove a classe para desativar o modo slideshow no CSS
        photosContainer.classList.remove('slideshow-mode');

        // Garante que os photo-uploaders individuais estejam visíveis para edição
        photoUploaders.forEach(uploader => {
            // Remove qualquer estilo de slideshow residual, o CSS do modo edição deve prevalecer
        });
        if (generateLinkButton) generateLinkButton.classList.remove('hidden');

        personalMessageInput.classList.remove('hidden');
        personalMessageDisplay.classList.remove('show');

        clearInterval(slideshowInterval); // Para o slideshow

        // Mostra/esconde os botões de remover com base na presença de uma foto
        imagePreviews.forEach((img, index) => {
            img.classList.remove('active'); // Remove a classe active do slideshow
            img.style.opacity = ''; // Remove o estilo de opacidade inline
            img.style.zIndex = ''; // Remove o estilo de z-index inline
            // Se a imagem não for placeholder, mostra o botão de remover
            if (!img.src.includes('via.placeholder.com')) {
                removePhotoButtons[index].classList.add('show-button');
            } else {
                removePhotoButtons[index].classList.remove('show-button'); // Esconde se for placeholder
            }
        });
    }

    // REMOVIDO: Funções hideDateInput() e showDateInput()

    // --- Lógica do Slideshow ---
    function startSlideshow() {
        clearInterval(slideshowInterval); // Limpa qualquer intervalo existente

        if (activeImages.length === 0) {
            console.log("Nenhuma imagem para o slideshow. Mostrando placeholders.");
            imagePreviews.forEach((img, index) => {
                img.classList.remove('active');
                img.src = 'https://via.placeholder.com/150x150?text=Sem+Fotos';
                img.style.opacity = '1'; // Placeholder padrão visível
                img.style.zIndex = '1';
                // Certifica-se de que os uploaders estejam visíveis para mostrar o placeholder
                photoUploaders[index].style.opacity = '1';
                photoUploaders[index].style.position = 'relative'; // Para que apareça no fluxo normal
                photoUploaders[index].style.transform = 'none';
            });
            // Adiciona a classe slideshow-mode ao container para manter a altura fixa
            photosContainer.classList.add('slideshow-mode');
            return;
        } else {
            // Garante que todos os uploaders de foto estejam em posição absoluta para o slideshow
            photoUploaders.forEach(uploader => {
                 uploader.style.position = 'absolute';
                 uploader.style.transform = 'translate(-50%, -50%)';
                 uploader.style.opacity = '0'; // Esconde todos para o início da transição
                 uploader.style.zIndex = '1';
            });
            photosContainer.classList.add('slideshow-mode'); // Ativa o modo slideshow no container
        }


        // Garante que todas as imagens comecem invisíveis, exceto a primeira ativa
        imagePreviews.forEach(img => {
            img.classList.remove('active');
            img.style.opacity = '0';
            img.style.zIndex = '1'; // Z-index padrão
        });

        currentImageIndex = 0; // Começa sempre da primeira imagem válida

        // Ativa a primeira imagem e o uploader correspondente
        activeImages[currentImageIndex].classList.add('active');
        activeImages[currentImageIndex].style.opacity = '1'; // Torna a imagem visível
        activeImages[currentImageIndex].style.zIndex = '2'; // Traz a imagem para frente
        // Mostra o uploader correspondente à imagem ativa (se houver mais de um)
        photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '1';
        photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '2';


        slideshowInterval = setInterval(() => {
            // Desativa a imagem atual e seu uploader
            activeImages[currentImageIndex].classList.remove('active');
            activeImages[currentImageIndex].style.opacity = '0';
            activeImages[currentImageIndex].style.zIndex = '1';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '0';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '1';


            // Avança para a próxima imagem
            currentImageIndex = (currentImageIndex + 1) % activeImages.length;

            // Ativa a próxima imagem e seu uploader
            activeImages[currentImageIndex].classList.add('active');
            activeImages[currentImageIndex].style.opacity = '1'; // Torna visível
            activeImages[currentImageIndex].style.zIndex = '2'; // Traz para frente
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.opacity = '1';
            photoUploaders[imagePreviews.indexOf(activeImages[currentImageIndex])].style.zIndex = '2';

        }, 1000); // Mudar imagem a cada 1 segundo (1000 milissegundos)
    }

    // Atualiza a lista de imagens que devem participar do slideshow
    function updateActiveImages() {
        activeImages = imagePreviews.filter(img => !img.src.includes('via.placeholder.com'));
        console.log("Imagens ativas para slideshow:", activeImages.map(img => img.src));

        // No modo edição, atualiza a visibilidade dos botões de remover
        if (!photosContainer.classList.contains('slideshow-mode')) { // Se não estiver em modo slideshow (modo edição)
            imagePreviews.forEach((img, index) => {
                if (!img.src.includes('via.placeholder.com')) {
                    removePhotoButtons[index].classList.add('show-button'); // Mostra se tem foto
                } else {
                    removePhotoButtons[index].classList.remove('show-button'); // Esconde se for placeholder
                }
            });
        }

        // Se já estiver no modo somente leitura (hidden), reinicia o slideshow com a nova lista
        // (Isso é acionado após a carga do link, por exemplo)
        if (dateInputContainer.classList.contains('hidden')) {
            startSlideshow();
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

            // Sempre esconde os elementos de edição quando há um hash (modo de visualização)
            hideEditingElements();

        } catch (e) {
            console.error("Erro ao decodificar ou analisar o link:", e);
            alert("O link de personalização está inválido. Por favor, crie um novo.");
            updateDisplayForNoDate();
            showEditingElements(); // Se o link for inválido, volta para o modo edição
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

        // Sempre mostra os elementos de edição quando não há hash (modo de edição)
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
                // Não chama hideDateInput() aqui, pois a data permanece visível na edição
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
                    updateActiveImages(); // Atualiza a lista de imagens ativas após o upload
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Adiciona listener para os botões de remover foto
    removePhotoButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Impede que o label (que é um for="imageUpload") seja clicado
            const index = parseInt(event.target.dataset.index); // Pega o índice da foto
            const defaultPlaceholderSrc = `https://via.placeholder.com/120x120?text=Foto+${index + 1}`; // Placeholder para a edição

            imagePreviews[index].src = defaultPlaceholderSrc; // Reseta a imagem para o placeholder
            localStorage.removeItem(`uploadedImage${index + 1}`); // Remove do localStorage
            event.target.classList.remove('show-button'); // Esconde o próprio botão de remover

            updateActiveImages(); // Atualiza a lista de imagens ativas (removendo a imagem excluída do slideshow)
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
