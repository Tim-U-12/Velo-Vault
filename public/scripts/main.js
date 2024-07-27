let currentType = 'Both';
let currentGender = 'all';

function cycleType(){
    const types = ['Both', 'Running', 'Standing'];
    currentType = types[(types.indexOf(currentType) + 1) % types.length];
    document.getElementById('typeButton').textContent = currentType;
    fetchResults(currentGender, currentType);
}

function fetchResults(gender = currentGender, type = currentType) {
    console.log(`Gender: ${gender}, Type: ${type}`);
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

function highlightButton(button, buttonContainerSelector) {
     // Remove 'selected' class from all buttons within the specified container
    var buttons = document.querySelectorAll(buttonContainerSelector + ' button');
    buttons.forEach(function(btn) {
        btn.classList.remove('selected-sex');
    });

    // Add 'selected' class to the clicked button
    button.classList.add('selected-sex');
    currentGender = button.textContent.toLowerCase(); // Update currentGender based on the clicked button
    fetchResults(currentGender, currentType); // Fetch results with the updated gender and current type
}