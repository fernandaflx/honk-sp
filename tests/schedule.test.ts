import assert from "node:assert/strict";
import test from "node:test";
import {
  bands,
  days,
  stages,
  venues,
  festivalTimeZone,
} from "../src/data/schedule";
import { groupByStart, toMinutes } from "../src/lib/schedule";
const all = days.flatMap((day) => [
  ...day.activities,
  ...(day.party?.activities ?? []),
]);
test("53 unique activities and complete references", () => {
  assert.equal(all.length, 53);
  assert.equal(new Set(all.map((a) => a.id)).size, 53);
  for (const day of days) {
    if (day.venueId) assert.ok(venues[day.venueId]);
    for (const a of [...day.activities, ...(day.party?.activities ?? [])]) {
      if (a.bandId) assert.ok(bands[a.bandId]);
      if (a.stageId) assert.ok(stages.some((s) => s.id === a.stageId));
    }
  }
  assert.equal(festivalTimeZone, "America/Sao_Paulo");
});
test("Thursday preserves all confirmed windows and activity types", () => {
  assert.deepEqual(
    days[0].activities.map((a) => [a.start, a.end]),
    [
      ["16:00", "18:30"],
      ["18:30", "19:30"],
      ["19:30", "20:15"],
      ["20:15", "21:15"],
      ["21:15", "22:00"],
    ],
  );
  assert.ok(days[0].activities.every((a) => a.timing === "confirmed"));
  assert.equal(new Set(days[0].activities.map((a) => a.type)).size, 4);
  assert.equal(days[0].activities[0].instagram?.length, 2);
});
test("Saturday keeps 45 minute slots and revised Quilombaque anchors", () => {
  const saturday = days[2];
  assert.equal(saturday.activities.length, 24);
  for (const stage of stages.filter((stage) =>
    saturday.activities.some((activity) => activity.stageId === stage.id),
  )) {
    const items = saturday.activities.filter((a) => a.stageId === stage.id);
    assert.equal(items.length, 8);
    assert.equal(items[0].start, "15:00");
    items.forEach((a, i) => {
      assert.equal(toMinutes(a.end!) - toMinutes(a.start!), 45);
      assert.equal(a.timing, "estimated");
      if (i) assert.equal(items[i - 1].end, a.start);
    });
  }
  assert.equal(saturday.activities.at(-1)?.end, "21:00");
  const xamego = saturday.activities.find(
    (activity) => activity.bandId === "xamego",
  );
  assert.equal(xamego?.start, "19:30");
  assert.equal(xamego?.end, "20:15");
  assert.equal(
    saturday.activities.find((activity) => activity.bandId === "ponte")?.start,
    "20:15",
  );
  const groups = groupByStart(saturday.activities);
  assert.equal(groups.find(([time]) => time === "15:00")?.[1].length, 3);
  assert.equal(
    saturday.activities.find((activity) => activity.bandId === "unides")?.start,
    "18:00",
  );
  assert.equal(
    saturday.activities.find((activity) => activity.bandId === "swing")?.start,
    "18:45",
  );
});
test("Parties have correct tickets and no invented times", () => {
  const parties = days.flatMap((d) => (d.party ? [d.party] : []));
  assert.equal(parties.length, 2);
  assert.ok(parties[0].ticketUrl.endsWith("-sexta"));
  assert.ok(parties[1].ticketUrl.endsWith("-sexta-2"));
  for (const party of parties) {
    assert.equal(party.start, "22:00");
    assert.equal(party.activities.length, 6);
    assert.ok(
      party.activities.every(
        (a) => a.start === undefined && a.end === undefined,
      ),
    );
  }
});
test("Distinct trombone collectives, missing profiles and pending days", () => {
  assert.equal(bands["trombones-sp"].state, "SP");
  assert.equal(bands["trombones-rs"].state, "RS");
  assert.deepEqual(bands["trombones-rs"].instagram, ["coletivo_de_trombones"]);
  assert.deepEqual(bands["trombones-sp"].instagram, [
    "coletivo.de.trombones.sp",
  ]);
  assert.deepEqual(bands.calcinhas.instagram, ["calcinhasbelicas"]);
  assert.equal(bands.trombetas.instagram.length, 0);
  assert.deepEqual(
    days.filter((d) => d.pending).map((d) => d.weekday),
    ["Domingo"],
  );
});

test("Initial page renders all 53 activities, pending days and separate party sections", async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: FestivalGuide } =
    await import("../src/components/festival-guide");
  const html = renderToStaticMarkup(React.createElement(FestivalGuide));
  assert.equal((html.match(/data-activity-id=/g) ?? []).length, 53);
  assert.equal((html.match(/Programação em breve/g) ?? []).length, 1);
  assert.equal((html.match(/Comprar ingressos/g) ?? []).length, 2);
  assert.equal(
    (html.match(/<details class="party-details">/g) ?? []).length,
    2,
  );
  assert.equal((html.match(/Ver fanfarras/g) ?? []).length, 2);
  assert.equal((html.match(/<time>22h<\/time>/g) ?? []).length, 2);
  assert.ok(html.includes('aria-pressed="true">Todos'));
  assert.ok(html.includes("pernaltasdequinta"));
  assert.ok(html.includes("racheldeboa"));
  assert.ok(html.includes("instagram.com/calcinhasbelicas/"));
});

test("Friday matches supplied volunteer time windows and published band order", () => {
  const friday = days[1];
  assert.equal(friday.pending, false);
  assert.equal(friday.activities.length, 12);
  const arena = friday.activities.filter(
    (activity) => activity.stageId === "bela-vista",
  );
  const street = friday.activities.filter(
    (activity) => activity.stageId === "sao-vicente",
  );
  assert.deepEqual(
    arena.slice(1).map((activity) => activity.bandId),
    ["firuliros", "ponte", "mzceja", "fanfarrock", "manada"],
  );
  assert.deepEqual(
    street.map((activity) => activity.bandId),
    ["elas", "britney", "cumbia-calavera", "mixtape", "metais", "summer"],
  );
  assert.equal(arena[0].start, "17:00");
  assert.equal(arena[0].end, "18:30");
  assert.deepEqual(arena[0].instagram, ["tatiana_vinhais", "bruno_roldo"]);
  assert.equal(
    arena.find((activity) => activity.bandId === "ponte")?.start,
    "19:15",
  );
  assert.equal(
    arena.find((activity) => activity.bandId === "ponte")?.end,
    "20:00",
  );
  assert.deepEqual(
    arena.slice(1).map((activity) => [activity.start, activity.end]),
    [
      ["18:30", "19:15"],
      ["19:15", "20:00"],
      ["20:00", "20:45"],
      ["20:45", "21:30"],
      ["21:30", "22:30"],
    ],
  );
  assert.deepEqual(
    street.map((activity) => [activity.start, activity.end]),
    [
      ["17:30", "18:15"],
      ["18:15", "19:00"],
      ["19:00", "19:45"],
      ["19:45", "20:30"],
      ["20:30", "21:15"],
      ["21:15", "22:00"],
    ],
  );
  for (const items of [arena.slice(1), street]) {
    items.forEach((activity, index) => {
      assert.equal(
        toMinutes(activity.end!) - toMinutes(activity.start!),
        activity.bandId === "manada" ? 60 : 45,
      );
      assert.equal(
        activity.timing,
        activity.bandId === "ponte" ? "confirmed" : "estimated",
      );
      if (index) assert.equal(items[index - 1].end, activity.start);
    });
  }
  assert.equal(arena[0].timing, "confirmed");
  assert.equal(street[0].type, "procession");
  assert.equal(bands.ponte.state, "SC");
  assert.equal(bands.mzceja.name, "Mzčejà Tåbëbo Orquestra");
  assert.notEqual(
    stages.find((stage) => stage.id === "bela-vista")?.venueId,
    friday.party?.venueId,
  );
  for (const stage of stages.filter((stage) => stage.venueId)) {
    assert.ok(venues[stage.venueId!]);
    assert.equal(stage.opensAt, stage.id === "bela-vista" ? "16:00" : "16:30");
    assert.equal(stage.closesAt, stage.id === "bela-vista" ? "22:30" : "22:00");
  }
});

test("Friday list preserves addresses and updated offset time windows", async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: FestivalGuide } =
    await import("../src/components/festival-guide");
  const html = renderToStaticMarkup(React.createElement(FestivalGuide));
  const friday = html
    .split('aria-labelledby="heading-2026-11-27"')[1]
    .split('aria-labelledby="heading-2026-11-28"')[0];
  assert.ok(!friday.includes("simultâneas"));
  assert.ok(!friday.includes("Embaixo do viaduto"));
  assert.ok(!friday.includes("Todos os palcos"));
  assert.equal(
    (friday.match(/Rua Prof. Laerte Ramos de Carvalho, 280/g) ?? []).length,
    1,
  );
  assert.equal((friday.match(/Rua São Vicente, 120/g) ?? []).length, 1);
  assert.ok(friday.includes("Mini cortejo"));
  assert.ok(
    friday.indexOf('data-activity-id="fri-firuliros"') <
      friday.indexOf('data-activity-id="fri-ponte"'),
  );
  assert.ok(
    friday.indexOf('data-activity-id="fri-ponte"') <
      friday.indexOf('data-activity-id="fri-mzceja"'),
  );
});

test("Friday grid compares both stages in one shared timeline", async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { DaySection } = await import("../src/components/festival-guide");
  const html = renderToStaticMarkup(
    React.createElement(DaySection, { day: days[1], view: "grid" }),
  );
  assert.equal((html.match(/class="timeline"/g) ?? []).length, 1);
  assert.equal((html.match(/class="stage-heading /g) ?? []).length, 2);
  assert.equal((html.match(/data-activity-id=/g) ?? []).length, 18);
  assert.ok(html.includes('data-activity-id="fri-body-workshop"'));
  assert.ok(html.includes("22:30"));
  assert.ok(html.includes("Horários previstos, sujeitos a alterações."));
});
