let currentType = 'both'

function cycleType(){
    const types = ['both', 'running', 'standing'];
    currentType = types[(types.indexOf(currentType) + 1) % types.length];
    document.getElementById('typeButton').textContent = currentType;
    fetchResults(currentGender, currentType);
}

let currentGender = 'any';

function fetchResults(gender = currentGender, type = currentType) {
    currentGender = gender;
    currentType = type;
    const url = `/?genderChoice=${gender}&typeChoice=${type}`;
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('ladder-results').innerHTML = html;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
