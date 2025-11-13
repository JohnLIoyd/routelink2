import { db } from "./firebase-config.js";
import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const form = document.getElementById("contactForm");

if (form) {
    const nameInput = form.querySelector("#contactName");
    const emailInput = form.querySelector("#contactEmail");
    const messageInput = form.querySelector("#contactMessage");
    const successMessage = form.querySelector(".contact-success");
    const errorMessage = form.querySelector(".contact-error");
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        hideMessages();

        const name = nameInput?.value.trim();
        const email = emailInput?.value.trim();
        const message = messageInput?.value.trim();

        if (!name || !email || !message) {
            showError("Please fill in all fields.");
            return;
        }

        toggleLoading(true);

        try {
            await addDoc(collection(db, "contactMessages"), {
                name,
                email,
                message,
                createdAt: serverTimestamp()
            });

            showSuccess("Message sent! We'll get back to you soon.");
            form.reset();
        } catch (error) {
            console.error("Failed to submit contact form", error);
            showError("Something went wrong. Please try again.");
        } finally {
            toggleLoading(false);
        }
    });

    function hideMessages() {
        if (successMessage) successMessage.style.display = "none";
        if (errorMessage) errorMessage.style.display = "none";
    }

    function showSuccess(text) {
        if (!successMessage) return;
        successMessage.textContent = text;
        successMessage.style.display = "block";
    }

    function showError(text) {
        if (!errorMessage) return;
        errorMessage.textContent = text;
        errorMessage.style.display = "block";
    }

    function toggleLoading(isLoading) {
        if (!submitButton) return;
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? "Sending..." : "Send Message";
    }
}

