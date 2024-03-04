document.addEventListener('DOMContentLoaded', function () {
    const genderButtons = document.querySelectorAll('button[data-gender]')
    genderButtons.forEach(button => {
        button.addEventListener('click', function () {
            const gender = this.getAttribute('data-gender');
            fetchResults(gender);
        });
    });
});

function fetchResults(gender) {
    const url = `/filter?genderChoice=${gender}`;

    fetch(url)
        .then(response => response.text()) // Get the response text (HTML)
        .then(html => {
            // Insert the HTML directly into the results div
            document.getElementById('results').innerHTML = html;
            console.log("hello world")
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
