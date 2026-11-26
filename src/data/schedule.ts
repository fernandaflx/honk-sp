import type { Activity, Band, FestivalDay, Stage, Venue } from "./types";
export const festivalTimeZone = "America/Sao_Paulo";
export const officialInstagram = "https://www.instagram.com/honk.sp/";
export const venues: Record<string, Venue> = {
  "arena-bela-vista": {
    id: "arena-bela-vista",
    name: "Palco Arena Bela Vista",
    address:
      "Rua Prof. Laerte Ramos de Carvalho, 280 - Bela Vista, São Paulo - SP",
  },
  "rua-sao-vicente": {
    id: "rua-sao-vicente",
    name: "Palco Rua São Vicente",
    address: "Rua São Vicente, 120 - Bela Vista, São Paulo - SP",
  },
  ccsp: {
    id: "ccsp",
    name: "Centro Cultural São Paulo",
    address: "Rua Vergueiro, 1000 - Liberdade, São Paulo - SP, 01504-000",
    instagram: "ccspoficial",
  },
  quilombaque: {
    id: "quilombaque",
    name: "Comunidade Cultural Quilombaque",
    address: "Travessa Cambaratiba, 05 - Perus, São Paulo - SP, 05202-010",
  },
  arena: {
    id: "arena",
    name: "Arena Show",
    address: "Av. Nove de Julho, 1100 - Bela Vista, São Paulo - SP, 01312-000",
    instagram: "arenashowsp",
  },
};
export const stages: Stage[] = [
  {
    id: "bela-vista",
    name: "Palco Arena Bela Vista",
    color: "green",
    opensAt: "16:00",
    closesAt: "22:30",
    venueId: "arena-bela-vista",
  },
  {
    id: "sao-vicente",
    name: "Palco Rua São Vicente",
    color: "pink",
    opensAt: "16:30",
    closesAt: "22:00",
    venueId: "rua-sao-vicente",
  },
  {
    id: "quilombaque",
    name: "Palco Quilombaque",
    color: "yellow",
    opensAt: "13:00",
  },
  {
    id: "cambaratiba",
    name: "Palco Rua Cambaratiba",
    color: "green",
    opensAt: "14:00",
  },
  {
    id: "inacia",
    name: "Palco Praça Inácia Dias",
    color: "pink",
    opensAt: "14:00",
  },
];
const bandRows: [string, string, string?, string?][] = [
  ["fanfarrock", "Fanfarrock", "SP", "fanfarrock.sp"],
  ["elas", "Elas, Musicalmente Viajantes", "SP", "a.ciamar"],
  ["cumbia-calavera", "Cumbia Calavera", "SP", "cumbia.calavera"],
  ["saracura", "Bloco Pernas de Saracura", undefined, "pernasdesaracura"],
  ["swing", "Unidos do Swing", "SP", "unidosdoswing"],
  ["sambrass", "Sambrass das Minas", "SP", "sambrass.sp"],
  [
    "trombones-sp",
    "Coletivo de Trombones de Vara a Noite",
    "SP",
    "coletivo.de.trombones.sp",
  ],
  ["bocas", "Bocas Malditas", "PR", "bocasmalditas"],
  ["obscenicas", "Obscênicas", "SP", "asobscenicas"],
  [
    "unides",
    "Unides dos Bloquinhos e del Circo de Rua",
    "SC",
    "unidesdosbloquinhos",
  ],
  ["xamego", "Xamego Dengo", "SP", "xamego.dengo"],
  ["ponte", "Fanfarra da Ponte", "SC", "fanfarradaponte"],
  ["laranja", "Laranja Bahia", "SP", "laranja.bahia"],
  ["ayo", "Bloco Percussivo AYO", "SP", "blocoayo"],
  ["firuliros", "Firuliros da Meia Noite", "SC", "firulirosdameianoite"],
  ["klezmer", "Bloco Klezmer do Bom Retiro", "SP", "blocoklezmer_bomretiro"],
  ["manada", "Manada", "SP", "fanfarramanada"],
  ["britney", "Britney Estava Certa", "DF", "britneyestavacerta"],
  [
    "naomono",
    "Não Monogamia Gostoso Demais",
    "RJ",
    "naomonogamiagostosodemais",
  ],
  ["mona", "Monabloco", "RJ", "mona.bloco"],
  ["besame", "Besame Mucho", "RJ", "blocobesamemucho"],
  ["metais", "Metais Pesados", "RJ", "metaispesados"],
  ["clandestina", "Fanfarra Clandestina", "SP", "fanfarraclandestina"],
  ["aves", "Aves Migratórias", "DF", "avesmigratoriasdebsb"],
  ["viva", "Viva La Vida", "RJ", "blocovivalavida"],
  ["calcinhas", "Calcinhas Bélicas", "RJ", "calcinhasbelicas"],
  ["trombetas", "Trombetas Cósmicas do Jardim Elétrico", "RJ"],
  ["pyranha", "Bloco Pyranha", "SP", "blocopyranha"],
  ["cornucopia", "Cornucópia Desvairada", "SP", "cornucopia.desvairada"],
  ["guetto", "Guetto Brass", "SP", "guettobrass"],
  [
    "trombones-rs",
    "CL.T. de Trombones de Vara a Noite",
    "RS",
    "coletivo_de_trombones",
  ],
  ["mzceja", "Mzčejà Tåbëbo Orquestra", "SP", "mzceja.tabebo"],
  ["fumaca", "Fanfarra Maria Fumaça", "RJ", "fanfarramariafumaca"],
  ["summer", "Summer Eletro Bloco", "RJ", "summereletrobloco"],
  ["pirata", "Bloco Pirata", "SP", "oblocopirata"],
  ["mixtape", "Mixtape Brass Band", "RJ", "mixtapebrass"],
];
export const bands: Record<string, Band> = Object.fromEntries(
  bandRows.map(([id, name, state, instagram]) => [
    id,
    { id, name, state, instagram: instagram ? [instagram] : [] },
  ]),
);
const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
function stageActivities(
  stageId: string,
  start: number,
  ids: string[],
  prefix: "fri" | "sat" = "sat",
): Activity[] {
  return ids.map((bandId, index) => ({
    id: `${prefix}-${bandId}`,
    type: "music",
    bandId,
    stageId,
    start: clock(start + index * 45),
    end: clock(start + (index + 1) * 45),
    timing: "estimated",
  }));
}
// Time windows from the supplied volunteer schedule; band order from the official post.
function fridayStageActivities(
  stageId: string,
  slots: [string, string, string][],
): Activity[] {
  return slots.map(([bandId, start, end]) => ({
    id: `fri-${bandId}`,
    type: bandId === "elas" ? "procession" : "music",
    bandId,
    stageId,
    start,
    end,
    timing: bandId === "ponte" ? "confirmed" : "estimated",
  }));
}
function partyActivities(prefix: string, ids: string[]): Activity[] {
  return ids.map((bandId) => ({
    id: `${prefix}-${bandId}`,
    type: "music",
    bandId,
  }));
}
export const days: FestivalDay[] = [
  {
    id: "2026-11-26",
    weekday: "Quinta",
    date: "26/11",
    title: "A rua começa aqui.",
    pending: false,
    venueId: "ccsp",
    note: "Abertura oficial · 100% gratuita e aberta ao público.",
    activities: [
      {
        id: "thu-workshop",
        type: "workshop",
        name: "Oficina de Pernaltas",
        instagram: ["pernaltasdequinta", "racheldeboa"],
        start: "16:00",
        end: "18:30",
        timing: "confirmed",
      },
      {
        id: "thu-opening",
        type: "opening",
        name: "Recepção e abertura oficial com a organização do HONK! SP",
        start: "18:30",
        end: "19:30",
        timing: "confirmed",
      },
      {
        id: "thu-saracura",
        type: "music",
        bandId: "saracura",
        start: "19:30",
        end: "20:15",
        timing: "confirmed",
      },
      {
        id: "thu-circus",
        type: "show",
        name: "Espetáculo “O Circo da Lona Torta”",
        instagram: ["trupelonapreta"],
        start: "20:15",
        end: "21:15",
        timing: "confirmed",
      },
      {
        id: "thu-swing",
        type: "music",
        bandId: "swing",
        start: "21:15",
        end: "22:00",
        timing: "confirmed",
      },
    ],
  },
  {
    id: "2026-11-27",
    weekday: "Sexta",
    date: "27/11",
    title: "O HONK! SP ocupa o Bixiga",
    pending: false,
    note: "Dois palcos no Bixiga. Horários organizados conforme a grade de voluntariado enviada e a ordem das fanfarras no post oficial do HONK! SP.",
    activities: [
      {
        id: "fri-body-workshop",
        type: "workshop",
        name: "Oficina “O corpo na música”",
        instagram: ["tatiana_vinhais", "bruno_roldo"],
        stageId: "bela-vista",
        start: "17:00",
        end: "18:30",
        timing: "confirmed",
      },
      ...fridayStageActivities("bela-vista", [
        ["firuliros", "18:30", "19:15"],
        ["ponte", "19:15", "20:00"],
        ["mzceja", "20:00", "20:45"],
        ["fanfarrock", "20:45", "21:30"],
        ["manada", "21:30", "22:30"],
      ]),
      ...fridayStageActivities("sao-vicente", [
        ["elas", "17:30", "18:15"],
        ["britney", "18:15", "19:00"],
        ["cumbia-calavera", "19:00", "19:45"],
        ["mixtape", "19:45", "20:30"],
        ["metais", "20:30", "21:15"],
        ["summer", "21:15", "22:00"],
      ]),
    ],
    party: {
      start: "22:00",
      venueId: "arena",
      ticketUrl:
        "https://shotgun.live/pt-br/events/honk-sp-2026-festa-das-musicas-e-dos-musicos-sexta",
      activities: partyActivities("fri-party", [
        "calcinhas",
        "cornucopia",
        "viva",
        "guetto",
        "aves",
        "pyranha",
      ]),
    },
  },
  {
    id: "2026-11-28",
    weekday: "Sábado",
    date: "28/11",
    title: "Ocupa Perus!",
    pending: false,
    venueId: "quilombaque",
    note: "Três palcos nos arredores da comunidade. Os horários de sábado ainda não são oficiais: são estimativas organizadas com base na ordem das apresentações no post oficial do HONK! SP. Os horários serão atualizados assim que a programação completa for divulgada, prevista até sexta-feira (27/11).",
    activities: [
      ...stageActivities("quilombaque", 15 * 60, [
        "sambrass",
        "trombones-sp",
        "bocas",
        "obscenicas",
        "unides",
        "swing",
        "xamego",
        "ponte",
      ]),
      ...stageActivities("cambaratiba", 15 * 60, [
        "laranja",
        "ayo",
        "firuliros",
        "klezmer",
        "manada",
        "britney",
        "naomono",
        "mona",
      ]),
      ...stageActivities("inacia", 15 * 60, [
        "besame",
        "metais",
        "clandestina",
        "aves",
        "viva",
        "calcinhas",
        "trombetas",
        "pyranha",
      ]),
    ],
    party: {
      start: "22:00",
      venueId: "arena",
      ticketUrl:
        "https://shotgun.live/pt-br/events/honk-sp-2026-festa-das-musicas-e-dos-musicos-sexta-2",
      activities: partyActivities("sat-party", [
        "trombones-rs",
        "mzceja",
        "fumaca",
        "summer",
        "pirata",
        "mixtape",
      ]),
    },
  },
  {
    id: "2026-11-29",
    weekday: "Domingo",
    date: "29/11",
    title: "Mais um dia de rua.",
    pending: true,
    activities: [],
  },
];
