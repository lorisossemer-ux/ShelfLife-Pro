import { supabase } from "../scripts/supabaseClient.js";

/* -------------------------------------------------
   STATO
--------------------------------------------------*/
let user = null;
const tbody = document.querySelector("#ingredienti tbody");
const els = {
  name: document.getElementById("recipeName"),
  categoria: document.getElementById("categoria"),
  descrizione: document.getElementById("descrizione"),
  note: document.getElementById("notePrivate"),
  totAcqua: document.getElementById("totAcqua"),
  totLibera: document.getElementById("totLibera"),
  awMedia: document.getElementById("awMedia"),
  rischio: document.getElementById("rischio"),
  shelf: document.getElementById("shelfLife"),
  consigli: document.getElementById("consigli"),
  status: document.getElementById("statusBox"),
  archivio: document.getElementById("archivioBox"),
};

/* -------------------------------------------------
   AUTH (Email/Magic link + Google)
--------------------------------------------------*/
const $btnEmail = document.getElementById("btnLoginEmail");
const $btnGoogle = document.getElementById("btnLoginGoogle");
const $btnLogout = document.getElementById("btnLogout");
const $badge = document.getElementById("userBadge");

$btnEmail.onclick = async () => {
  const email = prompt("Inserisci la tua email per ricevere il link di accesso:");
  if (!email) return;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) return alert("Errore login: " + error.message);
  alert("✅ Ti abbiamo inviato un link di accesso via email.");
};

$btnGoogle.onclick = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin }});
  if (error) alert(error.message);
};

$btnLogout.onclick = async () => { await supabase.auth.signOut(); location.reload(); };

supabase.auth.onAuthStateChange(async (_ev, session) => setUser(session?.user ?? null));
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  setUser(session?.user ?? null);
})();

async function setUser(u){
  user = u;
  if (user){
    $badge.style.display = "inline-block";
    $badge.textContent = user.email || "Utente";
    $btnLogout.style.display = "inline-block";
    $btnEmail.style.display = "none";
    $btnGoogle.style.display = "none";
    await upsertUserRow();
    await loadArchivio();
  } else {
    $badge.style.display = "none";
    $btnLogout.style.display = "none";
    $btnEmail.style.display = "inline-block";
    $btnGoogle.style.display = "inline-block";
    els.archivio.innerHTML = '<p class="muted">Accedi per vedere le tue ricette.</p>';
  }
}

async function upsertUserRow(){
  if (!user) return;
  await supabase.from("users").upsert({
    id: user.id,
    email: user.email,
    nome: user.user_metadata?.full_name ?? null
  }, { onConflict: "id" });
}

/* -------------------------------------------------
   UI di base
--------------------------------------------------*/
document.getElementById("btnAdd").onclick = () => addRow();
document.getElementById("btnNew").onclick = () => nuovaRicetta();
document.getElementById("btnDuplicate").onclick = () => duplicaRicetta();
document.getElementById("btnSave").onclick = () => salvaRicetta();
document.querySelectorAll('input[name="tipoProdotto"]').forEach(r => r.addEventListener("change", aggiorna));

function addRow(d={nome:"", g:"", h2o:"", aw:""}) {
  const tr = document.createElement("tr");
  tr.className = "riga";
  tr.innerHTML = `
    <td><input class="ingrediente-nome" value="${d.nome}"></td>
    <td><input class="grammi" type="number" inputmode="decimal" value="${d.g}"></td>
    <td><input class="h2o" type="number" inputmode="decimal" value="${d.h2o}"></td>
    <td><input class="aw" type="number" step="0.01" inputmode="decimal" value="${d.aw}"></td>
    <td class="acqua-totale">0.0 g</td>
    <td class="acqua-libera">0.0 g</td>
    <td><button class="btn del">❌</button></td>`;
  tr.querySelector(".del").onclick = () => { tr.remove(); aggiorna(); };
  tr.querySelectorAll("input").forEach(i => i.addEventListener("input", aggiorna));
  tbody.appendChild(tr);
}

function nuovaRicetta(){
  els.name.value = "";
  els.categoria.value = "";
  els.descrizione.value = "";
  els.note.value = "";
  document.querySelector('input[name="tipoProdotto"][value="crudo"]').checked = true;
  tbody.innerHTML = "";
  addRow();
  aggiorna();
}

function duplicaRicetta(){
  const righe = getRighe();
  els.name.value = (els.name.value.trim() || "Ricetta senza nome") + " (copia)";
  tbody.innerHTML = "";
  righe.forEach(addRow);
  aggiorna();
}

/* -------------------------------------------------
   CALCOLI + RISCHIO
--------------------------------------------------*/
function getRighe(){
  return [...document.querySelectorAll(".riga")].map(r => ({
    nome: r.querySelector(".ingrediente-nome").value.trim(),
    g: +(r.querySelector(".grammi").value || 0),
    h2o: +(r.querySelector(".h2o").value || 0),
    aw: +(r.querySelector(".aw").value || 0),
  }));
}

function getTipo(){ return document.querySelector('input[name="tipoProdotto"]:checked').value; }

function aggiorna(){
  const righe = getRighe();
  let totAcqua = 0, totLibera = 0, sommaPesata = 0;

  document.querySelectorAll(".riga").forEach((r, i) => {
    const g = righe[i].g, h = righe[i].h2o, aw = righe[i].aw;
    const acqua = g * (h/100);
    const libera = acqua * aw;
    r.querySelector(".acqua-totale").textContent = `${acqua.toFixed(1)} g`;
    r.querySelector(".acqua-libera").textContent = `${libera.toFixed(1)} g`;
    totAcqua += acqua; totLibera += libera; sommaPesata += aw * acqua;
  });

  let awMedia = totAcqua ? (sommaPesata / totAcqua) : 0;

  // Correzione cottura per legame acqua (su media aw & acqua libera)
  if (getTipo()==="cotto"){
    const catName = (els.categoria.value || "").toLowerCase() + " " + (els.name.value||"").toLowerCase();
    let coeff = { aw: 0.82, libera: 0.75 };
    if (/frolla|biscott/.test(catName)) coeff = { aw: 0.45, libera: 0.35 };
    else if (/sfoglia|croissant/.test(catName)) coeff = { aw: 0.60, libera: 0.55 };
    else if (/cake|muffin|torta/.test(catName)) coeff = { aw: 0.80, libera: 0.75 };
    else if (/spagna|savoiard|genoise/.test(catName)) coeff = { aw: 0.88, libera: 0.80 };
    awMedia *= coeff.aw;
    totLibera *= coeff.libera;
  }

  els.totAcqua.textContent = `${totAcqua.toFixed(1)} g`;
  els.totLibera.textContent = `${totLibera.toFixed(1)} g`;
  els.awMedia.textContent = awMedia.toFixed(2);

  aggiornaRischio(awMedia, getTipo());
}

function aggiornaRischio(aw, tipo){
  let rischio="—", shelf="—", cons="—";
  if (aw > 0.90){ rischio="🔴 Alto"; shelf= (tipo==="cotto"?"3–6 gg":"1–3 gg (frigo)"); cons="Frigo 0–4 °C"; }
  else if (aw > 0.80){ rischio="🟠 Medio"; shelf=(tipo==="cotto"?"7–15 gg":"5–10 gg"); cons="Ambiente 14–18 °C"; }
  else if (aw > 0.60){ rischio="🟢 Basso"; shelf="15–60 gg"; cons="Ambiente 14–18 °C"; }
  else { rischio="🟢 Molto basso"; shelf="2–6 mesi"; cons="Ambiente asciutto"; }
  els.rischio.textContent = rischio; els.shelf.textContent = shelf; els.consigli.textContent = cons;
}

/* -------------------------------------------------
   CLOUD: SALVA / CARICA (Supabase)
--------------------------------------------------*/
async function salvaRicetta(){
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Accedi prima per salvare nel cloud.");

  const payload = {
    user_id: user.id,
    nome: els.name.value.trim() || "Ricetta senza nome",
    tipo: getTipo(),
    categoria: els.categoria.value || null,
    descrizione: els.descrizione.value || null,
    note_private: els.note.value || null,
    contenuto: { righe: getRighe() }
  };

  const { error } = await supabase.from("ricette").insert([payload]);
  if (error) return alert("Errore salvataggio: " + error.message);

  els.status.textContent = "✅ Ricetta salvata";
  setTimeout(()=> els.status.textContent="", 1500);
  await loadArchivio();
}

async function loadArchivio(){
  if (!user){ els.archivio.innerHTML = ""; return; }
  const { data, error } = await supabase.from("ricette")
    .select("id, nome, tipo, categoria, descrizione, contenuto, data_creazione")
    .eq("user_id", user.id)
    .order("data_creazione", { ascending:false });
  if (error) { els.archivio.textContent = "Errore archivio"; return; }

  els.archivio.innerHTML = data.map(r => {
    // calcolo bollino rischio dall'ultima aw (approssimo ricalcolandola)
    const aw = calcolaAwArchivio(r.contenuto?.righe||[]);
    const dot = aw>0.90 ? "red" : aw>0.80 ? "yellow" : aw>0.60 ? "green" : "lightgreen";
    return `
      <div class="ricettaItem" data-id="${r.id}">
        <div class="badge"><span class="dot ${dot}"></span> <b>${r.nome}</b></div>
        <div class="cat">${r.categoria||"—"} ${r.tipo?`· ${r.tipo}`:""}</div>
        <div class="rowbtn">
          <button class="btn openBtn">Apri</button>
          <button class="delRicetta">🗑️</button>
        </div>
      </div>`;
  }).join("");

  // apertura
  els.archivio.querySelectorAll(".openBtn").forEach(btn=>{
    btn.onclick = (e)=>{
      const card = e.currentTarget.closest(".ricettaItem");
      const id = card.dataset.id;
      const r = data.find(x=>x.id===id);
      caricaRicetta(r);
      document.getElementById("ingredienti").scrollIntoView({behavior:"smooth", block:"start"});
    };
  });

  // elimina
  els.archivio.querySelectorAll(".delRicetta").forEach(btn=>{
    btn.onclick = async (e)=>{
      const id = e.currentTarget.closest(".ricettaItem").dataset.id;
      const r = data.find(x=>x.id===id);
      if (!confirm(`Eliminare "${r.nome}"?`)) return;
      const { error } = await supabase.from("ricette").delete().eq("id", id);
      if (error) return alert("Errore eliminazione: " + error.message);
      await loadArchivio();
    };
  });
}

function calcolaAwArchivio(righe){
  let totAcqua=0, somma=0;
  righe.forEach(d=>{
    const g=+d.g||0, h=+d.h2o||0, aw=+d.aw||0;
    const acqua = g*(h/100);
    totAcqua += acqua;
    somma += aw*acqua;
  });
  return totAcqua ? (somma/totAcqua) : 0;
}

function caricaRicetta(r){
  els.name.value = r.nome || "";
  els.categoria.value = r.categoria || "";
  els.descrizione.value = r.descrizione || "";
  els.note.value = r.note_private || "";
  document.querySelector(`input[name="tipoProdotto"][value="${r.tipo||"crudo"}"]`).checked = true;
  tbody.innerHTML = "";
  (r.contenuto?.righe||[]).forEach(addRow);
  aggiorna();
}

// --- GESTIONE INGREDIENTI PERSONALIZZATI ---

async function loadIngredientsBase() {
  const { data, error } = await supabase.from("ingredienti").select("*").order("nome");
  if (error) {
    console.error("Errore caricamento ingredienti:", error);
    return [];
  }
  return data;
}

async function loadCustomIngredients() {
  const user = supabase.auth.user();
  if (!user) return [];
  const { data, error } = await supabase.from("custom_ingredienti").select("*").eq("user_id", user.id);
  if (error) {
    console.error("Errore caricamento ingredienti personali:", error);
    return [];
  }
  return data;
}

async function upsertCustomIngredient(ing) {
  const user = supabase.auth.user();
  if (!user) {
    alert("Effettua il login per salvare ingredienti personali.");
    return;
  }
  const { error } = await supabase.from("custom_ingredienti").upsert({
    user_id: user.id,
    nome: ing.nome,
    h2o: ing.h2o,
    aw: ing.aw,
    note: ing.note || ""
  });
  if (error) alert("Errore salvataggio ingrediente: " + error.message);
  else alert("Ingrediente salvato con successo!");
}

async function populateIngredientList() {
  const datalist = document.getElementById("ingredients-datalist");
  datalist.innerHTML = "";
  const base = await loadIngredientsBase();
  const custom = await loadCustomIngredients();
  const all = [...base, ...custom];
  all.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i.nome;
    datalist.appendChild(opt);
  });
}

function setupIngredientDialog() {
  const btnAdd = document.getElementById("btn-add-ingredient");
  const dialog = document.getElementById("dlg-ingredient");
  const form = document.getElementById("dlg-ingredient-form");

  btnAdd?.addEventListener("click", () => dialog.showModal());

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ing = {
      nome: document.getElementById("dlg-name").value.trim(),
      h2o: parseFloat(document.getElementById("dlg-water").value),
      aw: parseFloat(document.getElementById("dlg-aw").value),
      note: document.getElementById("dlg-note").value.trim()
    };
    await upsertCustomIngredient(ing);
    dialog.close();
    await populateIngredientList();
  });
}

/* -------------------------------------------------
   BOOT
--------------------------------------------------*/
window.addEventListener("DOMContentLoaded", () => {
  nuovaRicetta(); // una riga pronta
});
