document.addEventListener("DOMContentLoaded", () => {
    // Select the button and content
    const dropdownBtn = document.querySelector(".dropbtn");
    const dropdownContent = document.querySelector(".dropdown-content");
    console.log("Dropdown JavaScript is running");
    if (dropdownBtn) {
        // Add click event listener to toggle visibility
        dropdownBtn.addEventListener("click", () => {
            event.stopPropagation();
            dropdownContent.classList.toggle("show");
        });

        // Add a listener to close dropdown when clicking outside
        window.addEventListener("click", (event) => {
            if (!dropdownContent.contains(event.target) && !dropdownBtn.contains(event.target)) {
                if (dropdownContent.classList.contains("show")) {
                    dropdownContent.classList.remove("show");
                }
            }
        });
    } else {
        console.error("Dropdown button not found");
    }
});
