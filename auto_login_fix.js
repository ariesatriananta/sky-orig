// Auto-login fix - inject this at the beginning of script.js
(function() {
    // Check URL parameters for auto-login
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
    const password = urlParams.get("password");
    
    if (username === "admin" && password === "admin123") {
        // Set user data immediately
        const currentUser = { username: "admin", role: "admin" };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        
        // Wait for DOM to load then auto-login
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                const loginSection = document.getElementById("loginSection");
                const mainApp = document.getElementById("mainApp");
                
                if (loginSection && mainApp) {
                    loginSection.style.display = "none";
                    mainApp.style.display = "block";
                    
                    // Load dashboard
                    if (typeof loadDashboard === 'function') {
                        loadDashboard();
                    }
                }
            }, 500);
        });
    }
})();
