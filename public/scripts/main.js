function fetchResults(gender) {
    const url = `/?genderChoice=${gender}`;
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('ladder-results').innerHTML = html;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
