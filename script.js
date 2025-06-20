document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement; // Referência ao elemento <html> para CSS variables
    const dateInputContainer = document.getElementById('dateInputContainer');
    const startDatePicker = document.getElementById('startDatePicker');
    const setStartDateButton = document.getElementById('setStartDateButton');
    const yearsMonthsDaysElement = document.getElementById('years-months-days');
    const hoursMinutesSecondsElement = document.getElementById('hours-minutes-seconds');
    const generateLinkButton = document.getElementById('generateLinkButton');
    const copyMessage = document.getElementById('copyMessage');

    const themeColorPicker = document.getElementById('themeColorPicker'); // Novo
    const colorPickerContainer = document.querySelector('.color-picker-container'); // Novo

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

    let startDate = null;
    let currentThemeColor = '#ff007f'; // Cor padrão inicial
    let countdownInterval;

    // --- Funções de Aplicação de Tema e Visibilidade ---
    function applyThemeColor(color) {
        root.style.setProperty('--main-color', color);
        // Calcula tons mais escuros e sombras programaticamente
        // Isso é uma simplificação. Para cores complexas, talvez precise de uma lib ou cores fixas.
        const hexToRgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
        const rgbToRgbA = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

        const rgb = hexToRgb(color);
        const darkerRgb = rgb.map(c => Math.max(0, c - 30)); // Escurece em 30 unidades
        root.style.setProperty('--main-color-dark', `rgb(${darkerRgb[0]}, ${darkerRgb[1]}, ${darkerRgb[2]})`);
        root.style.setProperty('--main-color-shadow', rgbToRgbA(rgb, 0.4));
        root.style.setProperty('--main-color-border-dash', rgbToRgbA(rgb, 0.5));
        root.style.setProperty('--main-color-hover-bg', rgbToRgbA(rgb, 0.1));
    }

    function hideEditingElements() {
        dateInputContainer.classList.add('hidden');
        startDatePicker.classList.add('hidden');
        setStartDateButton.classList.add('hidden');
        dateInputContainer.querySelector('label').classList.add('hidden');
        colorPickerContainer.classList.add('hidden'); // Novo: Esconde o seletor de cor

        photoUploaders.forEach(uploader => {
            if (uploader) uploader.classList.add('hidden');
        });
        if (generateLinkButton) generateLinkButton.classList.add('hidden');
    }

    function showEditingElements() {
        dateInputContainer.classList.remove('hidden');
        startDatePicker.classList.remove('hidden');
        setStartDateButton.classList.remove('hidden');
        dateInputContainer.querySelector('label').classList.remove('hidden');
        colorPickerContainer.classList.remove('hidden'); // Novo: Mostra o seletor de cor

        photoUploaders.forEach(uploader => {
            if (uploader) uploader.classList.remove('hidden');
        });
        if (generateLinkButton) generateLinkButton.classList.remove('hidden');
    }

    // A função para esconder SÓ o input de data é mantida para o caso de o usuário definir a data mas ainda querer editar outras coisas
    function hideDateInput() {
        dateInputContainer.classList.add('hidden');
        // Mas os outros elementos de edição permanecem visíveis se o link não foi gerado
        startDatePicker.classList.add('hidden'); // Esconde o input
        setStartDateButton.classList.add('hidden'); // Esconde o botão
        dateInputContainer.querySelector('label').classList.add('hidden'); // Esconde a label
    }

    function showDateInput() {
        dateInputContainer.classList.remove('hidden');
        startDatePicker.classList.remove('hidden');
        setStartDateButton.classList.remove('hidden');
        dateInputContainer.querySelector('label').classList.remove('hidden');
    }


    // --- Lógica de Carregamento (Prioridade: URL Hash > localStorage) ---
    const hashParams = window.location.hash.substring(1);

    if (hashParams) {
        // Se houver hash, tenta carregar as configurações de lá (modo somente leitura)
        try {
            const decodedParams = decodeURIComponent(hashParams);
            const data = JSON.parse(decodedParams);

            if (data.startDate) {
                startDate = new Date(data.startDate);
                if (isValidDate(startDate)) {
                    startCountdown();
                } else {
                    console.error("Data inválida no link.");
                    startDate = null; // Reseta se inválido
                }
            } else {
                startDate = null;
            }

            if (data.images && Array.isArray(data.images)) {
                data.images.forEach((imgData, index) => {
                    if (imagePreviews[index] && typeof imgData === 'string' && imgData.startsWith('data:image')) {
                        imagePreviews[index].src = imgData;
                    }
                });
            }

            if (data.themeColor && typeof data.themeColor === 'string' && data.themeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                currentThemeColor = data.themeColor;
                applyThemeColor(currentThemeColor);
            }

            // Após carregar TUDO do link, decide se esconde
            if (isValidDate(startDate)) { // Se a data do link é válida, esconde tudo.
                hideEditingElements();
            } else { // Se não há data válida no link, assume modo edição.
                updateDisplayForNoDate();
                showEditingElements();
            }


        } catch (e) {
            console.error("Erro ao decodificar ou analisar o link:", e);
            alert("O link de personalização está inválido. Por favor, crie um novo.");
            updateDisplayForNoDate();
            showEditingElements(); // Se o hash for inválido, mostra os elementos de edição
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
                imgElement.src = storedImage;
            }
        });

        const storedThemeColor = localStorage.getItem('themeColor');
        if (storedThemeColor && storedThemeColor.match(/^#[0-9A-Fa-f]{6}$/)) {
            currentThemeColor = storedThemeColor;
            themeColorPicker.value = storedThemeColor; // Define o valor do input do picker
        }
        applyThemeColor(currentThemeColor); // Aplica a cor carregada ou a padrão

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

    themeColorPicker.addEventListener('input', (event) => { // Novo: Listener para o input de cor
        currentThemeColor = event.target.value;
        applyThemeColor(currentThemeColor);
        localStorage.setItem('themeColor', currentThemeColor); // Salva a cor imediatamente
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
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // --- Gerar Link (Inclui a cor do tema) ---
    generateLinkButton.addEventListener('click', async () => {
        if (!startDate || !isValidDate(startDate)) {
            alert("Por favor, defina a data inicial antes de gerar o link.");
            return;
        }

        const config = {
            startDate: startDate.toISOString(),
            images: [],
            themeColor: currentThemeColor // Inclui a cor do tema
        };

        imagePreviews.forEach(imgElement => {
            if (imgElement.src && !imgElement.src.includes('via.placeholder.com') && imgElement.src.startsWith('data:image')) {
                config.images.push(imgElement.src);
            } else {
                config.images.push(null);
            }
        });

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
