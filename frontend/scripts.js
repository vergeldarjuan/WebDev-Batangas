const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (navbar && document.getElementById('hero')) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
});
const hero = document.getElementById('hero');
if (hero) {
    hero.classList.add('loaded');
}

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
    if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
    }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = (await fetch('/backend/api/auth.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())).user;
    console.log(currentUser);
    const guestItems = document.querySelectorAll('.auth-guest');
    const userItems = document.querySelectorAll('.auth-user');
    const navUserLink = document.getElementById('navUser');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        guestItems.forEach(el => el.style.display = 'none');
        userItems.forEach(el => el.style.display = 'list-item');
        if (navUserLink) {
            navUserLink.href = 'user.html'; 
        }
    } else {
        guestItems.forEach(el => el.style.display = 'list-item');
        userItems.forEach(el => el.style.display = 'none');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('/backend/api/auth.php?action=logout', {
                method: 'POST',
            });
            window.location.reload();
        });
    }
});