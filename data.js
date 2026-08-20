(function () {
  "use strict";

  window.EL_ULTIMO_CAMINO_DATA = {
    protagonist: {
      id: "guardiana",
      name: "La Guardiana",
      title: "Juramento de Hierro",
      portrait: "guardiana",
      description:
        "Una veterana que aprendio a sostener puertas cuando todo lo demas cedia. Protege mejor que nadie, pero carga con la culpa de una retirada antigua.",
      stats: { maxHp: 34, hp: 34, armor: 1, focus: 3, maxFocus: 3, power: 6 },
      passive: "Mientras los dos companeros sigan vivos, gana +1 armadura.",
      skill: {
        name: "Interponerse",
        description: "Hace 5 de dano y gana 3 de guardia para el siguiente ataque enemigo.",
        damage: 5,
        guard: 3,
        cost: 1
      },
      item: "Medallon agrietado",
      goal: "Llegar a Lumora y averiguar por que la senal repite su antiguo juramento."
    },
    companions: [
      {
        id: "maia",
        name: "Maia",
        portrait: "maia",
        profession: "Sanadora de caminos",
        personality: "Practica, compasiva, seca cuando tiene miedo.",
        fear: "Que la compasion sea solo otra forma de vanidad.",
        desire: "Encontrar una cura para las heridas que deja el Velo.",
        secret: "Ha ocultado sintomas de infeccion en otra expedicion.",
        stats: { maxHp: 24, hp: 24, armor: 0, focus: 3, maxFocus: 3, power: 4 },
        skill: {
          name: "Manos quietas",
          description: "Cura 7 de salud al aliado mas herido.",
          heal: 7,
          cost: 1
        },
        explore: "Puede gastar 1 medicina para evitar una herida de evento."
      },
      {
        id: "brann",
        name: "Brann",
        portrait: "brann",
        profession: "Cazador de lindes",
        personality: "Bromista por defensa propia, atento a huellas que nadie mas ve.",
        fear: "Quedarse solo en silencio absoluto.",
        desire: "Probar que aun existe un camino de regreso.",
        secret: "Reconocio una voz familiar dentro de la niebla y no se lo dijo al grupo.",
        stats: { maxHp: 27, hp: 27, armor: 0, focus: 2, maxFocus: 2, power: 5 },
        skill: {
          name: "Flecha al tendon",
          description: "Hace 4 de dano y reduce en 2 el proximo dano del enemigo.",
          damage: 4,
          weaken: 2,
          cost: 1
        },
        explore: "Revela si una eleccion atraera combate."
      }
    ],
    events: [
      {
        id: "puente_nombres",
        title: "El puente de los nombres raspados",
        text:
          "El primer puente conserva placas de bronce, pero alguien ha limado todos los nombres. Bajo los tablones se oye agua, aunque el cauce esta seco. Maia toca una placa y retira la mano como si quemara. Brann dice que hay pisadas recientes y que ninguna vuelve. Cruzar ahorraria horas; bajar al cauce podria revelar que ocurrio aqui.",
        options: [
          {
            label: "Cruzar en silencio",
            result: "Avanzais sin mirar las placas. El Velo queda atras, ofendido pero lento.",
            effects: { light: -1, morale: 1 },
            deferred: {
              id: "placas_calladas",
              delay: 2,
              title: "Los nombres no cruzados",
              text: "Dos nodos despues, las placas del puente repiquetean dentro de las mochilas. Nadie las trajo, pero durante un tramo cada cual oye un nombre que prefirio no leer. El silencio os ahorro tiempo; tambien dejo una deuda pequena al Velo.",
              effects: { morale: -1, corruption: 1 }
            }
          },
          {
            label: "Bajar al cauce",
            result: "En el lecho seco encontrais una bolsa impermeable y una carta sin firma.",
            effects: { supplies: -1, coins: 2, addItem: "Carta sin firma" }
          },
          {
            label: "Dejar un nombre propio en una placa",
            result: "La placa acepta el nombre con un susurro. La Guardiana siente el juramento mas ligero.",
            effects: { corruption: 1, morale: 2 }
          }
        ]
      },
      {
        id: "carro_varado",
        title: "El carro varado",
        text:
          "Un carro de otra expedicion yace inclinado junto a un fresno. No hay cuerpos, solo mantas dobladas y una olla aun tibia. En el barro alguien escribio: 'No sigais la campana'. Maia quiere buscar supervivientes. Brann mira hacia el este, donde una cuerda se pierde entre ramas bajas.",
        options: [
          {
            label: "Registrar el carro",
            result: "No encontrais personas, pero si vendas, pan duro y una aguja de plata.",
            effects: { supplies: 2, medicine: 1, morale: -1 },
            deferred: {
              id: "duenos_del_carro",
              delay: 2,
              title: "La olla vuelve a hervir",
              text: "Mas adelante, el olor de aquella olla tibia aparece entre los matorrales. Maia encuentra una cuchara marcada con dientes. Tomasteis lo util de una expedicion perdida; ahora sabeis que algo la estaba siguiendo antes de que vosotros llegarais.",
              effects: { supplies: -1, medicine: 1 }
            }
          },
          {
            label: "Seguir la cuerda",
            result: "La cuerda lleva a una trampa vieja. Brann la desarma con una reverencia exagerada.",
            effects: { morale: 1, light: -1, addItem: "Campanilla muda" }
          },
          {
            label: "Apartarse del lugar",
            result: "Dejais el carro intacto. Durante un rato nadie hace bromas.",
            effects: { morale: -1, light: 1 }
          }
        ]
      },
      {
        id: "ermita_fracturada",
        title: "La ermita fracturada",
        text:
          "La ermita aparece partida por la mitad, como si una mano enorme hubiese retirado una pared para mirar dentro. En el altar queda una lampara con aceite claro. Al encenderla, las sombras no retroceden: se arrodillan. La senal de Lumora palpita una vez, lejos, paciente.",
        options: [
          {
            label: "Tomar el aceite",
            result: "La lampara se apaga sin protesta. Vuestra luz durara mas esta noche.",
            effects: { light: 2, morale: -1 },
            deferred: {
              id: "aceite_de_ermita",
              delay: 2,
              title: "La llama arrodillada",
              text: "Cuando usais el aceite de la ermita, la llama prende hacia abajo, como una lengua cansada. Las sombras vuelven a arrodillarse. Esta vez no rezan: senalan el camino con dedos demasiado largos.",
              effects: { light: 1, morale: -1 }
            }
          },
          {
            label: "Rezar aunque nadie responda",
            result: "No responde ningun dios, pero el grupo respira al mismo ritmo por primera vez.",
            effects: { morale: 2, healParty: 2 }
          },
          {
            label: "Romper la lampara",
            result: "El vidrio suena como hielo. Algo del Velo se retuerce lejos de vosotros.",
            effects: { corruption: -1, light: -1 }
          }
        ]
      },
      {
        id: "nino_de_sal",
        title: "El nino de sal",
        text:
          "En medio del camino hay una estatua pequena hecha de sal gris. Tiene los ojos vendados con tela nueva. Cuando os acercais, habla con la voz de un nino cansado: 'Decidme donde esta mi casa y os dire que os espera'. Nadie recuerda haber visto una aldea cerca.",
        options: [
          {
            label: "Mentirle con dulzura",
            result: "El nino sonrie. 'Entonces vosotros tambien estais perdidos'. La niebla se abre un instante.",
            effects: { light: 1, corruption: 1 },
            deferred: {
              id: "mentira_de_sal",
              delay: 1,
              title: "La casa inventada",
              text: "El nino de sal vuelve en una charca. Describe la casa que le mentisteis: puerta azul, pan en la mesa, nadie muerto. Brann no dice nada durante un buen rato. La mentira fue amable, pero ha aprendido a caminar.",
              effects: { morale: -1, light: 1 }
            }
          },
          {
            label: "Confesar que no lo sabeis",
            result: "La sal se agrieta. Dentro queda un pequeno mapa grabado en hueso.",
            effects: { morale: 1, addItem: "Mapa de hueso" }
          },
          {
            label: "Retirar la venda",
            result: "Maia os detiene demasiado tarde. Los ojos vacios reflejan a alguien detras de cada uno.",
            effects: { partyDamage: 3, morale: -1 }
          }
        ]
      },
      {
        id: "luz_lumora",
        title: "La primera vision de Lumora",
        text:
          "Al atardecer, las nubes se abren y la ciudad desaparecida muestra una aguja iluminada. No parece una ruina desde aqui. Parece una invitacion. Brann traga saliva. Maia murmura que ninguna ciudad sana brilla de ese modo. La Guardiana reconoce el ritmo de la senal: tres pulsos, pausa, tres pulsos.",
        options: [
          {
            label: "Responder con el medallon",
            result: "El medallon se calienta. La ruta al campanario aparece en vuestra memoria como si siempre hubiese estado ahi.",
            effects: { morale: 2, corruption: 1 },
            deferred: {
              id: "pulso_del_medallon",
              delay: 0,
              title: "Tres pulsos antes de la torre",
              text: "Antes de alcanzar la torre, el medallon late tres veces contra el pecho de la Guardiana. La senal responde desde Lumora con el mismo ritmo. El Campanero ya sabe que venis, pero tambien parece tener miedo.",
              effects: { morale: 1, bossWeakened: true }
            }
          },
          {
            label: "Cubrir la luz y seguir",
            result: "Avanzais sin mirar. El miedo no desaparece, pero aprende a caminar con vosotros.",
            effects: { morale: 1, light: -1 }
          },
          {
            label: "Prometer llegar cueste lo que cueste",
            result: "La promesa pesa. Todos la oyen. Nadie pregunta que significa exactamente 'cueste lo que cueste'.",
            effects: { morale: 3, partyDamage: 2 }
          }
        ]
      },
      {
        id: "pozo_campanas",
        title: "El pozo de las campanas pequenas",
        text:
          "El camino se hunde alrededor de un pozo cubierto por tablones negros. Desde abajo suben campanadas diminutas, cada una con una voz distinta. Brann dice que bajar ahi es pedirle al mundo que cierre la tapa. Maia, en cambio, distingue una palabra repetida: 'agua'. La cuerda del cubo sigue intacta.",
        options: [
          {
            label: "Bajar el cubo",
            result: "El cubo vuelve con agua clara y una campana pequena dentro. No suena hasta que nadie la mira.",
            effects: { supplies: 1, light: -1, addItem: "Campana pequena" }
          },
          {
            label: "Clavar los tablones",
            result: "El pozo deja de sonar. Durante un rato, el silencio parece una criatura satisfecha.",
            effects: { morale: 1, light: -1 }
          },
          {
            label: "Escuchar una campanada completa",
            result: "Ois un nombre que no deberia estar ahi. La ruta hacia la torre se vuelve mas corta, o tal vez mas hambrienta.",
            effects: { corruption: 1, bossWeakened: true }
          }
        ]
      },
      {
        id: "cruce_de_tizas",
        title: "El cruce de tizas",
        text:
          "Tres caminos se juntan en una piedra cubierta de marcas de tiza. Una mano temblorosa dibujo flechas hacia todas partes y escribio debajo: 'Dos mienten, una tiene hambre'. Las huellas se contradicen. Maia propone borrar las marcas para que nadie mas caiga. Brann prefiere copiarlas antes de que la humedad se las lleve.",
        options: [
          {
            label: "Copiar las marcas",
            result: "El mapa de hueso, si lo llevais, vibra contra la copia. Si no, la tiza basta para orientaros un poco mejor.",
            effects: { light: 1, morale: 1 }
          },
          {
            label: "Borrar el cruce",
            result: "La piedra queda limpia. Quien venga detras tendra menos mentiras, pero tambien menos avisos.",
            effects: { morale: 2, supplies: -1 }
          },
          {
            label: "Seguir la flecha mas gastada",
            result: "El sendero muerde las botas con barro frio. No era el mas seguro, pero evita una vuelta larga.",
            effects: { partyDamage: 2, light: 1 }
          }
        ]
      }
    ],
    enemies: [
      {
        id: "peregrino_vacio",
        name: "Peregrino Vacio",
        intro: "Una figura con bordon arrastra los pies. Bajo la capucha no hay rostro, solo polvo.",
        maxHp: 32,
        hp: 32,
        armor: 0,
        power: 7,
        intent: "Golpeara al mas sano; defender reduce mucho el impacto.",
        pattern: ["strike", "strike", "wail"]
      },
      {
        id: "ciervo_ceniza",
        name: "Ciervo de Ceniza",
        intro: "Un ciervo quemado sin llama baja la cornamenta. Cada pisada deja un circulo blanco.",
        maxHp: 38,
        hp: 38,
        armor: 1,
        power: 8,
        intent: "Alterna embestidas y sacudidas de ceniza.",
        pattern: ["strike", "ash", "strike"]
      },
      {
        id: "recolector_nombres",
        name: "Recolector de Nombres",
        intro: "La criatura lleva etiquetas colgadas del pecho. Algunas tienen vuestra letra.",
        maxHp: 34,
        hp: 34,
        armor: 0,
        power: 7,
        intent: "Roba moral antes de atacar; si lo dejas vivir, erosiona al grupo.",
        pattern: ["dread", "strike", "strike"]
      },
      {
        id: "lobo_del_velo",
        name: "Lobo del Velo",
        intro: "Una bestia baja surge sin separar la niebla de su lomo. Tiene demasiadas costillas y ningun ruido.",
        maxHp: 32,
        hp: 32,
        armor: 0,
        power: 8,
        intent: "Ataca rapido y castiga a quien no se cubra.",
        pattern: ["strike", "strike", "dread"]
      }
    ],
    camp: {
      title: "Campamento bajo una encina hueca",
      text:
        "Encendeis una hoguera baja dentro del tronco abierto de una encina. La madera crepita con un tono casi humano. Solo hay tiempo para dos tareas antes de que el Velo vuelva a moverse.",
      actions: [
        { id: "heal", label: "Curar heridas", effect: { healParty: 6, medicine: -1 } },
        { id: "cook", label: "Cocinar raciones", effect: { supplies: -1, morale: 2, healParty: 2 } },
        { id: "watch", label: "Vigilar la niebla", effect: { light: -1, bossWeakened: true } },
        { id: "talk", label: "Hablar con el grupo", effect: { morale: 2 } }
      ],
      conversations: [
        "Maia confiesa que cura mejor cuando no piensa en nombres. Brann responde que eso explica su caligrafia.",
        "Brann afila una flecha y pregunta si Lumora tendra tabernas. Maia dice que si las tiene, probablemente cobran recuerdos.",
        "La Guardiana mira el medallon. Durante un instante, la hoguera proyecta tres sombras por cada persona."
      ]
    },
    boss: {
      id: "campanero_hundido",
      name: "El Campanero Hundido",
      intro:
        "En la torre inclinada, una campana sumergida en aire negro empieza a sonar. El campanero no levanta el martillo: levanta la cabeza, y bajo su piel se mueven campanas pequenas.",
      maxHp: 58,
      hp: 58,
      armor: 1,
      power: 9,
      intent: "Sus golpes hieren el cuerpo y la moral; conviene llegar con recursos.",
      pattern: ["bell", "strike", "strike", "bell"]
    },
    routeStages: [
      [
        { type: "event", id: "puente_nombres", risk: "seguro", reward: "moral" },
        { type: "event", id: "carro_varado", risk: "duda", reward: "recursos" }
      ],
      [
        { type: "combat", id: "peregrino_vacio", risk: "medio", reward: "ruta estable" },
        { type: "combat", id: "ciervo_ceniza", risk: "alto", reward: "menos rodeo" }
      ],
      [
        { type: "event", id: "ermita_fracturada", risk: "espiritual", reward: "luz" },
        { type: "event", id: "nino_de_sal", risk: "corrupcion", reward: "atajo" },
        { type: "event", id: "cruce_de_tizas", risk: "incierto", reward: "orientacion" }
      ],
      [
        { type: "combat", id: "recolector_nombres", risk: "moral", reward: "conocimiento" },
        { type: "combat", id: "lobo_del_velo", risk: "salud", reward: "rapidez" }
      ],
      [
        { type: "camp", risk: "tiempo", reward: "recuperacion" }
      ],
      [
        { type: "event", id: "luz_lumora", risk: "corrupcion", reward: "campanario" },
        { type: "event", id: "pozo_campanas", risk: "campanas", reward: "ventaja contra jefe" }
      ],
      [
        { type: "boss", risk: "letal", reward: "final" }
      ]
    ],
    route: [
      { type: "event", id: "puente_nombres" },
      { type: "combat", id: "peregrino_vacio" },
      { type: "event", id: "carro_varado" },
      { type: "combat", id: "ciervo_ceniza" },
      { type: "event", id: "ermita_fracturada" },
      { type: "camp" },
      { type: "event", id: "nino_de_sal" },
      { type: "combat", id: "recolector_nombres" },
      { type: "event", id: "luz_lumora" },
      { type: "boss" }
    ]
  };
})();
