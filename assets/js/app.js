async function loadJSON(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error("JSON жүктелмеді: " + path);
  return await r.json();
}

function getParam(name){
  return new URL(window.location.href).searchParams.get(name);
}

function esc(s){
  return String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

const App = {
  async renderTopics(containerId){
    const box = document.getElementById(containerId);
    const topics = await loadJSON("assets/data/topics.json");
    box.innerHTML = topics.map(t => `
      <a class="item item--link" href="topic.html?id=${esc(t.id)}">
        <h3>${esc(t.title)}</h3>
        <p class="small">${esc(t.short)}</p>
      </a>
    `).join("");
  },

  async renderGlossary(listId, searchId){
    const list = document.getElementById(listId);
    const search = document.getElementById(searchId);
    const data = await loadJSON("assets/data/glossary.json");

    function draw(q){
      const qq = (q||"").trim().toLowerCase();
      const filtered = data.filter(x =>
        x.word.toLowerCase().includes(qq) || x.simple.toLowerCase().includes(qq)
      );
      list.innerHTML = filtered.map(x => `
        <div class="item">
          <strong>${esc(x.word)}</strong>
          <p class="small">${esc(x.simple)}</p>
        </div>
      `).join("") || `<div class="item"><strong>Ештеңе табылмады</strong></div>`;
    }

    draw("");
    search.addEventListener("input", e => draw(e.target.value));
  },

  async renderComics(containerId){
    const box = document.getElementById(containerId);
    const comics = await loadJSON("assets/data/comics.json");

    box.innerHTML = comics.map(c => `
      <div class="item">
        <h3>${esc(c.title)}</h3>
        <p class="small">${esc(c.note)}</p>

        <div class="embed" style="margin-top:10px">
          <iframe
            class="embed__frame"
            src="${esc(c.embedUrl)}"
            title="${esc(c.title)}"
            loading="lazy"
            allow="fullscreen"
          ></iframe>
        </div>

        <div style="margin-top:10px">
          <a class="btn btn--ghost" href="topic.html?id=${esc(c.topicId)}">Осы тақырып</a>
        </div>
      </div>
    `).join("");
  },

  async renderAllTasks(containerId){
    const box = document.getElementById(containerId);
    const tasks = await loadJSON("assets/data/tasks.json");
    box.innerHTML = tasks.map(t => `
      <div class="item">
        <h3>${esc(t.topicTitle)} — ${esc(t.title)}</h3>
        ${(t.lines||[]).map(l => `<p class="small">• ${esc(l)}</p>`).join("")}
      </div>
    `).join("");
  },

  async renderTopicPage(ids){
    const topicId = getParam("id") || "t1";

    const [topics, comics, tasks] = await Promise.all([
      loadJSON("assets/data/topics.json"),
      loadJSON("assets/data/comics.json"),
      loadJSON("assets/data/tasks.json")
    ]);

    const t = topics.find(x => x.id === topicId) || topics[0];
    const c = comics.find(x => x.topicId === t.id);
    const tTasks = tasks.filter(x => x.topicId === t.id);

    document.getElementById(ids.topTitleId).textContent = t.title;
    document.getElementById(ids.h1Id).textContent = t.title;
    document.getElementById(ids.descId).textContent = t.short;

    const textBox = document.getElementById(ids.textBoxId);
    textBox.innerHTML = (t.text||[]).map(p => `<p>${esc(p)}</p>`).join("");

    const comicBox = document.getElementById(ids.comicBoxId);
    if(c && c.embedUrl){
      comicBox.innerHTML = `
        <div class="embed">
          <iframe
            class="embed__frame"
            src="${esc(c.embedUrl)}"
            title="${esc(c.title)}"
            loading="lazy"
            allow="fullscreen"
          ></iframe>
        </div>
      `;
    } else {
      comicBox.innerHTML = `<p class="muted">Комикс</p>`;
    }

    const taskBox = document.getElementById(ids.taskBoxId);
    taskBox.innerHTML = tTasks.map(x => `
      <div class="item">
        <h3>${esc(x.title)}</h3>
        ${(x.lines||[]).map(l => `<p class="small">• ${esc(l)}</p>`).join("")}
      </div>
    `).join("") || `<div class="item"><strong>Тапсырма</strong></div>`;
  }
};

window.App = App;
