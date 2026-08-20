(function () {
  "use strict";

  var DATA = window.EL_ULTIMO_CAMINO_DATA;
  var Audio = window.ElUltimoCaminoAudio;
  var SAVE_KEY = "elUltimoCamino.iteracion1";
  var app = document.getElementById("app");

  var state = null;
  var combat = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function byId(list, id) {
    return list.find(function (item) {
      return item.id === id;
    });
  }

  function createState(seed) {
    return {
      screen: "title",
      seed: seed || makeSeed(),
      routeIndex: 0,
      currentNode: null,
      visitedNodes: [],
      selected: false,
      protagonist: clone(DATA.protagonist),
      companions: DATA.companions.map(clone),
      resources: { supplies: 5, medicine: 2, light: 5, morale: 5, coins: 0, corruption: 0 },
      inventory: [DATA.protagonist.item],
      flags: {},
      visualFx: "",
      pendingConsequences: [],
      activeConsequence: null,
      decisions: [],
      log: [],
      result: null
    };
  }

  function makeSeed() {
    return "VELO-" + Math.floor(100000 + Math.random() * 900000);
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("No se pudo guardar", error);
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.protagonist || !parsed.companions) return null;
      return normalizeState(parsed);
    } catch (error) {
      return null;
    }
  }

  function normalizeState(savedState) {
    if (!Array.isArray(savedState.visitedNodes)) savedState.visitedNodes = [];
    if (!Array.isArray(savedState.pendingConsequences)) savedState.pendingConsequences = [];
    if (!Array.isArray(savedState.decisions)) savedState.decisions = [];
    if (!savedState.flags) savedState.flags = {};
    if (!savedState.resources) savedState.resources = { supplies: 5, medicine: 2, light: 5, morale: 5, coins: 0, corruption: 0 };
    if (typeof savedState.routeIndex !== "number") savedState.routeIndex = 0;
    if (savedState.routeIndex >= routeLength()) savedState.routeIndex = Math.max(0, routeLength() - 1);
    if (!savedState.currentNode) savedState.currentNode = null;
    if (!savedState.visualFx) savedState.visualFx = "";
    return savedState;
  }

  function clearSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  function startNewGame() {
    state = createState();
    state.screen = "selection";
    pushLog("La senal de Lumora despierta bajo la niebla.");
    save();
    render();
  }

  function continueGame() {
    var saved = load();
    if (!saved) return;
    state = saved;
    render();
  }

  function pushLog(text) {
    state.log.push(text);
    if (state.log.length > 12) state.log.shift();
  }

  function livingParty() {
    return [state.protagonist].concat(state.companions).filter(function (member) {
      return member.stats.hp > 0;
    });
  }

  function allParty() {
    return [state.protagonist].concat(state.companions);
  }

  function clampResources() {
    Object.keys(state.resources).forEach(function (key) {
      if (key === "corruption") {
        state.resources[key] = Math.max(0, state.resources[key]);
      } else {
        state.resources[key] = Math.max(0, state.resources[key]);
      }
    });
  }

  function hpPercent(stats) {
    return Math.max(0, Math.min(100, Math.round((stats.hp / stats.maxHp) * 100)));
  }

  function routeStages() {
    if (DATA.routeStages && DATA.routeStages.length) return DATA.routeStages;
    return DATA.route.map(function (node) {
      return [node];
    });
  }

  function routeLength() {
    return routeStages().length;
  }

  function currentNode() {
    return state.currentNode || routeStages()[state.routeIndex][0];
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setHtml(html) {
    app.innerHTML = html;
  }

  function setFx(name) {
    state.visualFx = name || "";
  }

  function button(label, action, variant) {
    return '<button class="button ' + (variant || "") + '" data-action="' + action + '">' + escapeHtml(label) + "</button>";
  }

  function render() {
    if (!state) {
      state = load() || createState();
    }

    var screens = {
      title: renderTitle,
      selection: renderSelection,
      map: renderMap,
      event: renderEvent,
      consequence: renderConsequence,
      camp: renderCamp,
      combat: renderCombat,
      final: renderFinal
    };

    screens[state.screen]();
    wireButtons();
  }

  function renderShell(content) {
    var routeProgress = state.routeIndex + "/" + routeLength();
    return (
      '<section class="shell">' +
      '<div class="fog-layer fog-a"></div><div class="fog-layer fog-b"></div>' +
      '<header class="topbar">' +
      '<div><strong>El Ultimo Camino</strong><span>Semilla ' +
      escapeHtml(state.seed) +
      "</span></div>" +
      '<div class="topbar-actions">' +
      '<span class="progress">Nodo ' +
      routeProgress +
      "</span>" +
      '<button class="icon-button" data-action="toggle-audio" aria-label="Alternar sonido">' +
      (Audio.isMuted() ? "Sonido no" : "Sonido si") +
      "</button>" +
      "</div>" +
      "</header>" +
      '<div class="layout">' +
      '<aside class="sidebar">' +
      renderParty() +
      renderResources() +
      renderInventory() +
      "</aside>" +
      '<section class="panel screen-' +
      escapeHtml(state.screen) +
      " " +
      escapeHtml(state.visualFx || "") +
      '">' +
      content +
      "</section>" +
      "</div>" +
      "</section>"
    );
  }

  function renderTitle() {
    var hasSave = Boolean(load());
    setHtml(
      '<section class="title-screen">' +
      '<div class="title-fog title-fog-a"></div><div class="title-fog title-fog-b"></div>' +
      '<div class="title-moon" aria-hidden="true"></div>' +
      '<div class="title-road" aria-hidden="true"></div>' +
      '<div class="title-frame">' +
      '<p class="eyebrow">Roguelite narrativo - iteracion 2 audiovisual</p>' +
      "<h1>El Ultimo Camino</h1>" +
      '<p class="subtitle">Una expedicion atraviesa el Velo hacia la ciudad desaparecida de Lumora.</p>' +
      '<div class="title-actions">' +
      button("Nueva partida", "new-game", "primary") +
      (hasSave ? button("Continuar", "continue-game") : "") +
      "</div>" +
      '<p class="small">Version vertical audiovisual: mismas reglas, mas niebla, retratos, transiciones y audio procedural.</p>' +
      "</div>" +
      "</section>"
    );
  }

  function renderSelection() {
    setHtml(
      renderShell(
        '<div class="section-heading">' +
        "<p>Preparacion</p>" +
        "<h2>La expedicion se reune</h2>" +
        "</div>" +
        '<div class="selection-grid">' +
        renderHeroCard(state.protagonist, "Protagonista") +
        state.companions
          .map(function (companion) {
            return renderHeroCard(companion, "Companero");
          })
          .join("") +
        "</div>" +
        '<div class="notice">' +
        "<strong>Objetivo:</strong> " +
        escapeHtml(state.protagonist.goal) +
        "</div>" +
        button("Comenzar el camino", "begin-route", "primary")
      )
    );
  }

  function renderMap() {
    var nodes = routeStages()
      .map(function (stage, index) {
        var status = index < state.routeIndex ? "done" : index === state.routeIndex ? "current" : "";
        var stageNodes = stage
          .map(function (node, nodeIndex) {
            var canChoose = index === state.routeIndex;
            return (
              '<div class="route-choice node-' +
              node.type +
              '">' +
              '<span class="node-label">' +
              escapeHtml(nodeLabel(node)) +
              "</span>" +
              '<small>Riesgo: ' +
              escapeHtml(node.risk || "normal") +
              " - Recompensa: " +
              escapeHtml(node.reward || "avance") +
              "</small>" +
              (canChoose ? button("Tomar ruta", "choose-node:" + nodeIndex, "primary") : "") +
              "</div>"
            );
          })
          .join("");
        return (
          '<div class="map-node node-' +
          stage[0].type +
          " " +
          status +
          '">' +
          '<span class="node-number">' +
          (index + 1) +
          "</span>" +
          stageNodes +
          "</div>"
        );
      })
      .join("");

    setHtml(
      renderShell(
        '<div class="section-heading">' +
        "<p>Mapa</p>" +
        "<h2>Los Campos Quietos</h2>" +
        "</div>" +
        '<div class="map">' +
        nodes +
        "</div>" +
        '<div class="notice">' +
        "Elige un nodo por tramo. Las rutas no tomadas quedan atras cuando avanzas." +
        "</div>" +
        ""
      )
    );
  }

  function nodeLabel(node) {
    if (node.type === "event") return byId(DATA.events, node.id).title;
    if (node.type === "combat") return byId(DATA.enemies, node.id).name;
    if (node.type === "camp") return "Campamento";
    return DATA.boss.name;
  }

  function renderEvent() {
    var node = currentNode();
    var event = byId(DATA.events, node.id);
    var options = event.options
      .map(function (option, index) {
        return button(option.label, "event-option:" + index);
      })
      .join("");

    setHtml(
      renderShell(
        '<article class="story-card reveal-card">' +
        '<div class="section-heading">' +
        "<p>Evento</p>" +
        "<h2>" +
        escapeHtml(event.title) +
        "</h2>" +
        "</div>" +
        "<p>" +
        escapeHtml(event.text) +
        "</p>" +
        '<div class="choice-list">' +
        options +
        "</div>" +
        "</article>"
      )
    );
  }

  function renderConsequence() {
    var consequence = state.activeConsequence;
    if (!consequence) {
      state.screen = "map";
      render();
      return;
    }

    setHtml(
      renderShell(
        '<article class="story-card consequence-card reveal-card">' +
        '<div class="section-heading">' +
        "<p>Consecuencia</p>" +
        "<h2>" +
        escapeHtml(consequence.title) +
        "</h2>" +
        "</div>" +
        "<p>" +
        escapeHtml(consequence.text) +
        "</p>" +
        '<div class="notice">' +
        "<strong>Vuelve la decision:</strong> " +
        escapeHtml(consequence.choice) +
        "</div>" +
        button("Continuar", "continue-consequence", "primary") +
        "</article>"
      )
    );
  }


  function renderCamp() {
    var used = state.flags.campActions || [];
    var actionsLeft = 2 - used.length;
    var actions = DATA.camp.actions
      .map(function (action) {
        var disabled = used.indexOf(action.id) !== -1 || actionsLeft <= 0;
        return (
          '<button class="button" data-action="camp-action:' +
          action.id +
          '"' +
          (disabled ? " disabled" : "") +
          ">" +
          escapeHtml(action.label) +
          "</button>"
        );
      })
      .join("");

    setHtml(
      renderShell(
        '<article class="story-card camp-card reveal-card">' +
        '<div class="section-heading">' +
        "<p>Campamento</p>" +
        "<h2>" +
        escapeHtml(DATA.camp.title) +
        "</h2>" +
        "</div>" +
        "<p>" +
        escapeHtml(DATA.camp.text) +
        "</p>" +
        '<div class="campfire" aria-label="Hoguera animada"><span></span><span></span><span></span></div>' +
        '<p class="small">Acciones restantes: ' +
        actionsLeft +
        "</p>" +
        '<div class="choice-list">' +
        actions +
        "</div>" +
        '<div class="notice">' +
        escapeHtml(DATA.camp.conversations[(used.length + state.resources.morale) % DATA.camp.conversations.length]) +
        "</div>" +
        (actionsLeft <= 0 ? button("Levantar campamento", "finish-camp", "primary") : "")
      )
    );
  }

  function renderCombat() {
    if (!combat) startCombatFromCurrentNode();

    var enemy = combat.enemy;
    var actions = "";
    var actor = livingParty()[combat.turnIndex] || state.protagonist;

    if (combat.phase === "player") {
      actions =
        '<div class="choice-list">' +
        button("Atacar", "combat-attack", "primary") +
        button("Habilidad", "combat-skill") +
        button("Defender", "combat-defend") +
        "</div>";
    } else {
      actions = '<div class="choice-list">' + button("Resolver turno enemigo", "enemy-turn", "primary") + "</div>";
    }

    setHtml(
      renderShell(
        '<article class="combat-card reveal-card">' +
        '<div class="section-heading">' +
        "<p>Combate</p>" +
        "<h2>" +
        escapeHtml(enemy.name) +
        "</h2>" +
        "</div>" +
        '<p class="intent">' +
        escapeHtml(enemy.intent) +
        "</p>" +
        renderEnemy(enemy) +
        '<div class="turn-box">' +
        "<strong>Turno:</strong> " +
        escapeHtml(combat.phase === "player" ? actor.name : enemy.name) +
        "</div>" +
        '<div class="combat-log">' +
        combat.log.map(function (line) { return "<p>" + escapeHtml(line) + "</p>"; }).join("") +
        "</div>" +
        actions +
        "</article>"
      )
    );
  }

  function renderFinal() {
    var survivors = livingParty()
      .map(function (member) {
        return member.name;
      })
      .join(", ");
    var won = state.result === "victory";

    setHtml(
      renderShell(
        '<article class="story-card final-card">' +
        '<div class="section-heading">' +
        "<p>" +
        (won ? "Final" : "Fracaso") +
        "</p>" +
        "<h2>" +
        (won ? "La campana calla" : "El Velo cierra el camino") +
        "</h2>" +
        "</div>" +
        "<p>" +
        (won
          ? "El Campanero Hundido cae de rodillas y la torre deja de sonar. Lumora no se salva, pero durante una noche entera la senal brilla limpia. La expedicion ha comprado tiempo para los que aun recuerdan el mundo."
          : "La niebla aprende vuestros pasos y los borra uno a uno. La senal de Lumora continua brillando, mas lejos que antes, como una promesa hecha a otra gente.") +
        "</p>" +
        '<div class="chronicle">' +
        "<h3>Cronica breve</h3>" +
        "<p><strong>Supervivientes:</strong> " +
        escapeHtml(survivors || "Nadie") +
        "</p>" +
        "<p><strong>Inventario:</strong> " +
        escapeHtml(state.inventory.join(", ") || "vacio") +
        "</p>" +
        "<p><strong>Ruta:</strong> " +
        escapeHtml(state.visitedNodes.map(function (node) { return node.label; }).join(" -> ") || "sin registrar") +
        "</p>" +
        "<p><strong>Decisiones recordadas:</strong> " +
        escapeHtml(state.decisions.map(function (decision) { return decision.choice; }).join(", ") || "ninguna") +
        "</p>" +
        "<p><strong>Ultimos hechos:</strong></p>" +
        state.log.map(function (line) { return "<p>" + escapeHtml(line) + "</p>"; }).join("") +
        "</div>" +
        button("Volver al titulo", "back-title", "primary")
      )
    );
  }

  function renderHeroCard(member, role) {
    return (
      '<article class="character-card">' +
      portrait(member.portrait) +
      "<p>" +
      escapeHtml(role) +
      "</p>" +
      "<h3>" +
      escapeHtml(member.name) +
      "</h3>" +
      '<span class="tag">' +
      escapeHtml(member.title || member.profession) +
      "</span>" +
      "<p>" +
      escapeHtml(member.description || member.personality) +
      "</p>" +
      '<p class="small"><strong>Habilidad:</strong> ' +
      escapeHtml(member.skill.name) +
      " - " +
      escapeHtml(member.skill.description) +
      "</p>" +
      "</article>"
    );
  }

  function portrait(type) {
    var colors = {
      guardiana: ["#d7b46a", "#28313d", "#8d2730"],
      maia: ["#b8d8c0", "#273c35", "#70414c"],
      brann: ["#d69b5f", "#2e332c", "#385f69"]
    }[type] || ["#d7b46a", "#28313d", "#8d2730"];

    return (
      '<svg class="portrait portrait-' +
      escapeHtml(type) +
      '" viewBox="0 0 120 120" role="img" aria-label="Retrato">' +
      '<defs>' +
      '<linearGradient id="skin-' +
      escapeHtml(type) +
      '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' +
      colors[0] +
      '"/><stop offset="1" stop-color="#8d6c50"/></linearGradient>' +
      '<radialGradient id="glow-' +
      escapeHtml(type) +
      '" cx="50%" cy="32%" r="62%"><stop offset="0" stop-color="#f5d88c" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      "</defs>" +
      '<rect width="120" height="120" rx="8" fill="' +
      colors[1] +
      '"/>' +
      '<rect width="120" height="120" rx="8" fill="url(#glow-' +
      escapeHtml(type) +
      ')"/>' +
      '<path d="M17 106c6-29 24-45 43-45s37 16 43 45" fill="' +
      colors[2] +
      '"/>' +
      '<circle cx="60" cy="47" r="25" fill="url(#skin-' +
      escapeHtml(type) +
      ')"/>' +
      portraitDetails(type) +
      '<path d="M42 56c9 4 26 4 36 0" stroke="#17191d" stroke-width="3" stroke-linecap="round" opacity="0.76"/>' +
      '<path d="M38 73c13 9 31 9 44 0" stroke="#efd79b" stroke-width="2" opacity="0.18"/>' +
      "</svg>"
    );
  }

  function portraitDetails(type) {
    if (type === "guardiana") {
      return (
        '<path d="M28 42c7-28 57-31 65 0-20-8-44-8-65 0z" fill="#16191f"/>' +
        '<path d="M36 31l24-16 24 16-10 8H46z" fill="#b79249"/>' +
        '<path d="M30 83h60l8 23H22z" fill="#2b333f"/>' +
        '<path d="M60 18v28" stroke="#edd289" stroke-width="3"/>' +
        '<path d="M45 48h9M66 48h9" stroke="#0d1115" stroke-width="3" stroke-linecap="round"/>'
      );
    }
    if (type === "maia") {
      return (
        '<path d="M33 39c8-22 43-30 56-1-8 10-42 12-56 1z" fill="#25362f"/>' +
        '<path d="M28 86c7-16 19-23 32-23s25 7 32 23l-7 20H35z" fill="#42554a"/>' +
        '<path d="M35 75c14 7 36 7 50 0" stroke="#b8d8c0" stroke-width="3" opacity="0.5"/>' +
        '<path d="M44 48h8M68 48h8" stroke="#0d1115" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M26 60c7 4 12 12 14 24" stroke="#a7cdb1" stroke-width="3" opacity="0.56"/>'
      );
    }
    return (
      '<path d="M31 40c8-24 47-24 57 1-13-7-36-8-57-1z" fill="#20231f"/>' +
      '<path d="M22 86c12-15 23-23 38-23s27 8 38 23l-5 20H27z" fill="#385f69"/>' +
      '<path d="M40 43c15-8 28-8 43 0" stroke="#d69b5f" stroke-width="4" opacity="0.7"/>' +
      '<path d="M43 49h10M67 49h10" stroke="#0d1115" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M77 67c5 3 8 7 9 12" stroke="#d69b5f" stroke-width="3" opacity="0.65"/>'
    );
  }

  function renderParty() {
    return (
      '<section class="side-section">' +
      "<h2>Grupo</h2>" +
      allParty()
        .map(function (member) {
          var stats = member.stats;
          return (
            '<div class="mini-member">' +
            "<strong>" +
            escapeHtml(member.name) +
            "</strong>" +
            '<div class="bar"><span style="width:' +
            hpPercent(stats) +
            '%"></span></div>' +
            '<small>Vida ' +
            Math.max(0, stats.hp) +
            "/" +
            stats.maxHp +
            " - Foco " +
            stats.focus +
            "/" +
            stats.maxFocus +
            "</small>" +
            "</div>"
          );
        })
        .join("") +
      "</section>"
    );
  }

  function renderResources() {
    var res = state.resources;
    return (
      '<section class="side-section">' +
      "<h2>Recursos</h2>" +
      '<div class="resource-grid">' +
      resource("Comida", res.supplies) +
      resource("Medicina", res.medicine) +
      resource("Luz", res.light) +
      resource("Moral", res.morale) +
      resource("Moneda", res.coins) +
      resource("Corrupcion", res.corruption) +
      "</div>" +
      "</section>"
    );
  }

  function resource(label, value) {
    return "<span><strong>" + escapeHtml(label) + "</strong>" + value + "</span>";
  }

  function renderInventory() {
    return (
      '<section class="side-section">' +
      "<h2>Inventario</h2>" +
      '<ul class="inventory">' +
      state.inventory.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") +
      "</ul>" +
      "</section>"
    );
  }

  function renderEnemy(enemy) {
    return (
      '<div class="enemy-box">' +
      '<div class="enemy-sigil enemy-' +
      escapeHtml(enemy.id) +
      '"><span></span></div>' +
      '<div class="enemy-info">' +
      "<strong>" +
      escapeHtml(enemy.name) +
      "</strong>" +
      '<div class="bar enemy"><span style="width:' +
      hpPercent(enemy) +
      '%"></span></div>' +
      "<small>Vida " +
      Math.max(0, enemy.hp) +
      "/" +
      enemy.maxHp +
      "</small>" +
      "</div>" +
      "</div>"
    );
  }

  function wireButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-action]"), function (element) {
      element.addEventListener("click", function () {
        Audio.init();
        Audio.ui();
        handleAction(element.getAttribute("data-action"));
      });
    });
  }

  function handleAction(action) {
    if (action === "new-game") startNewGame();
    if (action === "continue-game") continueGame();
    if (action === "begin-route") {
      state.selected = true;
      state.screen = "map";
      setFx("fx-transition");
      Audio.map();
      pushLog("La Guardiana, Maia y Brann cruzan el ultimo mojón visible.");
      save();
      render();
    }
    if (action === "advance-node") advanceNode();
    if (action.indexOf("choose-node:") === 0) chooseNode(Number(action.split(":")[1]));
    if (action.indexOf("event-option:") === 0) chooseEvent(Number(action.split(":")[1]));
    if (action === "continue-consequence") continueConsequence();
    if (action.indexOf("camp-action:") === 0) chooseCamp(action.split(":")[1]);
    if (action === "finish-camp") finishNode("El grupo deja atras las brasas.");
    if (action === "combat-attack") playerAttack(false);
    if (action === "combat-skill") playerAttack(true);
    if (action === "combat-defend") playerDefend();
    if (action === "enemy-turn") enemyTurn();
    if (action === "back-title") {
      clearSave();
      state = createState();
      render();
    }
    if (action === "toggle-audio") {
      Audio.setMuted(!Audio.isMuted());
      render();
    }
  }

  function advanceNode() {
    var node = currentNode();
    if (!node) {
      endGame("victory");
      return;
    }
    enterNode(node);
  }

  function chooseNode(index) {
    var stage = routeStages()[state.routeIndex];
    var node = stage && stage[index];
    if (!node) return;
    state.currentNode = clone(node);
    state.visitedNodes.push({
      stage: state.routeIndex,
      label: nodeLabel(node),
      type: node.type
    });
    enterNode(state.currentNode);
  }

  function enterNode(node) {
    if (node.type === "event") {
      state.screen = "event";
      Audio.event();
    }
    if (node.type === "camp") {
      state.flags.campActions = [];
      state.screen = "camp";
      Audio.camp();
    }
    if (node.type === "combat" || node.type === "boss") {
      combat = null;
      state.screen = "combat";
      if (node.type === "boss") {
        Audio.boss();
      } else {
        Audio.enemy();
      }
    }
    setFx("fx-transition");
    save();
    render();
  }

  function chooseEvent(index) {
    var event = byId(DATA.events, currentNode().id);
    var option = event.options[index];
    setFx("fx-choice");
    rememberDecision(event, option);
    applyEffects(option.effects || {});
    pushLog(event.title + ": " + option.result);
    finishNode(option.result);
  }

  function rememberDecision(event, option) {
    state.decisions.push({
      event: event.title,
      choice: option.label,
      routeIndex: state.routeIndex
    });
    if (!option.deferred) return;
    state.pendingConsequences.push({
      id: option.deferred.id,
      title: option.deferred.title,
      text: option.deferred.text,
      choice: option.label,
      source: event.title,
      dueRouteIndex: state.routeIndex + 1 + option.deferred.delay,
      effects: option.deferred.effects || {}
    });
  }

  function activateDueConsequence() {
    var index = state.pendingConsequences.findIndex(function (consequence) {
      return consequence.dueRouteIndex <= state.routeIndex;
    });
    if (index === -1) return false;
    state.activeConsequence = state.pendingConsequences.splice(index, 1)[0];
    state.screen = "consequence";
    setFx("fx-choice");
    Audio.event();
    return true;
  }

  function continueConsequence() {
    var consequence = state.activeConsequence;
    if (!consequence) {
      state.screen = "map";
      render();
      return;
    }
    applyEffects(consequence.effects || {});
    pushLog("Consecuencia de " + consequence.source + ": " + consequence.title + ".");
    state.activeConsequence = null;
    if (state.screen === "final") return;
    if (!activateDueConsequence()) {
      state.screen = "map";
    }
    save();
    render();
  }

  function applyEffects(effects) {
    Object.keys(effects).forEach(function (key) {
      var value = effects[key];
      if (key === "addItem") {
        state.inventory.push(value);
      } else if (key === "healParty") {
        healParty(value);
      } else if (key === "partyDamage") {
        damageParty(value);
      } else if (key === "bossWeakened") {
        state.flags.bossWeakened = true;
      } else if (state.resources.hasOwnProperty(key)) {
        state.resources[key] += value;
      }
    });
    clampResources();
    checkPressure();
  }

  function checkPressure() {
    if (state.resources.supplies <= 0) {
      state.resources.morale = Math.max(0, state.resources.morale - 1);
      pushLog("El hambre vuelve las frases cortas y las miradas largas.");
    }
    if (state.resources.light <= 0) {
      damageParty(2);
      pushLog("Sin luz, el Velo roza la piel del grupo.");
    }
    if (state.resources.morale <= 0) {
      damageParty(1);
      pushLog("La moral cae tan bajo que incluso respirar parece negociable.");
    }
  }

  function healParty(amount) {
    allParty().forEach(function (member) {
      if (member.stats.hp > 0) {
        member.stats.hp = Math.min(member.stats.maxHp, member.stats.hp + amount);
      }
    });
    Audio.heal();
  }

  function damageParty(amount) {
    allParty().forEach(function (member) {
      if (member.stats.hp > 0) {
        member.stats.hp -= amount;
      }
    });
    Audio.hit();
    checkDefeat();
  }

  function chooseCamp(actionId) {
    var action = byId(DATA.camp.actions, actionId);
    if (!action) return;
    setFx(actionId === "heal" ? "fx-heal" : "fx-choice");
    state.flags.campActions.push(actionId);
    applyEffects(action.effect);
    pushLog("Campamento: " + action.label + ".");
    save();
    render();
  }

  function startCombatFromCurrentNode() {
    var node = currentNode();
    var enemyData = node.type === "boss" ? DATA.boss : byId(DATA.enemies, node.id);
    var enemy = clone(enemyData);
    if (node.type === "boss" && state.flags.bossWeakened) {
      enemy.hp -= 8;
      enemy.maxHp -= 8;
    }
    combat = {
      enemy: enemy,
      phase: "player",
      turnIndex: 0,
      round: 0,
      guard: 0,
      weaken: 0,
      log: [enemy.intro]
    };
  }

  function currentActor() {
    var party = livingParty();
    if (combat.turnIndex >= party.length) combat.turnIndex = 0;
    return party[combat.turnIndex];
  }

  function playerAttack(useSkill) {
    var actor = currentActor();
    if (!actor || actor.stats.hp <= 0) return;
    var damage = actor.stats.power;

    if (useSkill) {
      var skill = actor.skill;
      if (actor.stats.focus < skill.cost) {
        combat.log.push(actor.name + " intenta concentrarse, pero no le queda foco.");
        advanceCombatTurn();
        render();
        return;
      }
      actor.stats.focus -= skill.cost;
      if (skill.heal) {
        setFx("fx-heal");
        healMostWounded(skill.heal);
        combat.log.push(actor.name + " usa " + skill.name + ".");
        advanceCombatTurn();
        render();
        return;
      }
      damage = skill.damage || damage;
      if (skill.guard) combat.guard += skill.guard;
      if (skill.weaken) combat.weaken += skill.weaken;
      setFx("fx-player-hit");
      combat.log.push(actor.name + " usa " + skill.name + ".");
    } else {
      setFx("fx-player-hit");
      combat.log.push(actor.name + " ataca.");
    }

    damageEnemy(Math.max(1, damage - combat.enemy.armor));
    advanceCombatTurn();
    render();
  }

  function playerDefend() {
    var actor = currentActor();
    combat.guard += 3;
    actor.stats.focus = Math.min(actor.stats.maxFocus, actor.stats.focus + 1);
    combat.log.push(actor.name + " levanta la guardia y recupera foco.");
    setFx("fx-guard");
    Audio.guard();
    advanceCombatTurn();
    render();
  }

  function healMostWounded(amount) {
    var target = livingParty().sort(function (a, b) {
      return a.stats.hp / a.stats.maxHp - b.stats.hp / b.stats.maxHp;
    })[0];
    if (!target) return;
    target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + amount);
    Audio.heal();
  }

  function damageEnemy(amount) {
    combat.enemy.hp -= amount;
    Audio.hit();
    combat.log.push("El enemigo recibe " + amount + " de dano.");
    if (combat.enemy.hp <= 0) {
      Audio.victory();
      finishNode(combat.enemy.name + " cae y el camino vuelve a existir.");
      combat = null;
    }
  }

  function advanceCombatTurn() {
    if (!combat) return;
    var party = livingParty();
    combat.turnIndex += 1;
    if (combat.turnIndex >= party.length) {
      combat.phase = "enemy";
      combat.turnIndex = 0;
    }
  }

  function enemyTurn() {
    var pattern = combat.enemy.pattern[combat.round % combat.enemy.pattern.length];
    combat.round += 1;
    if (pattern === "strike") enemyStrike(combat.enemy.power);
    if (pattern === "wail") {
      state.resources.morale = Math.max(0, state.resources.morale - 1);
      enemyStrike(combat.enemy.power - 1);
      combat.log.push("El lamento roba una chispa de moral.");
    }
    if (pattern === "ash") {
      damageParty(3);
      combat.log.push("La ceniza muerde a todo el grupo.");
    }
    if (pattern === "dread") {
      state.resources.morale = Math.max(0, state.resources.morale - 2);
      combat.log.push("El Recolector pronuncia nombres casi correctos.");
    }
    if (pattern === "bell") {
      state.resources.morale = Math.max(0, state.resources.morale - 1);
      enemyStrike(combat.enemy.power + 1);
      combat.log.push("La campana golpea tambien por dentro.");
    }
    combat.phase = "player";
    combat.turnIndex = 0;
    if (combat.log.length > 7) combat.log = combat.log.slice(-7);
    save();
    render();
  }

  function enemyStrike(baseDamage) {
    var target = chooseEnemyTarget();
    if (!target) return;
    var armorBonus = target.id === "guardiana" && livingParty().length === 3 ? 1 : 0;
    var damage = Math.max(1, baseDamage - target.stats.armor - armorBonus - combat.guard - combat.weaken);
    target.stats.hp -= damage;
    setFx("fx-enemy-hit");
    combat.log.push(combat.enemy.name + " hiere a " + target.name + " por " + damage + ".");
    combat.guard = 0;
    combat.weaken = 0;
    Audio.hit();
    checkDefeat();
  }

  function chooseEnemyTarget() {
    var party = livingParty();
    return party.sort(function (a, b) {
      return b.stats.hp - a.stats.hp;
    })[0];
  }

  function checkDefeat() {
    if (state.protagonist.stats.hp <= 0) {
      endGame("defeat");
      return;
    }
    if (livingParty().length === 0) {
      endGame("defeat");
    }
  }

  function finishNode(text) {
    if (text) pushLog(text);
    if (state.screen === "final") return;
    state.routeIndex += 1;
    state.currentNode = null;
    combat = null;
    if (state.routeIndex >= routeLength()) {
      endGame("victory");
    } else {
      if (!activateDueConsequence()) {
        state.screen = "map";
      }
    }
    save();
    render();
  }

  function endGame(result) {
    state.result = result;
    state.screen = "final";
    if (result === "victory") Audio.victory();
    if (result === "defeat") Audio.defeat();
    save();
    render();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      var primary = document.querySelector(".button.primary:not([disabled])");
      if (primary) primary.click();
    }
    if (event.key === "m" || event.key === "M") {
      Audio.setMuted(!Audio.isMuted());
      render();
    }
  });

  render();
})();
