import { databases, ID, DATABASE_ID, COLLECTION_ID } from './app.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, button, .magnetic-btn');

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant cursor
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0
        });
    });

    // Smooth follower
    gsap.ticker.add(() => {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        gsap.set(follower, { x: followerX, y: followerY });
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            follower.classList.add('hovered');
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            follower.classList.remove('hovered');
            gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });

        // Magnetic effect
        link.addEventListener('mousemove', (e) => {
            if (link.classList.contains('magnetic-btn')) {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(link, { x: x * 0.2, y: y * 0.2, duration: 0.3 });
            }
        });
    });

    // --- 2. Preloader & Initial Animations ---
    const tl = gsap.timeline();

    tl.to('.preloader-text', {
        opacity: 1,
        y: "0",
        duration: 1,
        ease: "power4.out"
    })
        .to('.preloader-text', {
            opacity: 0,
            y: "-20px",
            duration: 0.5,
            delay: 0.5
        })
        .to('.preloader', {
            height: 0,
            duration: 1,
            ease: "power4.inOut"
        }, "-=0.2")
        .from('.navbar', {
            y: "-100%",
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        }, "-=0.5")
        .from('.intro-anim', {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power4.out"
        }, "-=0.8")
        .to('.reveal-text', {
            y: "0%",
            opacity: 1,
            stagger: 0.2,
            duration: 1.2,
            ease: "power4.out"
        }, "-=1");

    // --- 3. Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Navbar Scrolled State
    ScrollTrigger.create({
        start: "top -50",
        end: 99999,
        toggleClass: { className: 'scrolled', targets: '.navbar' }
    });

    // Parallax Hero
    gsap.to('.hero-bg', {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
            trigger: '.hero',
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Parallax Section Image
    gsap.to('.parallax-img', {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
            trigger: '.about-grid',
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // Stagger Cards
    gsap.from('.stagger-card', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
        scrollTrigger: {
            trigger: '.services-grid',
            start: "top 80%"
        }
    });

    // Fade-ins
    const fadeEls = document.querySelectorAll('.fade-in');
    fadeEls.forEach(el => {
        gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%"
            }
        });
    });

    // Marquee Continuous Scroll
    const marquee = document.querySelector('.marquee');
    if (marquee) {
        gsap.to(marquee, {
            xPercent: -50,
            ease: "none",
            duration: 15,
            repeat: -1
        });
    }

    // --- 4. Form Submission ---
    const form = document.getElementById('bookingForm');
    const submitBtn = document.getElementById('submitBtn');
    const alertBox = document.getElementById('alertMessage');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('name').value.trim();
            const phoneInput = document.getElementById('phone').value.trim();

            const btnText = submitBtn.querySelector('.btn-text');
            const spinner = submitBtn.querySelector('.spinner');

            btnText.classList.add('hidden');
            spinner.classList.remove('hidden');
            submitBtn.style.pointerEvents = 'none';

            hideAlert();

            try {
                if (DATABASE_ID.includes('REPLACE')) {
                    throw new Error("Setup Error: Please configure Appwrite credentials in app.js");
                }

                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    ID.unique(),
                    {
                        name: nameInput,
                        phone_number: phoneInput
                    }
                );

                showAlert("Request sent. Our concierge will contact you shortly.", 'success');
                form.reset();

            } catch (error) {
                console.error("Appwrite Submission Error:", error);
                const errorMsg = error.message || "An error occurred. Please check console.";

                // Add friendly hint for typical document structure errors
                if (errorMsg.includes("Invalid document structure")) {
                    showAlert(`Database Error: ${errorMsg}\n\nPlease check your Appwrite Database Attributes to ensure they match exactly what is being sent.`, 'error');
                } else {
                    showAlert(errorMsg, 'error');
                }
            } finally {
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
                submitBtn.style.pointerEvents = 'all';
            }
        });
    }

    let alertTimeout;

    function showAlert(msg, type) {
        clearTimeout(alertTimeout);
        alertBox.textContent = msg;
        alertBox.className = `form-alert ${type}`;
        alertBox.style.display = 'block';

        // Slight delay to allow display:block to apply before changing opacity
        setTimeout(() => {
            alertBox.style.opacity = '1';
        }, 10);

        if (type === 'success') {
            alertTimeout = setTimeout(hideAlert, 6000);
        }
    }

    function hideAlert() {
        alertBox.style.opacity = '0';
        alertTimeout = setTimeout(() => {
            alertBox.style.display = 'none';
        }, 300);
    }
});
