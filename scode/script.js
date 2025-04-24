let session; // Update session
document.addEventListener('DOMContentLoaded', function() {
    navigator('profile', 'nav icon[title]', 'span.dashboard section');
        io.in(ajax, get, 'scode/function.php', {action : 'session'}, function(res) {
        if (res.session) {
            showMain('body', 'app');
            let manageLink = document.querySelector('nav icon[title="manage"]');
            let manageSection = document.getElementById("manage");
            let usermsg = document.querySelectorAll(".top > span");
            usermsg.innerHTML = ``;
            
            if (res.session.role != 'admin') { 
                if (manageLink) {
                    manageLink.remove();
                }
            
                // Remove the corresponding section
                if (manageSection) {
                    manageSection.remove();
                }
            }else{
                setInterval(function() {
                    io.in('ajax', 'get', 'scode/function.php', {action: 'users'}, function(res) {
                        let users = res.users;
                        let tbody = document.querySelector('table tbody');
                
                        users.forEach(user => {
                            tbody.innerHTML = ''; // Clear existing rows
                            let row = document.createElement("tr");
                            row.innerHTML = `
                                <td>${user.id}</td>
                                <td>${user.fname}</td>
                                <td>${user.lname}</td>
                                <td>${user.role}</td>
                            `+ (user.role == 'admin' ? `<td></td>` : `<td><icon class="delete" data-id="${user.id}">delete</icon></td>`);
                            tbody.appendChild(row);
                        });
                    });
                }, 1000);
            }

            let licenseData = [];

            // Fetch license data every second
            setInterval(() => {
                io.in('ajax', 'get', 'scode/function.php', { action: 'license' }, (res) => {
                    licenseData = res.license;
                    filterAndRender(); // apply filter every refresh
                });
            }, 5000);

            // Render filtered data
            function renderTable(data) {
                const tbody = document.querySelector('.license tbody');
                tbody.innerHTML = '';

                data.forEach(l => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${l.idate}</td>
                        <td>${l.bid}</td>
                        <td>${l.bname}</td>
                        <td>${l.bownr}</td>
                        <td>${l.blc}</td>
                        <td>KES ${l.amt}</td>
                        <td>${l.bact}</td>
                        <td>
                            <p class="${l.bstat === 'active' ? 'badge-active' : 'badge-inactive'}">
                                ${l.bstat}
                            </p>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }

            // Filter logic
            function filterAndRender() {
                const input = document.getElementById('search').value.trim().toLowerCase();

                if (!input) {
                    renderTable(licenseData);
                    return;
                }

                const keywords = input.split(',').map(k => k.trim());

                const filtered = licenseData.filter(item =>
                    keywords.some(key =>
                        item.bname.toLowerCase().includes(key) ||
                        item.bownr.toLowerCase().includes(key) ||
                        item.bid.toLowerCase().includes(key)
                    )
                );

                renderTable(filtered);
            }

            // Live filter on keyup
            document.getElementById('search').addEventListener('keyup', filterAndRender);

            
            setInterval(function() {
                usermsg.forEach(usermsg => {
                    let hour = new Date().getHours();
                    let greeting;
                    if (hour < 12) {
                        greeting = 'Goodmorning';
                    } else if (hour < 18 && hour >= 12) {
                        greeting = 'Good Afternoon';
                    } else {
                        greeting = 'Goodevening';
                    }
                    usermsg.innerHTML = `
                        <p>${greeting}</p>
                        <b>${res.session.fname} ${res.session.lname}</b>
                        <div class="role">${res.session.role}</div>
                    `;
                });
            }
            , 500);
            
        } else {
            showMain('body', 'reg');
        }

    });
});

const popupButtons = document.querySelectorAll(".addlicense, .exit");
const form = document.querySelector(".licenseform");

popupButtons.forEach(button => {
    button.addEventListener("click", () => {
        form.classList.toggle("open");
    });
});
