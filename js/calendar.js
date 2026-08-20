async function loadCalendar() {

  const response =
    await fetch(
      API_URL + '?mode=calendar'
    );

  const calendar =
    await response.json();

  const target =
    document.getElementById(
      'calendar'
    );

  if(!target) return;

  target.innerHTML = '';

  calendar.forEach(day => {

    const disabled =
      day.status === '×'
      ? 'disabled'
      : '';

    target.innerHTML += `

      <button
        class="calendar-day"
        data-date="${day.date}"
        ${disabled}
        onclick="selectDate(this)"
      >

        ${day.date}

        <br>

        ${day.status}

      </button>

    `;
  });

}


// =========================
// 日付選択
// =========================
function selectDate(button){

  const date = button.getAttribute('data-date');

  const input =
    document.getElementById('pickupDate');

  if(input){
    input.value = date;
  }

  document
    .querySelectorAll('.calendar-day')
    .forEach(btn => {
      btn.classList.remove('selected');
    });

  button.classList.add('selected');

}

loadCalendar();