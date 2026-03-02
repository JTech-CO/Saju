/**
 * 날짜/시간 선택기 채우기 유틸
 */
function populateDateSelects(yearId, monthId, dayId, defaultYear) {
    const yearSelect = document.getElementById(yearId);
    const monthSelect = document.getElementById(monthId);
    const daySelect = document.getElementById(dayId);

    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1930; i--) {
        yearSelect.options.add(new Option(i, i));
    }
    yearSelect.value = defaultYear;

    for (let i = 1; i <= 12; i++) {
        const val = i < 10 ? '0' + i : i;
        monthSelect.options.add(new Option(val, val));
    }
    for (let i = 1; i <= 31; i++) {
        const val = i < 10 ? '0' + i : i;
        daySelect.options.add(new Option(val, val));
    }
}
