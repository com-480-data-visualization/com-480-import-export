export function setupDateValidation() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    console.log("startDateInput:", startDateInput);

    startDateInput.addEventListener('input', () => {
        const isValid = validateDateInput(startDateInput.value, '01.1988', '11.2023');
        if (!isValid) {
            startDateInput.setCustomValidity('Start date must be in mm.yyyy format and between 01.1988 and 11.2023.');
        } else {
            startDateInput.setCustomValidity('');
        }
    });

    endDateInput.addEventListener('input', () => {
        const isValid = validateDateInput(endDateInput.value, '02.1988', '12.2023');
        if (!isValid) {
            endDateInput.setCustomValidity('End date must be in mm.yyyy format and between 02.1988 and 12.2023.');
        } else {
            endDateInput.setCustomValidity('');
        }
    });
}

function validateDateInput(date, minDate, maxDate) {
    // Check for null, undefined, or empty string
    if (!date) {
        return false; // Invalid input
    }

    const dateRegex = /^(0[1-9]|1[0-2])\.(19[8-9][0-9]|20[0-2][0-3])$/; // Matches mm.yyyy format within valid years
    if (!dateRegex.test(date)) {
        return false; // Invalid format
    }

    const [month, year] = date.split('.').map(Number);
    const [minMonth, minYear] = minDate.split('.').map(Number);
    const [maxMonth, maxYear] = maxDate.split('.').map(Number);

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

