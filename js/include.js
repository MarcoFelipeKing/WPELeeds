// Script to include HTML parts using custom <include> tags
document.addEventListener('DOMContentLoaded', function() {
    // Get all include elements
    const includes = document.getElementsByTagName('include');
    
    // Process each include element
    Array.from(includes).forEach(include => {
        const filePath = include.getAttribute('src');
        
        // Create an XMLHttpRequest to fetch the content
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    // Create a temporary container
                    const temp = document.createElement('div');
                    temp.innerHTML = this.responseText;
                    
                    // Replace the include tag with the fetched content
                    while (temp.firstChild) {
                        include.parentNode.insertBefore(temp.firstChild, include);
                    }
                    
                    // Remove the original include tag
                    include.parentNode.removeChild(include);
                    
                    // Execute any scripts in the included content
                    const scripts = document.querySelectorAll('script');
                    scripts.forEach(script => {
                        if (script.innerText && !script.src) {
                            eval(script.innerText);
                        }
                    });
                }
                
                if (this.status == 404) {
                    include.innerHTML = "Page not found: " + filePath;
                }
            }
        };
        
        xhr.open('GET', filePath, true);
        xhr.send();
    });
});
