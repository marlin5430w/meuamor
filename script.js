document.addEventListener('DOMContentLoaded', () => {
    const startDatePicker = document.getElementById('startDatePicker');
    const setStartDateButton = document.getElementById('setStartDateButton');
    const yearsMonthsDaysElement = document.getElementById('years-months-days');
    const hoursMinutesSecondsElement = document.getElementById('hours-minutes-seconds');

    let startDate = null; // A data inicial será definida pelo usuário

    // Tenta carregar a data inicial do localStorage se houver
    const storedStartDate = localStorage.getItem('countdownStartDate');
    if (storedStartDate) {
        startDate = new Date(storedStartDate);
        startDatePicker.value = storedStartDate.substring(0, 16); // Preenche o input com a data salva
        if (isValidDate(startDate)) {
            startCountdown();
        } else {
            startDate = null; // Reseta se a data salva for inválida
            updateDisplayForNoDate();
        }
    } else {
        updateDisplayForNoDate();
    }


    setStartDateButton.addEventListener('click', () => {
        const inputDateValue = startDatePicker.value;
        if (inputDateValue) {
            startDate = new Date(inputDateValue);
            if (isValidDate(startDate)) {
                localStorage.setItem('countdownStartDate', startDate.toISOString()); // Salva no localStorage
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

    let countdownInterval; // Variável para armazenar o ID do intervalo

    function startCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval); // Limpa o intervalo anterior se existir
        }
        updateCounter(); // Atualiza imediatamente
        countdownInterval = setInterval(updateCounter, 1000); // Inicia o novo intervalo
    }

    function updateDisplayForNoDate() {
        yearsMonthsDaysElement.textContent = "Selecione a data inicial acima";
        hoursMinutesSecondsElement.textContent = "";
        if (countdownInterval) {
            clearInterval(countdownInterval); // Para o contador se não houver data
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
        let diff = now.getTime() - startDate.getTime(); // Diferença em milissegundos

        if (diff < 0) { // Se a data inicial for no futuro
            yearsMonthsDaysElement.textContent = "Aguardando o início...";
            // Calcula tempo restante para a data futura
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

        // --- Lógica de cálculo de tempo (a mesma de antes, com pequenas melhorias) ---
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

        while (tempDate <= now) { // Ajuste para incluir o mês atual se a data estiver dentro
            const nextMonth = new Date(tempDate);
            nextMonth.setMonth(tempDate.getMonth() + 1);

            // Ajuste para não pular meses (ex: Jan 31 + 1 mês = Mar 3)
            if (nextMonth.getDate() !== tempDate.getDate()) {
                nextMonth.setDate(0); // Volta para o último dia do mês anterior
                nextMonth.setDate(tempDate.getDate()); // Tenta voltar ao dia original
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

        // Recalcular os dias restantes a partir da data de início ajustada por anos e meses
        const adjustedStartDateForDays = new Date(startDate);
        adjustedStartDateForDays.setFullYear(startDate.getFullYear() + years);
        adjustedStartDateForDays.setMonth(startDate.getMonth() + months);

        // Se o dia original for maior que o último dia do mês ajustado, ajusta para o último dia
        if (adjustedStartDateForDays.getDate() < startDate.getDate() &&
            adjustedStartDateForDays.getMonth() === now.getMonth() &&
            adjustedStartDateForDays.getFullYear() === now.getFullYear()) {
             // Este ajuste é complexo e pode ser simplificado se a precisão "humana" não for 100% crítica
             // Para maior robustez em dias, considera a diferença total de dias
             // A lógica de "meses exatos" é a mais complexa para replicar sem bibliotecas
        }

        let totalDaysFromAdjusted = Math.floor((now.getTime() - adjustedStartDateForDays.getTime()) / (1000 * 60 * 60 * 24));

        // Assegura que totalDaysFromAdjusted não seja negativo devido a pequenos desajustes de data
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
