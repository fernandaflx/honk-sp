"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Grid2X2,
  Instagram,
  List,
  MapPin,
  Ticket,
  Sparkles,
} from "lucide-react";
import {
  bands,
  days,
  officialInstagram,
  stages,
  venues,
} from "@/data/schedule";
import type { Activity, FestivalDay, Party, Venue } from "@/data/types";
import {
  activityInstagram,
  activityName,
  groupByStart,
  toMinutes,
} from "@/lib/schedule";
const typeLabels = {
  workshop: "Oficina",
  opening: "Abertura",
  show: "Espetáculo",
  music: "",
  procession: "Mini cortejo",
};
function InstagramLink({ handle }: { handle: string }) {
  return (
    <a
      className="instagram-link"
      href={`https://www.instagram.com/${handle}/`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram @${handle} (abre em nova aba)`}
    >
      <Instagram size={17} />
      <span>@{handle}</span>
      <ArrowUpRight size={14} />
    </a>
  );
}
function VenueHeader({ venue }: { venue: Venue }) {
  return (
    <div className="venue">
      <div className="venue-copy">
        <MapPin size={22} />
        <div>
          <h4>{venue.name}</h4>
          <p>{venue.address}</p>
        </div>
      </div>
      <div className="venue-actions">
        <a
          className="button small"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Como chegar <ArrowUpRight size={16} />
        </a>
        {venue.instagram && <InstagramLink handle={venue.instagram} />}
      </div>
    </div>
  );
}
function ActivityCard({
  activity,
  compact = false,
  showState = true,
}: {
  activity: Activity;
  compact?: boolean;
  showState?: boolean;
}) {
  const band = activity.bandId ? bands[activity.bandId] : undefined;
  const stage = stages.find((s) => s.id === activity.stageId);
  const label = stage?.name ?? typeLabels[activity.type];
  return (
    <article
      className={`activity-card ${stage?.color ?? "plain"} ${compact ? "compact" : ""}`}
      data-activity-id={activity.id}
    >
      {(label || (showState && band?.state)) && (
        <div className="card-meta">
          {label && <span>{label}</span>}
          {showState && band?.state && (
            <span className="state">{band.state}</span>
          )}
        </div>
      )}
      {activity.start && (
        <div className="card-time">
          <strong>{activity.start}</strong>
          {activity.end && <span>até {activity.end}</span>}
        </div>
      )}
      <h5>{activityName(activity)}</h5>
      {activity.type === "procession" && (
        <p className="activity-kind">Mini cortejo</p>
      )}
      {activity.timing === "estimated" && compact && (
        <span className="estimated">Horário previsto</span>
      )}
      <div className="social-links">
        {activityInstagram(activity).map((handle) => (
          <InstagramLink key={handle} handle={handle} />
        ))}
      </div>
    </article>
  );
}
function ScheduleList({
  activities,
  preserveOrder = false,
}: {
  activities: Activity[];
  preserveOrder?: boolean;
}) {
  const groups: [string, Activity[]][] = preserveOrder
    ? activities.map((activity) => [
        activity.start ?? "unscheduled",
        [activity],
      ])
    : groupByStart(activities);
  return (
    <div className="schedule-list">
      {groups.map(([time, items], index) => (
        <div
          key={`${time}-${index}`}
          className={`time-group ${time === "unscheduled" ? "unscheduled-group" : ""}`}
        >
          <div className="time-marker">
            {time !== "unscheduled" && <time>{time}</time>}
            {time !== "unscheduled" && items.length > 1 && (
              <span>{items.length} simultâneas</span>
            )}
          </div>
          <div className="time-cards">
            {items.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function ScheduleGrid({ activities }: { activities: Activity[] }) {
  const timed = activities.filter((a) => a.start && a.end);
  const untimed = activities.filter((a) => !a.start || !a.end);
  if (!timed.length)
    return <ScheduleList activities={activities} preserveOrder />;
  const start =
    Math.floor(Math.min(...timed.map((a) => toMinutes(a.start!))) / 60) * 60;
  const end =
    Math.ceil(Math.max(...timed.map((a) => toMinutes(a.end!))) / 60) * 60;
  const stageIds = [...new Set(timed.map((a) => a.stageId ?? "main"))];
  const ticks = Array.from(
    { length: (end - start) / 15 + 1 },
    (_, i) => start + i * 15,
  );
  // Every five minutes occupies a CSS grid row; overlapping events share lanes.
  const columns = stageIds.flatMap((id) => {
    const items = timed
      .filter((a) => (a.stageId ?? "main") === id)
      .sort((a, b) => a.start!.localeCompare(b.start!));
    const lanes: Activity[][] = [];
    for (const item of items) {
      let lane = lanes.find(
        (l) => toMinutes(l[l.length - 1].end!) <= toMinutes(item.start!),
      );
      if (!lane) {
        lane = [];
        lanes.push(lane);
      }
      lane.push(item);
    }
    return lanes.map((lane, index) => ({
      id: `${id}-${index}`,
      stage: stages.find((s) => s.id === id),
      lane,
      index,
    }));
  });
  return (
    <>
      <p className="grid-hint">
        Compare os horários. Deslize para ver todos os palcos{" "}
        <ArrowUpRight size={15} />
      </p>
      <div
        className="grid-scroll"
        tabIndex={0}
        role="region"
        aria-label="Grade de horários com rolagem horizontal"
      >
        <div
          className="timeline"
          style={{
            gridTemplateColumns: `64px repeat(${columns.length}, minmax(240px, 1fr))`,
            gridTemplateRows: `58px repeat(${(end - start) / 5}, 22px) 24px`,
          }}
        >
          <div className="timeline-corner">Hora</div>
          {columns.map((column, index) => (
            <div
              key={column.id}
              className={`stage-heading ${column.stage?.color ?? "pink"}`}
              style={{ gridColumn: index + 2, gridRow: 1 }}
            >
              {column.stage?.name ?? "Programação"}
              {column.index > 0 ? " · simultânea" : ""}
            </div>
          ))}
          {ticks.map((tick) => (
            <div
              key={tick}
              className="timeline-tick"
              style={{ gridRow: 2 + (tick - start) / 5, gridColumn: "1 / -1" }}
            >
              <time>
                {String(Math.floor(tick / 60)).padStart(2, "0")}:
                {String(tick % 60).padStart(2, "0")}
              </time>
            </div>
          ))}
          {columns.flatMap((column, index) =>
            column.lane.map((activity) => (
              <div
                key={activity.id}
                className="timeline-event"
                style={{
                  gridColumn: index + 2,
                  gridRow: `${2 + (toMinutes(activity.start!) - start) / 5} / ${2 + (toMinutes(activity.end!) - start) / 5}`,
                }}
              >
                <ActivityCard activity={activity} compact />
              </div>
            )),
          )}
        </div>
      </div>
      {untimed.length > 0 && (
        <ScheduleList activities={untimed} preserveOrder />
      )}
    </>
  );
}
function PartySection({ party }: { party: Party }) {
  return (
    <section className="party">
      <div className="party-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={16} /> Depois da rua
          </span>
          <h3>Festa das Fanfarras</h3>
          <p>O encontro segue na pista.</p>
          {party.start && (
            <p className="party-start">
              <Clock3 size={18} aria-hidden="true" /> A partir das{" "}
              <time>{party.start.replace(/:00$/, "h").replace(":", "h")}</time>
            </p>
          )}
        </div>
        <a
          className="button ticket"
          href={party.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Ticket size={20} /> Comprar ingressos <ArrowUpRight size={20} />
        </a>
      </div>
      <VenueHeader venue={venues[party.venueId]} />
      <details className="party-details">
        <summary className="button party-toggle">
          <span className="when-collapsed">Ver fanfarras</span>
          <span className="when-expanded">Ocultar fanfarras</span>
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <ul
          className="party-lineup"
          aria-label="Fanfarras participantes da festa"
        >
          {party.activities.map((activity) => {
            const band = activity.bandId ? bands[activity.bandId] : undefined;
            return (
              <li key={activity.id} data-activity-id={activity.id}>
                <div className="party-performer">
                  <h4>{activityName(activity)}</h4>
                  {band?.state && <span className="state">{band.state}</span>}
                </div>
                {activity.start && (
                  <p className="party-time">
                    {activity.start}
                    {activity.end && ` até ${activity.end}`}
                  </p>
                )}
                {activityInstagram(activity).length > 0 && (
                  <div className="party-socials">
                    {activityInstagram(activity).map((handle) => (
                      <InstagramLink key={handle} handle={handle} />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
export function DaySection({
  day,
  view,
}: {
  day: FestivalDay;
  view: "list" | "grid";
}) {
  const [stageId, setStageId] = useState("all");
  const availableStages = stages.filter((s) =>
    day.activities.some((a) => a.stageId === s.id),
  );
  const stageVenues = availableStages.filter((stage) => stage.venueId);
  const filtered = day.activities.filter(
    (a) => stageId === "all" || a.stageId === stageId,
  );
  return (
    <section className="day-section" aria-labelledby={`heading-${day.id}`}>
      <header className="day-heading">
        <div className="day-stamp">
          <span>{day.weekday}</span>
          <strong>{day.date}</strong>
        </div>
        <div>
          <h2 id={`heading-${day.id}`}>{day.title}</h2>
          {day.note && <p>{day.note}</p>}
          {day.activities.some(
            (activity) => activity.timing === "estimated",
          ) && (
            <p className="timing-note">
              Horários previstos, sujeitos a alterações.
            </p>
          )}
        </div>
      </header>
      {day.pending && (
        <div className="pending">
          <CalendarDays size={28} />
          <div>
            <h3>Programação em breve</h3>
            <p>A programação regular deste dia ainda não foi divulgada.</p>
          </div>
        </div>
      )}
      {day.venueId && <VenueHeader venue={venues[day.venueId]} />}
      {availableStages.length > 1 && (
        <>
          <div
            className="stage-filter"
            role="group"
            aria-label={`Filtrar palco de ${day.weekday}`}
          >
            <button
              aria-pressed={stageId === "all"}
              onClick={() => setStageId("all")}
            >
              Todos os palcos
            </button>
            {availableStages.map((stage) => (
              <button
                key={stage.id}
                className={stage.color}
                aria-pressed={stageId === stage.id}
                onClick={() => setStageId(stage.id)}
              >
                {stage.name}
              </button>
            ))}
          </div>
          <div className="stage-openings">
            {availableStages
              .filter((stage) => stageId === "all" || stage.id === stageId)
              .map((stage) => (
                <span key={stage.id}>
                  <i className={stage.color} />
                  {stage.name.replace("Palco ", "")} ·{" "}
                  {stage.closesAt
                    ? `${stage.opensAt} às ${stage.closesAt}`
                    : `abertura ${stage.opensAt}`}
                </span>
              ))}
          </div>
        </>
      )}
      {stageVenues.length > 0 && (
        <div className="stage-venues">
          {stageVenues
            .filter((stage) => stageId === "all" || stage.id === stageId)
            .map((stage) => (
              <div key={stage.id}>
                <VenueHeader venue={venues[stage.venueId!]} />
                {stage.note && <p className="stage-venue-note">{stage.note}</p>}
              </div>
            ))}
        </div>
      )}
      {filtered.length > 0 &&
        (view === "list" ? (
          <ScheduleList activities={filtered} />
        ) : (
          <ScheduleGrid activities={filtered} />
        ))}
      {day.party && <PartySection party={day.party} />}
    </section>
  );
}
export default function FestivalGuide() {
  const [dayId, setDayId] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const visibleDays = days.filter((day) => dayId === "all" || day.id === dayId);
  return (
    <>
      <a className="skip-link" href="#schedule">
        Pular para a programação
      </a>
      <header className="hero">
        <div className="hero-top">
          <span className="independent">Guia independente / não oficial</span>
          <a href={officialInstagram} target="_blank" rel="noopener noreferrer">
            <Instagram size={18} />
            <span>@honk.sp</span>
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="hero-main">
          <div>
            <p className="hero-kicker">Festival de Fanfarras Ativistas</p>
            <h1>
              HONK!
              <span>
                SP <em>2026</em>
              </span>
            </h1>
          </div>
          <div className="hero-side">
            <div className="date-poster">
              <span>26—29</span>
              <strong>NOVEMBRO</strong>
              <span className="year">SÃO PAULO / 2026</span>
            </div>
            <p>
              As ruas são nossas.
              <br />A programação tá aqui.
            </p>
            <a
              href="#schedule"
              aria-label="Ver programação"
              className="hero-arrow"
            >
              <ArrowDown size={34} />
            </a>
          </div>
        </div>
        <div className="hero-bottom">
          <span>FANFARRA É ENCONTRO.</span>
          <span>ENCONTRO É NA RUA. ↗</span>
        </div>
      </header>
      <main id="schedule" className="main">
        <div className="schedule-intro">
          <div>
            <span className="eyebrow">Bora se encontrar</span>
            <h2>Qual é a boa?</h2>
          </div>
          <p>
            Escolha o dia, encontre sua fanfarra
            <br className="desktop-break" /> e ocupe a cidade com a gente.
          </p>
        </div>
        <div className="controls">
          <div className="day-tabs" role="group" aria-label="Filtrar por dia">
            <button
              onClick={() => setDayId("all")}
              aria-pressed={dayId === "all"}
            >
              Todos<span>26–29/11</span>
            </button>
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setDayId(day.id)}
                aria-pressed={dayId === day.id}
              >
                {day.weekday}
                <span>{day.date}</span>
              </button>
            ))}
          </div>
          <div className="view-switch" role="group" aria-label="Visualização">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              <List size={19} />
              Lista
            </button>
            <button
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
            >
              <Grid2X2 size={19} />
              Grade
            </button>
          </div>
        </div>
        <div className="schedule-status" aria-live="polite">
          <span>
            {dayId === "all"
              ? "Os quatro dias. Todos os encontros."
              : `${visibleDays[0].weekday} · ${visibleDays[0].date}`}
          </span>
          <span>Horários de São Paulo</span>
        </div>
        {visibleDays.map((day) => (
          <DaySection day={day} view={view} key={day.id} />
        ))}
      </main>
      <footer>
        <strong>HONK! SP 2026</strong>
        <p>
          Feito para encontrar gente e fanfarra na rua.
          <br />
          Guia independente. Confirme atualizações nos canais oficiais.
        </p>
        <a href={officialInstagram} target="_blank" rel="noopener noreferrer">
          Instagram oficial <ArrowUpRight size={18} />
        </a>
        <span>26—29 NOV · SÃO PAULO</span>
      </footer>
    </>
  );
}
