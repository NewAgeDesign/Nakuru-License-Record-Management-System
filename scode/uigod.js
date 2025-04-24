// UiGod Version 1.0
function getStackTrace() {
    var stack = new Error().stack;
    // Remove the first line from the stack trace
    return stack.split('\n').slice(2).join('\n');
} 

const printHTML = 'printHTML';
const addBefore = 'addBefore';
const errorMotd = 'errorMotd';
const conStyle = 'conStyle';
const addAfter = 'addAfter';
const getValue = 'getValue';
const replace = 'replace';
const deleter = 'delete';
const select = 'select';
const getURL = 'getURL';
const setURL = 'setURL';
const patch = 'patch';
const check = 'check';
const print = 'print';
const info = 'info';
const root = 'root';
const ajax = 'ajax';
const post = 'post';
const good = 'good';
const pick = 'pick';
const put = 'put';
const all = 'all';
const bad = 'bad';
const get = 'get';

io = {
    create : function (parent, element, attributes) {
        const parentSelector = typeof parent === 'string' ? document.querySelector(parent) : parent;
        const newElement = document.createElement(element);
        if (typeof attributes === 'object') {
            for (let key in attributes) {
                newElement.setAttribute(key, attributes[key]);
            }
        } else {
            console.error('Attribute Error: The attributes must be written in form of an object');
        }
        if (parentSelector) {
            parentSelector.appendChild(newElement);
        } else {
            console.error('Parent Error: The Parent element does not exist within the html.');
        }
    },
    in : function (action, element, param3, param4, param5) {
        switch(action){
            case 'select' :
                const sElement = document.querySelector(element);
                if (sElement) {
                    if (typeof param3 === 'function') {
                        param3.call(sElement);
                    }
                    return sElement;
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;
            
            case 'pick':
                const pElement = document.querySelectorAll(element);
                if (!pElement) {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
                else if (typeof param3 === 'number' && typeof param4 === 'function' && pElement.length > param3) {
                    const selectedElement = pElement[param3 - 1];
                    param4.call(selectedElement);
                    return selectedElement;
                }
                else if(!param4){
                    return pElement[param3 - 1];
                }
            break;

            case 'all' :
                const aElement = document.querySelectorAll(element);
                if (!aElement) {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
                else if (typeof param3 === 'function' && aElement.length > 0) {
                    aElement.forEach(function(param2) {
                        param3.call(param2);
                    });
                    return aElement;
                }
            break;

            case "getValue" :
                const myElement = document.querySelector(element);
                if(!myElement){
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                    return;
                }
                if(myElement.tagName.toLowerCase() === "input"){
                    return myElement.value;
                }else{
                    return myElement.textContent;
                }

            case "getURL" :
                const currentUrl = window.location.href;
            
                if (currentUrl.includes(element) && typeof param3 === "function") {
                    param3.call();
                } else {
                    io.out("bad", "String Mismatch : Your String is not in the URL, please debug your Links and try again.");
                }
            break;

            case "setURL":
                const url = new URL(element);
                const params = new URLSearchParams(url.search);

                for (const key in param3) {
                    params.set(key, param3[key]);
                }
                url.search = params.toString();
                window.location.href = url.toString();

                // Check if the file exists
                fetch(url.toString())
                .then(response => {
                    if (!response.ok) {
                        io.out('bad', 'File Error: The file does not exist within the server.');
                    } else {
                        window.location.href = url.toString();
                    }
                })
                .catch(e => {
                    console.error('There was a problem with the fetch operation: ' + e.message);
                });
            break;

            case 'conStyle':
                if (element === 'root') {
                    io.in(ajax, get, 'scode/config.json', function(data){
                        for (const key in data) {
                            if (data.hasOwnProperty(key)) {
                                document.documentElement.style.setProperty(`--${key}`, data[key]);
                            }
                        }
                    });
                }
            break;

            case 'ajax':
            let method = element.toUpperCase();
            let file = param3;
            let data = param4;
            let callback = param5;

            // If data is a function, assign it to callback and set data to null
            if (typeof param4 === 'function') {
                callback = param4;
                data = null;
            }

            let options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            };

            // Only include body if the method is not GET or HEAD
            if (method !== 'GET' && method !== 'HEAD') {
                options.body = JSON.stringify(data);
            }
            if (method === 'GET' && data) {
                const params = new URLSearchParams(data).toString();
                file += `?${params}`;
            }

            // Set a timeout for the fetch request
            const controller = new AbortController();
            options.signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout after 10 seconds

            fetch(file, options)
                .then(response => {
                    clearTimeout(timeoutId);
                    // Check if the response's content type is JSON
                    const contentType = response.headers.get("content-type");
                    // If the response isn't a 2xx status code, treat it as an error
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return contentType && contentType.includes("application/json")
                    ? response.json()
                    : response.text();
                })
                .then(responseData => {
                    if (typeof callback === 'function') {
                        callback.call(this, responseData);
                    }
                    if (typeof responseData === 'string') {
                        // The response is HTML, render it in the error message
                        io.out('errorMotd', 'bad', 'PHP Error', responseData);
                    } else if (responseData.errormsg) {
                        if(responseData.errormsg.success !== ''){
                            const { success, head, message } = responseData.errormsg;
                            switch (success) {
                                case 'bad':
                                    io.out('errorMotd', 'bad', head, message);
                                    break;
                                case 'good':
                                    io.out('errorMotd', 'good', head, message);
                                    setTimeout(() => window.location.reload(), 3000);
                                    break;
                                case 'check':
                                    io.out('errorMotd', 'check', head, message);
                                    break;
                                default:
                                    io.out('errorMotd', 'info', head, message);
                            }
                        }
                    }
                })
                .catch(error => {
                    const errorDetails = `${method} ${file}`;
                    if (error.name === 'AbortError') {
                        io.out('errorMotd', 'bad', 'Request Timeout', `The request to ${errorDetails} took too long and was aborted.`);
                    } else {
                        io.out('errorMotd', 'bad', 'Request Error', `Error on ${errorDetails}: ${error.message}`);
                    }
                    console.error(`Error during fetch to ${errorDetails}:`, error);
                });
            break;
            default:
                console.error(`Action '${action}' is not supported.`);
            break;
            
        }
    },
    out : function (action, element, param3, param4) {
        switch(action){
            case 'bad':
                console.log('%c' + element, 'color: #f9caca; background-color: #d9534f79; font-weight:600; padding: 5pt 10pt; border-radius: 50pt;');
                console.error(getStackTrace());
            break;

            case 'good':
                console.log('%c' + element, 'color: #9dfcc1; background-color: #0e924179; font-weight:600; padding: 5pt 10pt; border-radius: 50pt;');
                console.error(getStackTrace());
            break;

            case 'check':
                console.log('%c' + element, 'color: #e5e5e5; background-color: #ffc40079; font-weight:600; padding: 5pt 10pt; border-radius: 50pt;');
                console.error(getStackTrace());
            break;

            case 'print':
                const prElement = document.querySelector(element);
                if (prElement) {
                    prElement.textContent = param3;
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'printHTML' :
                const aElement = document.querySelector(element);
                if (aElement) {
                    aElement.innerHTML += param3;
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'replace':
                const rElement = document.querySelector(element);
                if (rElement) {
                    if (param4 !== undefined) {
                        // If param4 is defined, replace the param3 string with param4
                        rElement.innerHTML = rElement.innerHTML.replace(new RegExp(param3, 'g'), param4);
                    } else {
                        // If param4 is not defined, replace the entire HTML with param3
                        rElement.innerHTML = param3;
                    }
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'addBefore':
                const bElement = document.querySelector(element);
                if (bElement) {
                    if (bElement.innerHTML.includes(param3)) {
                        bElement.innerHTML = bElement.innerHTML.replace(param3, param4 + param3);
                    } else {
                        io.out('bad', 'Search Error: The search string does not exist within the html element.');
                    }
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'addAfter':
            const pElement = document.querySelector(element);
            if (pElement) {
                if (pElement.innerHTML.includes(param3)) {
                    pElement.innerHTML = pElement.innerHTML.replace(param3, param3 + param4);
                } else {
                    io.out('bad', 'Search Error: The search string does not exist within the html element.');
                }
            } else {
                io.out('bad', 'Element Error: The element does not exist within the html.');
            }
        break;

        case 'errorMotd':
            io.create('body', 'div', {class: 'error-motd'});
            const createError = document.querySelector('.error-motd');
            
            // Initial styles
            createError.style.transition = 'opacity 0.5s, right 0.5s';
            createError.style.position = 'fixed';
            createError.style.display = 'none';
            createError.style.right = '-20rem';
            createError.style.bottom = '1rem';
            createError.style.width = '360px';
            createError.style.opacity = '0';

            // Set the class and content based on the type
            switch (element) {
                case 'bad':
                    createError.className = 'bad-motd';
                    break;
                case 'check':
                    createError.className = 'check-motd';
                    break;
                case 'good':
                    createError.className = 'good-motd';
                    break;
                case 'info':
                    createError.className = 'info-motd';
                    break;
            }
            createError.innerHTML = `<icon align="right">close</icon><b>${param3}</b><p>${param4}</p>`;
            if (createError) {
                const content = createError.querySelector('*'); // Select the first child
                if (content) {
                    content.style.color = '#fff';
                }
            }

            document.body.appendChild(createError);

            // Display the error message with a delay
            setTimeout(() => {
                createError.style.display = 'block';
                setTimeout(() => {
                    createError.style.opacity = '1';
                    createError.style.right = '1rem'; // Move into view
                }, 50);
            }, 0);

            // Hide the error message after 10 seconds
            setTimeout(() => {
                createError.style.opacity = '0';
                createError.style.right = '-20rem'; // Move out of view
                setTimeout(() => {
                    createError.style.display = 'none';
                    document.body.removeChild(createError);
                }, 500); // Wait for the transition to complete
            }, 10500);

            // Handle click on close icon
            document.body.addEventListener('click', function(event) {
                const error = event.target.closest('.good-motd, .bad-motd, .info-motd, .check-motd');
                const icon = event.target.closest('icon');

                if (error && icon) {
                    console.log("Icon was clicked!");
                    error.style.opacity = '0';
                    error.style.right = '-20rem';
                    setTimeout(() => {
                        error.style.display = 'none';
                        try {
                            document.body.removeChild(error);
                        } catch (err) {
                            console.warn("Error removing element:", err);
                        }
                    }, 500);
                }
            });
        break;

        }
    }
};


io.in(conStyle, root, 'config.json');


const links = document.querySelectorAll('#signup, #login, #reset');
const defaultLink = 'signup';



// 1.Form Navigation Section
//This section is ment to handle the display of the forms when a link is clicked.
//It sets it to default(signup) if no link is clicked
if (!localStorage.getItem('linkstore')) {
    localStorage.setItem('linkstore', defaultLink);
}
document.addEventListener('DOMContentLoaded', function(){
    function formInput() {
        const inputs = document.querySelectorAll('form input, form textarea');
        
        // Label floating animation logic
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                let inputId = input.id;
                if (inputId) {
                    const label = document.querySelector(`label[for="${inputId}"]`);
                    if (label) {
                        if (input.value.trim() !== "") {
                            label.style.color = 'var(--accent)';
                            label.style.fontSize = '0.8rem';
                            label.style.top = '-1.4rem';
                            label.style.left = '0';
                        } else {
                            label.style.color = 'var(--accent)';
                            label.style.fontSize = '1rem';
                            label.style.left = '0.5rem';
                            label.style.top = '0.5rem';
                        }
                    }
                }
            });
        });
    
        // Password visibility toggle logic (RUNS ONLY ONCE)
        const passwordContainers = document.querySelectorAll('.input');
    
        passwordContainers.forEach(container => {
            const passwordInput = container.querySelector('input[type="password"]');
            if (passwordInput) {
                // Check if toggle icon already exists
                if (!container.querySelector('.pswd-toggle')) {
                    io.create(container, 'icon', { class: 'pswd-toggle' });
                }
    
                const toggleIcon = container.querySelector('.pswd-toggle');
                toggleIcon.style.fontSize = "14pt";
                toggleIcon.style.color = "var(--secondary2)";
                toggleIcon.style.cursor = "pointer";
                toggleIcon.style.position = "absolute";
                toggleIcon.style.right = "10px";
                toggleIcon.style.top = "50%";
                toggleIcon.style.transform = "translateY(-50%)";
                toggleIcon.textContent = 'visibility';
    
                toggleIcon.addEventListener('click', () => {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        toggleIcon.textContent = 'visibility_off';
                    } else {
                        passwordInput.type = 'password';
                        toggleIcon.textContent = 'visibility';
                    }
                });
            }
        });


    }
    
    formInput();
});

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.input-group .code');

    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Move to the next input if the current one has a value
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', function(event) {
            // Allow the user to navigate backwards with Backspace or ArrowLeft
            if (event.key === 'Backspace' && index > 0 && input.value === '') {
                inputs[index - 1].focus();
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form'); // Select all forms (signup, login, reset)

    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            
            let data = {};
            const formData = new FormData(form);
    
            // Capture and clean form data
            formData.forEach((value, key) => {
                data[key] = value.trim();
            });
    
            const btn = event.submitter.name; // Capture submit button name
            data['action'] = btn; // Add action to the data object
            console.log(data); // Log the data object for debugging
            // Perform AJAX request
            io.in('ajax', post, 'scode/function.php', data, function (res) {
                
                form.reset(); // ✅ Clear the form after processing
            });
        });
    });

    const logout = document.querySelector('#logout');
    if (logout) {
        logout.addEventListener('click', function() {
            io.in(ajax, post, 'scode/function.php', { action: 'logout' }, function(res) {
                if (res.errormsg.success) {
                    io.out(errorMotd, good, res.errormsg.head, res.errormsg.message);
                    setTimeout(function() {
                        window.location.href = "index.php"; // Redirect after 3 seconds if successful
                    }, 3000);
                } else {
                    io.out(errorMotd, bad, res.errormsg.head, res.errormsg.message);
                }
            });
        });
    }
});

//This function is used to update the display of the forms when a link is clicked
function updateFormsDisplay(currentValue) {
    const forms = document.querySelectorAll('.signup, .login, .reset');
    if(forms){
        forms.forEach(form => {
            if (form.classList.contains(currentValue)) {
                form.style.display = 'flex';
            } else {
                form.style.display = 'none';
            }
        });
    }
}
//This section gets value of current link from local storage and updates the display of the forms
let currentLink = localStorage.getItem('linkstore');
if (!currentLink) {
    currentLink = defaultLink;
    localStorage.setItem('linkstore', defaultLink);
}
updateFormsDisplay(currentLink);
//This section listens for click events on the links and updates the display of the forms
links.forEach(link => {
    link.addEventListener('click', () => {
        const linkId = link.id;
        localStorage.setItem('linkstore', linkId);
        updateFormsDisplay(linkId);
    });
});
//End of form navigation section


function showMain(parentSelector, targetClass) {
    const parent = document.querySelector(parentSelector);
    if (!parent) {
        console.error(`Parent element '${parentSelector}' not found.`);
        return;
    }

    const children = parent.children;

    for (let child of children) {
        if (child.classList.contains(targetClass) || parent.querySelector('header') === child) {
            child.style.display = 'flex';
        } else {
            child.style.display = 'none';
        }
    }
}
function navigator(defaultSection, linkSelector, sectionSelector) {
    const icons = document.querySelectorAll(linkSelector);
    const sections = document.querySelectorAll(sectionSelector);

    // Set default section if none is stored
    if (!localStorage.getItem('linkstore')) {
        localStorage.setItem('linkstore', defaultSection);
    }

    const showSection = (sectionId) => {
        sections.forEach(section => {
            section.style.display = section.id === sectionId ? 'flex' : 'none';
        });
    };

    // Show stored section or default on load
    const storedSection = localStorage.getItem('linkstore');
    showSection(storedSection);

    // Handle click events on icons
    icons.forEach(icon => {
        icon.addEventListener('click', function () {
            // Convert title to section ID if needed
            const sectionId = icon.title.replace(/\s+/g, '').toLowerCase(); // "Manage Users" => "manageusers"

            // Store and display the section
            localStorage.setItem('linkstore', sectionId);
            showSection(sectionId);
        });
    });
}