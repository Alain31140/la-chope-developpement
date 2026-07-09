async function chargerDashboard() {
  const response = await fetch("dashboard.json?v=" + Date.now());
  const data = await response.json();

  document.querySelector("header .logo").src = data.commerce.logo;
  document.querySelector("header h1").textContent = data.commerce.nom;
  document.querySelector("header p").textContent =
    data.commerce.slogan + " — MAJ : " + data.maj;

  document.getElementById("note").textContent = data.kpi.note.toFixed(1) + " / 5";
  document.getElementById("satisfaction").textContent = data.kpi.satisfaction + " %";
  document.getElementById("avis").textContent = data.kpi.avis;

  document.getElementById("pointFort").textContent = data.kpi.pointFort;
  document.getElementById("ameliorer").textContent = data.kpi.ameliorer;

  const tendance = data.kpi.tendance;

  document.getElementById("tendance").textContent =
  (tendance > 0 ? "+" + tendance.toFixed(1) :
   tendance < 0 ? tendance.toFixed(1) :
   "0,0") + " pt";

  document.getElementById("trendIcon").textContent =
    tendance > 0 ? "📈" :
    tendance < 0 ? "📉" :
    "➖";

const tendanceCard = document.getElementById("tendance").parentElement;

tendanceCard.classList.remove("trend-up", "trend-down", "trend-stable");

if (tendance > 0) {
    tendanceCard.classList.add("trend-up");
}
else if (tendance < 0) {
    tendanceCard.classList.add("trend-down");
}
else {
    tendanceCard.classList.add("trend-stable");
}

  document.getElementById("trendText").textContent =
    tendance > 0 ? "Hausse" :
    tendance < 0 ? "Baisse" :
    "Stable";

  document.getElementById("cuisine").textContent = data.criteres.cuisine.toFixed(1) + " / 5";
document.getElementById("accueil").textContent = data.criteres.accueil.toFixed(1) + " / 5";
document.getElementById("rapidite").textContent = data.criteres.rapidite.toFixed(1) + " / 5";
document.getElementById("prix").textContent = data.criteres.prix.toFixed(1) + " / 5";

  dessinerGraphique(data.historique);
}

function dessinerGraphique(historique) {
  const zone = document.getElementById("graphPlaceholder");

  zone.innerHTML = "";

  const max = 5;
  const min = 0;
  const width = zone.clientWidth || 800;
  const height = 240;
  const padding = 30;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  svg.setAttribute("width", "100%");
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const points = historique.map((item, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / (historique.length - 1);

    const y =
      height -
      padding -
      ((item.note - min) / (max - min)) * (height - padding * 2);

    return { x, y, ...item };
  });

  const polyline = document.createElementNS(svgNS, "polyline");
  polyline.setAttribute(
    "points",
    points.map(p => `${p.x},${p.y}`).join(" ")
  );
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "#2563eb");
  polyline.setAttribute("stroke-width", "4");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");

  svg.appendChild(polyline);

  points.forEach(p => {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", "#2563eb");

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", p.x);
    label.setAttribute("y", height - 8);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "12");
    label.setAttribute("fill", "#666");
    label.textContent = p.date;

    const value = document.createElementNS(svgNS, "text");
    value.setAttribute("x", p.x);
    value.setAttribute("y", p.y - 10);
    value.setAttribute("text-anchor", "middle");
    value.setAttribute("font-size", "12");
    value.setAttribute("fill", "#333");
    value.textContent = p.note.toFixed(1);

    svg.appendChild(circle);
    svg.appendChild(label);
    svg.appendChild(value);
  });

  zone.appendChild(svg);
}

chargerDashboard();