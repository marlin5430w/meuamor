document.addEventListener('DOMContentLoaded', () => {
    // ** IMPORTANTE: ALtere esta data para a sua data inicial **
    // Formato: 'YYYY-MM-DDTHH:mm:ss'
    // Exemplo: 14 de Outubro de 2023, às 00:00:00
    const startDate = new Date('2023-10-14T 06:00:00');

    const yearsMonthsDaysElement = document.getElementById('years-months-days');
    const hoursMinutesSecondsElement = document.getElementById('hours-minutes-seconds');

    function updateCounter() {
        const now = new Date();
        let diff = now.getTime() - startDate.getTime(); // Diferença em milissegundos

        // Garante que o contador não seja negativo se a data inicial for no futuro
        if (diff < 0) {
            yearsMonthsDaysElement.textContent = "Aguardando o início...";
            hoursMinutesSecondsElement.textContent = "";
            return;
        }

        // Calcula anos, meses, dias, horas, minutos e segundos
        let seconds = Math.floor(diff / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        // Calcular anos e meses de forma mais precisa (considerando dias no mês)
        let years = 0;
        let months = 0;
        let tempDate = new Date(startDate); // Cria uma cópia da data inicial

        while (tempDate < now) {
            const nextMonth = new Date(tempDate);
            nextMonth.setMonth(tempDate.getMonth() + 1);

            if (nextMonth <= now) {
                months++;
                tempDate = nextMonth;
            } else {
                break;
            }
        }

        years = Math.floor(months / 12);
        months %= 12;

        // Ajustar os dias restantes após calcular anos e meses
        // Recalculamos os dias a partir da data ajustada pelos anos e meses
        const adjustedStartDate = new Date(startDate);
        adjustedStartDate.setFullYear(startDate.getFullYear() + years);
        adjustedStartDate.setMonth(startDate.getMonth() + months);
        // Precisamos garantir que a data ajustada não "pule" o mês se o dia for maior
        // Ex: 30 de janeiro + 1 mês = 2 de março se fevereiro tiver 28 dias
        // Para evitar isso, ajustamos o dia para o último dia do mês se for necessário
        if (adjustedStartDate.getDate() < startDate.getDate()) {
             adjustedStartDate.setDate(0); // Volta para o último dia do mês anterior
             adjustedStartDate.setDate(startDate.getDate()); // Tenta definir o dia original
             if (adjustedStartDate.getDate() !== startDate.getDate()) { // Se ainda não for o dia original
                 adjustedStartDate.setDate(0); // Volta e pega o último dia do mês
             }
        }


        // Cálculo dos dias restantes após a parte de anos e meses
        const daysAfterMonths = Math.floor((now.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24));


        // Formata a saída
        yearsMonthsDaysElement.textContent =
            `${years} ano${years !== 1 ? 's' : ''}, ` +
            `${months} mês${months !== 1 ? 'es' : ''}, ` +
            ${daysAfterMonths} dia${daysAfterMonths !== 1 ? 's' : ''};

        hoursMinutesSecondsElement.textContent =
            `${hours} hora${hours !== 1 ? 's' : ''}, ` +
            `${minutes} minuto${minutes !== 1 ? 's' : ''} e ` +
            ${seconds} segundo${seconds !== 1 ? 's' : ''};
    }

    // Chama a função pela primeira vez para exibir o contador imediatamente
    updateCounter();

    // Atualiza o contador a cada segundo
    setInterval(updateCounter, 1000);
});
