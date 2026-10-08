"use client";

import { useCallback, useEffect, useState } from "react";
import { UNIT_THEME } from "@/components/path/unitTheme";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  adminApi,
  type AdminContent,
  type AdminExercise,
  type AdminLesson,
  type AdminSkill,
  type AdminUnit,
  type ExerciseType,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import type { UnitColor } from "@/lib/types";

const EXERCISE_TYPES: ExerciseType[] = ["multiple_choice", "translate", "match_pairs", "fill_blank", "type_answer"];

// Darker "lip" shades keep white badge text readable in both themes.
const TYPE_META: Record<ExerciseType, { label: string; badge: string; hint: string }> = {
  multiple_choice: {
    label: "Multiple choice",
    badge: "bg-sky-dark",
    hint: '"answer" is the 0-based index of the correct entry in "choices".',
  },
  translate: {
    label: "Translate",
    badge: "bg-beetle-dark",
    hint: 'Every word of the first entry in "answers" must be in "word_bank".',
  },
  match_pairs: {
    label: "Match pairs",
    badge: "bg-fox-dark",
    hint: '"pairs" is a list of [left, right]; the left-hand words must be unique.',
  },
  fill_blank: {
    label: "Fill blank",
    badge: "bg-owl-dark",
    hint: '"sentence" needs exactly one ___ and "answer" must be one of "choices".',
  },
  type_answer: {
    label: "Type answer",
    badge: "bg-cardinal-dark",
    hint: '"answers" lists every accepted answer; the first is shown as the solution.',
  },
};

const errorText = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

type OnSaved = (message: string) => Promise<void>;

export default function ContentManagerPage() {
  const toast = useToast();
  const [content, setContent] = useState<AdminContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminExercise | null>(null);

  // Refreshes keep the current tree on screen, so open accordions stay open after a save.
  const refresh = useCallback(async () => {
    try {
      setContent(await adminApi.content());
      setError(null);
    } catch (e) {
      // The backend answers {code: "not_found"} when ENABLE_DEV_TOOLS is off; a bare 404
      // (code "http_error") means it's an older build without the /admin routes.
      const disabled = e instanceof ApiError && e.status === 404;
      setError(
        disabled && e.code === "not_found"
          ? "The content manager is turned off on this server (ENABLE_DEV_TOOLS=false)."
          : disabled
            ? "This server doesn't have the content manager yet. Restart the backend to pick it up."
            : errorText(e, "Couldn't load the course content."),
      );
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onSaved: OnSaved = async (message) => {
    await refresh();
    toast(message, { tone: "success" });
  };

  const retry = () => {
    setError(null);
    refresh();
  };

  if (!content) {
    return error ? <ErrorState message={error} onRetry={retry} /> : <ContentSkeleton />;
  }

  const { totals } = content;
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold text-strong">Content Manager</h1>
        <p className="text-muted">
          {content.course.title} course. Edits go live for learners immediately.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border-2 border-cardinal p-3">
          <p className="flex-1 text-sm font-bold text-cardinal">{error}</p>
          <Button variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      <section aria-label="Content totals" className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Units" value={totals.units} />
          <StatTile label="Skills" value={totals.skills} />
          <StatTile label="Lessons" value={totals.lessons} />
          <StatTile label="Exercises" value={totals.exercises} />
        </div>
        <div className="flex flex-wrap gap-2">
          {EXERCISE_TYPES.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-line py-1 pl-1 pr-3 text-sm font-extrabold text-strong"
            >
              <TypeBadge type={type} />
              {totals.by_type[type] ?? 0}
            </span>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        {content.units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} onSaved={onSaved} onEditExercise={setEditing} />
        ))}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="exercise-editor-title">
        {editing && (
          <ExerciseEditor
            key={editing.id}
            exercise={editing}
            onCancel={() => setEditing(null)}
            onSaved={async () => {
              await onSaved("Exercise updated");
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------- tree

function UnitCard({
  unit,
  onSaved,
  onEditExercise,
}: {
  unit: AdminUnit;
  onSaved: OnSaved;
  onEditExercise: (exercise: AdminExercise) => void;
}) {
  const [open, setOpen] = useState(unit.position === 0);
  const [editing, setEditing] = useState(false);
  const theme = UNIT_THEME[unit.color as UnitColor] ?? UNIT_THEME.green;
  const lessons = unit.skills.flatMap((s) => s.lessons);

  return (
    <section className="rounded-2xl border-2 border-line">
      <div className="flex items-start gap-3 p-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-b-4 text-lg font-extrabold text-white ${theme.bg} ${theme.lip}`}
          aria-hidden
        >
          {unit.position + 1}
        </span>
        {editing ? (
          <InlineEditor
            fields={[
              { key: "title", label: "Unit title", value: unit.title, maxLength: 64 },
              { key: "description", label: "Description", value: unit.description, maxLength: 255 },
            ]}
            onCancel={() => setEditing(false)}
            onSave={async (values) => {
              await adminApi.updateUnit(unit.id, values);
              await onSaved("Unit updated");
              setEditing(false);
            }}
          />
        ) : (
          <>
            <Disclosure open={open} onToggle={() => setOpen(!open)}>
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                {unit.skills.length} skills · {lessons.length} lessons · {countExercises(lessons)} exercises
              </p>
              <h2 className="text-lg font-extrabold leading-tight text-strong">{unit.title}</h2>
              <p className="text-muted">{unit.description}</p>
            </Disclosure>
            <PencilButton label={`Edit ${unit.title}`} onClick={() => setEditing(true)} />
          </>
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-3 border-t-2 border-line p-3 sm:p-4">
          {unit.skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onSaved={onSaved} onEditExercise={onEditExercise} />
          ))}
        </div>
      )}
    </section>
  );
}

function SkillCard({
  skill,
  onSaved,
  onEditExercise,
}: {
  skill: AdminSkill;
  onSaved: OnSaved;
  onEditExercise: (exercise: AdminExercise) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-line">
      <div className="flex items-start gap-2 p-3">
        {editing ? (
          <InlineEditor
            fields={[{ key: "title", label: "Skill title", value: skill.title, maxLength: 64 }]}
            onCancel={() => setEditing(false)}
            onSave={async (values) => {
              await adminApi.updateSkill(skill.id, values);
              await onSaved("Skill renamed");
              setEditing(false);
            }}
          />
        ) : (
          <>
            <Disclosure open={open} onToggle={() => setOpen(!open)}>
              <h3 className="font-extrabold text-strong">{skill.title}</h3>
              <p className="text-sm font-bold text-muted">
                Skill {skill.position + 1} · {skill.lessons.length} lessons · {countExercises(skill.lessons)} exercises
              </p>
            </Disclosure>
            <PencilButton label={`Rename ${skill.title}`} onClick={() => setEditing(true)} />
          </>
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-2 px-3 pb-3">
          {skill.lessons.map((lesson) => (
            <LessonBlock key={lesson.id} lesson={lesson} onEditExercise={onEditExercise} />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonBlock({ lesson, onEditExercise }: { lesson: AdminLesson; onEditExercise: (e: AdminExercise) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-hover">
      <div className="flex px-3 py-2">
        <Disclosure open={open} onToggle={() => setOpen(!open)}>
          <p className="font-extrabold text-strong">
            Lesson {lesson.position + 1}{" "}
            <span className="font-bold text-muted">· {lesson.exercises.length} exercises</span>
          </p>
        </Disclosure>
      </div>
      {open && (
        <ol className="flex flex-col gap-2 px-2 pb-2">
          {lesson.exercises.map((exercise) => (
            <li key={exercise.id} className="flex items-start gap-3 rounded-xl border-2 border-line bg-panel p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <TypeBadge type={exercise.type} />
                  <span className="text-xs font-bold text-muted">#{exercise.position + 1}</span>
                </div>
                <p className="mt-1 break-words font-bold text-strong">{exercise.prompt}</p>
                <p className="break-words text-sm text-muted">
                  <AnswerSummary exercise={exercise} />
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => onEditExercise(exercise)}>
                Edit
              </Button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const countExercises = (lessons: AdminLesson[]) => lessons.reduce((sum, l) => sum + l.exercises.length, 0);

// ---------------------------------------------------------------- exercise summaries

const asText = (value: unknown) => (typeof value === "string" ? value : "");
const asTextList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/** One-line, human-readable answer key. Defensive: `content` is free-form JSON. */
function AnswerSummary({ exercise }: { exercise: AdminExercise }) {
  const c = exercise.content;
  const answerText = (text: string) => <b className="font-extrabold text-owl-text">{text}</b>;

  switch (exercise.type) {
    case "multiple_choice": {
      const choices = Array.isArray(c.choices) ? c.choices : [];
      const choice: unknown = typeof c.answer === "number" ? choices[c.answer] : undefined;
      const text = choice && typeof choice === "object" ? asText((choice as { text?: unknown }).text) : "";
      return text ? <>Answer: {answerText(text)}</> : <MissingAnswer />;
    }
    case "translate":
    case "type_answer": {
      const [first, ...rest] = asTextList(c.answers);
      if (!first) return <MissingAnswer />;
      return (
        <>
          {asText(c.source)} → {answerText(first)}
          {rest.length > 0 && ` (+${rest.length} more)`}
        </>
      );
    }
    case "fill_blank": {
      const [before, after] = asText(c.sentence).split("___");
      const answer = asText(c.answer);
      if (!answer || after === undefined) return <MissingAnswer />;
      return (
        <>
          {before}
          {answerText(answer)}
          {after}
        </>
      );
    }
    case "match_pairs": {
      const pairs = Array.isArray(c.pairs) ? c.pairs : [];
      const lefts = pairs.map((p) => (Array.isArray(p) ? asText(p[0]) : "")).filter(Boolean);
      return (
        <>
          {answerText(`${pairs.length} pairs`)}
          {lefts.length > 0 && `: ${lefts.slice(0, 3).join(", ")}${lefts.length > 3 ? "…" : ""}`}
        </>
      );
    }
    default:
      return <MissingAnswer />;
  }
}

function MissingAnswer() {
  return <span className="font-bold text-cardinal">No readable answer key</span>;
}

// ---------------------------------------------------------------- editors

interface EditableField {
  key: string;
  label: string;
  value: string;
  maxLength: number;
}

/** Inline form for short text fields. Only changed fields are sent to `onSave`. */
function InlineEditor({
  fields,
  onSave,
  onCancel,
}: {
  fields: EditableField[];
  onSave: (values: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.value])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = fields.filter((f) => values[f.key].trim() !== f.value);
  const blank = fields.some((f) => !values[f.key].trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || blank || changed.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await onSave(Object.fromEntries(changed.map((f) => [f.key, values[f.key].trim()])));
    } catch (err) {
      setError(errorText(err, "Couldn't save. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      className="flex min-w-0 flex-1 flex-col gap-2"
    >
      {fields.map((field, i) => (
        <label key={field.key} className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-muted">{field.label}</span>
          <input
            value={values[field.key]}
            maxLength={field.maxLength}
            autoFocus={i === 0}
            onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            className="w-full rounded-xl border-2 border-line bg-hover px-3 py-2 font-semibold text-strong outline-none focus:border-sel-border"
          />
        </label>
      ))}
      {error && <p className="text-sm font-bold text-cardinal">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" size="sm" disabled={busy || blank || changed.length === 0}>
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ExerciseEditor({
  exercise,
  onSaved,
  onCancel,
}: {
  exercise: AdminExercise;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [prompt, setPrompt] = useState(exercise.prompt);
  const [json, setJson] = useState(() => JSON.stringify(exercise.content, null, 2));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    let content: unknown;
    try {
      content = JSON.parse(json);
    } catch (err) {
      setError(`Content isn't valid JSON. ${err instanceof Error ? err.message : ""}`.trim());
      return;
    }
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      setError("Content must be a JSON object, e.g. { \"answer\": 0, ... }.");
      return;
    }
    if (!prompt.trim()) {
      setError("The prompt can't be empty.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await adminApi.updateExercise(exercise.id, {
        prompt: prompt.trim(),
        content: content as Record<string, unknown>,
      });
      await onSaved();
    } catch (err) {
      // Server-side validation (code "invalid_exercise") explains exactly what's wrong.
      setError(errorText(err, "Couldn't save the exercise. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 text-left">
      <div>
        <h2 id="exercise-editor-title" className="text-xl font-extrabold text-strong">
          Edit exercise
        </h2>
        <div className="mt-1 flex items-center gap-2">
          <TypeBadge type={exercise.type} />
          <span className="text-xs font-bold text-muted">#{exercise.id} · type can&apos;t change</span>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-muted">Prompt</span>
        <input
          value={prompt}
          maxLength={255}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-xl border-2 border-line bg-hover px-3 py-2 font-semibold text-strong outline-none focus:border-sel-border"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-muted">Content (JSON)</span>
        <textarea
          value={json}
          spellCheck={false}
          onChange={(e) => {
            setJson(e.target.value);
            setError(null);
          }}
          aria-invalid={error !== null}
          aria-describedby="exercise-editor-hint"
          className={`h-64 max-h-[45vh] w-full resize-y rounded-xl border-2 bg-hover p-3 font-mono text-[13px] leading-5 text-strong outline-none focus:border-sel-border ${
            error ? "border-cardinal" : "border-line"
          }`}
        />
        <span id="exercise-editor-hint" className="mt-1 block text-xs text-muted">
          {TYPE_META[exercise.type]?.hint}
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border-2 border-cardinal bg-wrong-bg p-3 text-sm font-bold text-cardinal">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- small pieces

function TypeBadge({ type }: { type: ExerciseType }) {
  const meta = TYPE_META[type] ?? { label: type, badge: "bg-faint" };
  return (
    <span
      className={`inline-block rounded-lg px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border-2 border-line p-4">
      <p className="text-2xl font-extrabold text-strong">{value}</p>
      <p className="text-sm font-bold text-muted">{label}</p>
    </div>
  );
}

/** The clickable header area of an accordion row. */
function Disclosure({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex min-w-0 flex-1 items-start gap-2 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
    >
      <svg
        viewBox="0 0 24 24"
        className={`mt-1 h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
      <span className="min-w-0 flex-1 break-words">{children}</span>
    </button>
  );
}

function PencilButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sky hover:bg-hover focus-visible:outline-2 focus-visible:outline-sky"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
        <path d="m13.5 6.5 4 4" />
      </svg>
    </button>
  );
}

function ContentSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-label="Loading content" aria-busy>
      <div className="h-8 w-56 rounded-xl bg-line" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[84px] rounded-2xl bg-line" />
        ))}
      </div>
      <div className="h-9 rounded-xl bg-line" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-line" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 pt-20 text-center">
      <Mascot mood="sad" className="h-28 w-28" />
      <p className="max-w-xs font-bold text-muted">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
