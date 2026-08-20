(function () {
  "use strict";

  var output = document.getElementById("test-output");
  var results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name: name, ok: true });
    } catch (error) {
      results.push({ name: name, ok: false, message: error.message });
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function countRoute(type) {
    return routeNodes().filter(function (node) {
      return node.type === type;
    }).length;
  }

  function routeStages() {
    var data = window.EL_ULTIMO_CAMINO_DATA;
    if (data.routeStages && data.routeStages.length) return data.routeStages;
    return data.route.map(function (node) { return [node]; });
  }

  function routeNodes() {
    return routeStages().reduce(function (nodes, stage) {
      return nodes.concat(stage);
    }, []);
  }

  function byId(list, id) {
    return list.find(function (item) {
      return item.id === id;
    });
  }

  function availableActions() {
    return Array.prototype.slice.call(document.querySelectorAll("#app [data-action]"))
      .filter(function (button) {
        return !button.disabled;
      })
      .map(function (button) {
        return button.getAttribute("data-action");
      });
  }

  function clickAction(action) {
    var button = Array.prototype.slice.call(document.querySelectorAll("#app [data-action]"))
      .find(function (candidate) {
        return candidate.getAttribute("data-action") === action && !candidate.disabled;
      });
    assert(button, "No existe accion disponible: " + action + ". Disponibles: " + availableActions().join(", "));
    button.click();
  }

  function runGameplaySmoke() {
    window.ElUltimoCaminoAudio.setMuted(true);
    clickAction("new-game");
    clickAction("begin-route");

    var steps = 0;
    while (!document.querySelector("#app .final-card") && steps < 260) {
      steps += 1;
      var actions = availableActions();
      var next = null;

      if (actions.indexOf("choose-node:0") !== -1) next = "choose-node:0";
      else if (actions.indexOf("advance-node") !== -1) next = "advance-node";
      else if (actions.indexOf("event-option:0") !== -1) next = "event-option:0";
      else if (actions.indexOf("continue-consequence") !== -1) next = "continue-consequence";
      else if (actions.indexOf("camp-action:heal") !== -1) next = "camp-action:heal";
      else if (actions.indexOf("camp-action:watch") !== -1) next = "camp-action:watch";
      else if (actions.indexOf("finish-camp") !== -1) next = "finish-camp";
      else if (actions.indexOf("combat-attack") !== -1) next = "combat-attack";
      else if (actions.indexOf("combat-skill") !== -1) next = "combat-skill";
      else if (actions.indexOf("enemy-turn") !== -1) next = "enemy-turn";

      assert(next, "La simulacion no sabe continuar. Acciones: " + actions.join(", "));
      clickAction(next);
    }

    assert(steps < 260, "La simulacion excedio el limite de pasos.");
    assert(document.querySelector("#app .final-card"), "No se alcanzo pantalla final.");
    assert(document.getElementById("app").textContent.indexOf("La campana calla") !== -1, "La ruta de humo no alcanzo victoria.");
  }

  function renderResults() {
    var passed = results.filter(function (result) { return result.ok; }).length;
    var failed = results.length - passed;
    output.innerHTML =
      "<p><strong>" + passed + " pasan</strong> / " + failed + " fallan</p>" +
      results.map(function (result) {
        return (
          '<p class="' +
          (result.ok ? "test-pass" : "test-fail") +
          '">' +
          (result.ok ? "OK" : "FALLO") +
          " - " +
          result.name +
          (result.message ? ": " + result.message : "") +
          "</p>"
        );
      }).join("");
  }

  test("Datos base de la iteracion", function () {
    var data = window.EL_ULTIMO_CAMINO_DATA;
    assert(data.protagonist && data.protagonist.id === "guardiana", "Falta protagonista esperado.");
    assert(data.companions.length === 2, "Debe haber dos companeros.");
    assert(data.events.length >= 5, "Debe haber al menos cinco eventos.");
    assert(data.enemies.length >= 3, "Debe haber al menos tres enemigos.");
    assert(data.camp && data.boss, "Falta campamento o jefe.");
  });

  test("Ruta vertical completa", function () {
    var data = window.EL_ULTIMO_CAMINO_DATA;
    assert(routeStages().length >= 7, "El mapa debe tener varios tramos.");
    assert(routeStages().some(function (stage) { return stage.length > 1; }), "Debe haber al menos una bifurcacion real.");
    assert(countRoute("event") >= 5, "La ruta debe ofrecer al menos cinco eventos.");
    assert(countRoute("combat") >= 3, "La ruta debe ofrecer al menos tres combates.");
    assert(countRoute("camp") >= 1, "La ruta debe ofrecer un campamento.");
    assert(countRoute("boss") >= 1, "La ruta debe ofrecer un jefe.");

    routeNodes().forEach(function (node) {
      if (node.type === "event") assert(byId(data.events, node.id), "Evento no encontrado: " + node.id);
      if (node.type === "combat") assert(byId(data.enemies, node.id), "Enemigo no encontrado: " + node.id);
    });
  });

  test("Opciones narrativas validas", function () {
    window.EL_ULTIMO_CAMINO_DATA.events.forEach(function (event) {
      assert(event.options.length >= 2 && event.options.length <= 4, "Opciones invalidas en " + event.id);
      event.options.forEach(function (option) {
        assert(option.label && option.result, "Opcion incompleta en " + event.id);
      });
    });
  });

  test("API de audio procedural disponible", function () {
    ["init", "setMuted", "isMuted", "ui", "map", "event", "camp", "enemy", "boss", "hit", "heal", "guard", "victory", "defeat"].forEach(function (name) {
      assert(typeof window.ElUltimoCaminoAudio[name] === "function", "Falta audio." + name);
    });
  });

  test("Cinco decisiones diferidas configuradas", function () {
    var deferredOptions = [];
    window.EL_ULTIMO_CAMINO_DATA.events.forEach(function (event) {
      event.options.forEach(function (option) {
        if (option.deferred) deferredOptions.push(option.deferred.id);
      });
    });
    assert(deferredOptions.length >= 5, "Deben existir al menos cinco decisiones con consecuencia diferida.");
    assert(new Set(deferredOptions).size === deferredOptions.length, "Las consecuencias diferidas deben tener ids unicos.");
  });

  test("Simulacion de partida completa", runGameplaySmoke);

  try {
    localStorage.removeItem("elUltimoCamino.iteracion1");
  } catch (error) {
    // The browser can restrict localStorage under some file settings.
  }
  renderResults();
})();
