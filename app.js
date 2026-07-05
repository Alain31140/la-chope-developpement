let CONFIG = {};

let AVIS = [];

window.addEventListener("DOMContentLoaded", chargerConfiguration);

async function chargerConfiguration() {

    try {

        const response = await fetch("config.json");

        if (!response.ok) {
            throw new Error("Impossible de charger config.json");
        }

        CONFIG = await response.json();

        initialiser();

    }
    catch (err) {

        console.error(err);

        alert("Erreur de chargement du fichier de configuration.");

    }

}

function initialiser() {

    console.log("INIT OK");

    const btn = document.getElementById("btnEnvoyer");
    const contact = document.getElementById("contact");
    const zone = document.getElementById("questionnaire");

    if (!btn || !zone) {
        console.error("ELEMENTS HTML MANQUANTS");
        return;
    }

    btn.disabled = true;

    afficherCommerce();
    construireQuestionnaire();

    btn.addEventListener("click", envoyer);

    // CONTACT SAFE
    if (contact) {
        contact.addEventListener("change", toggleContactFields);
    }

    toggleContactFields();
}

/* =========================
   COMMERCE
========================= */

function afficherCommerce() {

    document.getElementById("commerceNom").textContent = CONFIG.commerce.nom;
    document.getElementById("commerceSlogan").textContent = CONFIG.commerce.slogan;

    const logo = document.getElementById("logo");

    logo.onerror = function () {
        logo.style.display = "none";
    };

    logo.src = CONFIG.commerce.logo;
}

/* =========================
   QUESTIONNAIRE
========================= */

function construireQuestionnaire() {

    const zone = document.getElementById("questionnaire");

    CONFIG.questions.forEach((question, index) => {

        AVIS[index] = 0;

        const bloc = document.createElement("div");
        bloc.className = "question";

        const titre = document.createElement("label");
        titre.textContent = question;

        const note = document.createElement("span");
        note.id = "note-" + index;
        note.textContent = "0 / 5";
        note.style.float = "right";
        note.style.color = "#777";

        titre.appendChild(note);
        bloc.appendChild(titre);

        const etoiles = document.createElement("div");
        etoiles.className = "stars";

        for (let i = 1; i <= 5; i++) {

            const star = document.createElement("span");
            star.className = "star";
            star.innerHTML = "★";

            star.dataset.question = index;
            star.dataset.note = i;

            star.onclick = selectionner;

            etoiles.appendChild(star);
        }

        bloc.appendChild(etoiles);
        zone.appendChild(bloc);
    });
}

/* =========================
   STARS
========================= */

function selectionner() {

    const question = this.dataset.question;
    const note = Number(this.dataset.note);

    AVIS[question] = note;

    document.getElementById("note-" + question)
        .textContent = note + " / 5";

    document.querySelectorAll('.star[data-question="' + question + '"]')
        .forEach(star => {
            star.classList.toggle("active", Number(star.dataset.note) <= note);
        });

   document.getElementById("btnEnvoyer").disabled =
    AVIS.some(v => v === 0);
}

/* =========================
   CONTACT FIELDS
========================= */

function toggleContactFields() {

    const contact = document.getElementById("contact");
    const phone = document.getElementById("phoneBlock");
    const email = document.getElementById("emailBlock");

    if (!contact || !phone || !email) return;

    const show = contact.checked;

    phone.style.display = show ? "block" : "none";
    email.style.display = show ? "block" : "none";
}

/* =========================
   VALIDATION
========================= */

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^(\+33|0)[1-9](\d{8})$/.test(phone.replace(/\s/g, ""));
}

/* =========================
   ENVOI
========================= */

function envoyer() {

console.log("🚀 TEST ENVOI MAKE");

    const commentaire = document.getElementById("commentaire").value.trim();
    const prenom = document.getElementById("prenom").value.trim();

    const contact = document.getElementById("contact").checked;

    let phone = "";
    let email = "";

    if (contact) {

    phone = document.getElementById("phone").value.trim();
    email = document.getElementById("email").value.trim();

    if (phone !== "" && !isValidPhone(phone)) {
        alert("Téléphone invalide");
        return;
    }

    if (email !== "" && !isValidEmail(email)) {
        alert("Email invalide");
        return;
    }
}

    if (AVIS.some(v => v === 0)) {
    alert("Merci de noter toutes les questions.");
    return;
}

    let total = 0;
    AVIS.forEach(n => total += Number(n));

    const moyenne = total / AVIS.length;

    let pastille = moyenne >= 4 ? "🟢" : moyenne >= 3 ? "🟡" : "🔴";

    let resultat = {

    	commerce: CONFIG.commerce.nom,

    	emailCommerce: CONFIG.commerce.email,

    	date: new Date().toLocaleString(),

    	notes: AVIS,

    	moyenne: moyenne.toFixed(1),

    	pastille,

    	commentaire,

   	prenom,

    	contact,

    	contactTexte: contact ? "Oui" : "Non",
		
    	phone,

    	email

	};


console.log("👉 ENVOI WEBHOOK");
console.log(JSON.stringify(resultat, null, 2));


    console.log("RESULTAT:", resultat);

console.log("🚀 ENVOI MAKE START");

fetch("https://hook.eu1.make.com/nwgi0ghxwg8a4ud9qmoj5qnj5cfahuma", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(resultat)
})
.then(response => {
    console.log("📡 STATUS:", response.status);
    console.log("📡 ENVOI OK");
})
.catch(err => {
    console.log("❌ ERREUR MAKE:", err);
});
console.log("📤 requête envoyée");

    // UI success
    document.getElementById("formulaire").style.display = "none";

document.getElementById("merciCommerce").textContent =
    "Toute l'équipe de " +
    CONFIG.commerce.nom +
    " vous remercie de votre visite.";

document.getElementById("merci").classList.remove("merci-cache");
document.getElementById("merci").classList.add("merci-visible");
}