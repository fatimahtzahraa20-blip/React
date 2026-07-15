// ================================
// Mobile Menu Toggle
// ================================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

// ================================
// Smooth Scrolling
// ================================

const links = document.querySelectorAll('a[href^="#"]');

links.forEach(link => {

    link.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });

            navLinks.classList.remove("active");

        }

    });

});

// ================================
// Active Navbar Link
// ================================

const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    document.querySelectorAll(".nav-links a").forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

// ================================
// Back To Top Button
// ================================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if (!topBtn) return;

    if (window.scrollY > 400) {

        topBtn.style.display = "flex";

    } else {

        topBtn.style.display = "none";

    }

});

if (topBtn) {

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

// ================================
// Scroll Reveal Animation
// ================================

const revealElements = document.querySelectorAll(

    ".about, .skills, .projects, .journey, .why-work, .contact, .project-card, .skill-card, .detail-card"

);

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    },

    {

        threshold: 0.2

    }

);

revealElements.forEach(el => {

    el.classList.add("fade-up");

    observer.observe(el);

});

// ================================
// Counter Animation
// ================================

const counters = document.querySelectorAll(".info-item h3");

counters.forEach(counter => {

    const originalText = counter.innerText;

    const number = parseInt(originalText);

    const suffix = originalText.replace(number, "");

    let count = 0;

    const speed = Math.ceil(number / 40);

    const updateCounter = () => {

        if (count < number) {

            count += speed;

            counter.innerText = count + suffix;

            requestAnimationFrame(updateCounter);

        } else {

            counter.innerText = originalText;

        }

    };

    updateCounter();

});

// ================================
// Navbar Background On Scroll
// ================================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        navbar.style.background = "rgba(15,23,42,0.95)";

        navbar.style.boxShadow = "0 15px 35px rgba(0,0,0,.3)";

    } else {

        navbar.style.background = "rgba(30,41,59,.65)";

        navbar.style.boxShadow = "none";

    }

});
/* ======================================
   CONTACT FORM
====================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {

contactForm.addEventListener("submit", async (e) => {

e.preventDefault();

const formMessage = document.getElementById("formMessage");

const submitBtn = contactForm.querySelector("button");

submitBtn.disabled = true;

submitBtn.innerHTML = "Sending...";

const formData = {

name: document.getElementById("name").value,

email: document.getElementById("email").value,

subject: document.getElementById("subject").value,

message: document.getElementById("message").value

};

try {

const response = await fetch("/contact", {

method: "POST",

headers: {

"Content-Type": "application/json"

},

body: JSON.stringify(formData)

});

const result = await response.json();

if (result.success) {

formMessage.style.color = "#22c55e";

formMessage.innerHTML = "✅ Message sent successfully!";

contactForm.reset();

}

else {

formMessage.style.color = "#ef4444";

formMessage.innerHTML = "❌ " + result.message;

}

}

catch (error) {

formMessage.style.color = "#ef4444";

formMessage.innerHTML = "❌ Server connection failed.";

}

submitBtn.disabled = false;

submitBtn.innerHTML = "Send Message";

});

}