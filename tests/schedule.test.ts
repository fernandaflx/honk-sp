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
test("41 unique activities and complete references", () => {
  assert.equal(all.length, 41);
  assert.equal(new Set(all.map((a) => a.id)).size, 41);
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
test("Saturday has 24 consecutive 45 minute performances", () => {
  const saturday = days[2];
  assert.equal(saturday.activities.length, 24);
  for (const stage of stages) {
    const items = saturday.activities.filter((a) => a.stageId === stage.id);
    assert.equal(items.length, 8);
    assert.equal(
      items[0].start,
      stage.id === "quilombaque" ? "14:00" : "15:00",
    );
    items.forEach((a, i) => {
      assert.equal(toMinutes(a.end!) - toMinutes(a.start!), 45);
      assert.equal(a.timing, "estimated");
      if (i) assert.equal(items[i - 1].end, a.start);
    });
  }
  assert.equal(saturday.activities.at(-1)?.end, "21:00");
  const groups = groupByStart(saturday.activities);
  assert.equal(groups.find(([time]) => time === "15:00")?.[1].length, 2);
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
    ["Sexta", "Domingo"],
  );
});

test("Initial page renders all 41 activities, pending days and separate party sections", async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { default: FestivalGuide } =
    await import("../src/components/festival-guide");
  const html = renderToStaticMarkup(React.createElement(FestivalGuide));
  assert.equal((html.match(/data-activity-id=/g) ?? []).length, 41);
  assert.equal((html.match(/Programação em breve/g) ?? []).length, 2);
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
