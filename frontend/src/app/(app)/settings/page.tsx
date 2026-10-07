"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { setSoundEnabled, soundEnabled } from "@/lib/audio";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { useUser } from "@/lib/user-context";

const GOALS = [
  { xp: 10, label: "Casual" },
  { xp: 20, label: "Regular" },
  { xp: 30, label: "Serious" },
  { xp: 50, label: "Intense" },
];

export default function SettingsPage() {
  const { me, setMe, refresh } = useUser();
  const { preference, setPreference } = useTheme();
  const toast = useToast();
  const [name, setName] = useState(me?.display_name ?? "");
  const [sound, setSound] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => setSound(soundEnabled()), []);
  if (!me) return null;

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast(success, { tone: "success" });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Something went wrong", { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold text-strong">Settings</h1>

      <Section title="Profile">
        <label className="mb-1 block font-bold text-strong" htmlFor="display-name">
          Name
        </label>
        <div className="flex gap-3">
          <input
            id="display-name"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border-2 border-line bg-hover px-4 py-2.5 font-semibold text-strong outline-none focus:border-sel-border"
          />
          <Button
            variant="secondary"
            disabled={busy || !name.trim() || name === me.display_name}
            onClick={() => run(async () => setMe(await api.updateMe({ display_name: name.trim() })), "Name saved")}
          >
            Save
          </Button>
        </div>
        <p className="mt-4 font-bold text-strong">Timezone</p>
        <p className="mb-2 text-sm text-muted">
          Streaks and daily goals follow this timezone. Current: <b>{me.timezone}</b>
        </p>
        {browserZone && browserZone !== me.timezone && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => run(async () => setMe(await api.updateMe({ timezone: browserZone })), "Timezone updated")}
          >
            Use {browserZone}
          </Button>
        )}
      </Section>

      <Section title="Daily goal">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GOALS.map((goal) => (
            <button
              key={goal.xp}
              disabled={busy}
              onClick={() => run(async () => setMe(await api.updateMe({ daily_goal_xp: goal.xp })), `Daily goal set to ${goal.xp} XP`)}
              className={`rounded-2xl border-2 border-b-4 p-3 text-center ${
                me.daily_goal_xp === goal.xp ? "border-sel-border bg-sel-bg text-sel-text" : "border-line text-strong hover:bg-hover"
              }`}
            >
              <p className="font-extrabold">{goal.label}</p>
              <p className="text-sm text-muted">{goal.xp} XP / day</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Preferences">
        <Toggle
          label="Sound effects"
          checked={sound}
          onChange={(value) => {
            setSound(value);
            setSoundEnabled(value);
          }}
        />
        <p className="mb-2 mt-4 font-bold text-strong">Appearance</p>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as ThemePreference[]).map((value) => (
            <button
              key={value}
              onClick={() => setPreference(value)}
              className={`rounded-xl border-2 border-b-4 px-4 py-2 font-extrabold capitalize ${
                preference === value ? "border-sel-border bg-sel-bg text-sel-text" : "border-line text-strong"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Coming soon">
        <ul className="flex flex-col gap-2 text-muted">
          <li>🔔 Notifications</li>
          <li>🎙️ Speaking & listening exercises</li>
          <li>👥 Friends and social features</li>
          <li>🌍 More courses</li>
          <li>🔐 Account & sign-in</li>
        </ul>
      </Section>

      {me.dev_tools && (
        <Section title="Developer tools">
          <p className="mb-3 text-sm text-muted">
            Simulate time passing to test streaks and heart regeneration. Today on the server: <b>{me.today}</b>
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => run(async () => { await api.advanceDay(1); await refresh(); }, "Moved to the next day")}
            >
              Simulate next day
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => run(async () => { await api.advanceDay(2); await refresh(); }, "Skipped a day: streak lost")}
            >
              Skip a day
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => {
                if (!window.confirm("Reset all progress back to the demo state?")) return;
                run(async () => { await api.resetProgress(); await refresh(); }, "Progress reset");
              }}
            >
              Reset demo data
            </Button>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-line p-5">
      <h2 className="mb-4 text-lg font-extrabold text-strong">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-strong">{label}</span>
      <button
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 rounded-full transition-colors ${checked ? "bg-sky" : "bg-line"}`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left] ${checked ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}
