export function setupDateValidation() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    console.log("startDateInput:", startDateInput);

    startDateInput.addEventListener('input', () => {
        const isValid = validateDateInput(startDateInput.value, '1988-01', '2023-11');
        if (!isValid) {
            startDateInput.setCustomValidity('Start date must be between 01.1988 and 11.2023.');
        } else {
            startDateInput.setCustomValidity('');
        }
    });

    endDateInput.addEventListener('input', () => {
        const isValid = validateDateInput(endDateInput.value, '1988-02', '2023-12');
        if (!isValid) {
            endDateInput.setCustomValidity('End date must be between 02.1988 and 12.2023.');
        } else if (startDateInput.value && endDateInput.value && startDateInput.value > endDateInput.value) {
            endDateInput.setCustomValidity('End date must be after start date.');
        } else {
            endDateInput.setCustomValidity('');
        }
    });
}

function validateDateInput(date, minDate, maxDate) {
    // Check for null, undefined, or empty string
    if (!date) return false; // Invalid input

    const dateRegex = /^((19[8-9]\d)|(20[0-2]\d))-(0[1-9]|1[0-2])$/;
    if (!dateRegex.test(date)) return false;

    const [year, month] = date.split('-').map(Number);
    const [minYear, minMonth] = minDate.split('-').map(Number);
    const [maxYear, maxMonth] = maxDate.split('-').map(Number);

    // Check if the year is within the allowed range
    if (year < minYear || year > maxYear) {
        return false; // Year is out of range
    }

    // Check if the month is within the allowed range for the given year
    if ((year === minYear && month < minMonth) || (year === maxYear && month > maxMonth)) {
        return false; // Month is out of range
    }

    return true; // Valid date
}

