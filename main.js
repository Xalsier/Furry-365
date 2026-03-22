async function loadEvents() {
    const eventListElement = document.getElementById('event-list');
    const headerElement = document.getElementById('date-header');
    let footerElement = document.getElementById('fact-footer');
    if (!footerElement) {
        footerElement = document.createElement('div');
        footerElement.id = 'fact-footer';
        eventListElement.parentNode.appendChild(footerElement);
    }
    const now = new Date();
    const currentMonthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    try {
        const response = await fetch('365.txt');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        let allEvents = [];
        lines.forEach((line, i) => {
            const dateMatch = line.match(/\((.*?) (\d+), (\d+)\)/);
            if (dateMatch) {
                const month = dateMatch[1];
                const day = parseInt(dateMatch[2]);
                const year = parseInt(dateMatch[3]);
                const desc = line.replace(dateMatch[0], '').trim();
                const eventDate = new Date(`${month} ${day}, ${now.getFullYear()}`);
                const index = i; 
                allEvents.push({
                    index,
                    month,
                    day,
                    year,
                    desc,
                    monthDay: `${month} ${day}`,
                    timestamp: eventDate.getTime()
                });
            }
        });
        const TARGET = 10000;
        const factsRemaining = Math.max(0, TARGET - allEvents.length);
        let displayEvents = allEvents.filter(e => e.monthDay === currentMonthDay);
        let isUpcoming = false;
        if (displayEvents.length === 0) {
            isUpcoming = true;
            const todayTs = now.setHours(0,0,0,0);
            const sortedByCalendar = [...allEvents].sort((a, b) => a.timestamp - b.timestamp);
            let nearest = sortedByCalendar.find(e => e.timestamp > todayTs);
            if (!nearest) nearest = sortedByCalendar[0];
            displayEvents = allEvents.filter(e => e.monthDay === nearest.monthDay);
        }
        displayEvents.sort((a, b) => b.year - a.year);
        const displayDate = displayEvents[0].monthDay;
        headerElement.innerText =
            (isUpcoming ? "Upcoming: " : "On This Day: ") + displayDate;
        eventListElement.innerHTML = '';
        const formatIndex = (num) => String(num).padStart(4, '0');
        displayEvents.forEach(ev => {
            const li = document.createElement('li');
            li.className = 'event-item';
            li.innerHTML = `
                <span class="date-label">${ev.month} ${ev.day}</span>
                <span class="year">${ev.year}</span> ${ev.desc}
                <span class="fact-id">(#${formatIndex(ev.index)})</span>
            `;
            eventListElement.appendChild(li);
        });
        footerElement.innerHTML = `<small>${factsRemaining} facts left to add.</small>`;
    } catch (error) {
        headerElement.innerText = "Error";
        eventListElement.innerHTML = `<li>Unable to load 365.txt. Check console for details.</li>`;
        console.error(error);
    }
}
loadEvents();