import { DEFAULT_SITE_CONTENT, type DayKind, type SiteContent } from "@delisert.mks-1/api/lib/site-content";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ExternalLink,
  Home,
  Info,
  MessageCircle,
  Plus,
  RotateCcw,
  Store,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { z } from "zod";

import { ImageField } from "@/components/admin/image-field";
import { SaveBar } from "@/components/admin/save-bar";
import { Toggle } from "@/components/admin/toggle";
import { Card, Notice, PageHeader, TextField, buttonClass, inputClass } from "@/components/admin/ui";
import { useTRPC } from "@/utils/trpc";

type Section = keyof SiteContent;

const SECTIONS: ReadonlyArray<{
  key: Section;
  label: string;
  description: string;
  preview: string;
  icon: typeof Home;
}> = [
  { key: "brand", label: "Brand & kontak", description: "WhatsApp, sosial media, pengumuman", preview: "/kontak", icon: Store },
  { key: "home", label: "Beranda", description: "Judul besar, foto hero, cerita", preview: "/", icon: Home },
  { key: "schedule", label: "Jadwal & lokasi", description: "TikTok Live, CFD, alamat", preview: "/jadwal", icon: CalendarDays },
  { key: "about", label: "Tentang", description: "Cerita, angka, cara kerja", preview: "/tentang", icon: Info },
  { key: "contact", label: "Kontak", description: "Cara pesan, ambil, kirim", preview: "/kontak", icon: MessageCircle },
];

const FORM_ID = "site-content-form";

export const Route = createFileRoute("/admin/konten")({
  validateSearch: z.object({ bagian: z.enum(["brand", "home", "schedule", "about", "contact"]).optional() }),
  head: () => ({
    meta: [{ title: "Konten Website — Admin Delisert" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ContentPage,
});

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function ContentPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const { bagian: section = "brand" } = Route.useSearch();
  const content = useQuery(trpc.adminSite.content.queryOptions());
  const [drafts, setDrafts] = useState<Partial<SiteContent>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const server = content.data ?? DEFAULT_SITE_CONTENT;
  const dirtySections = SECTIONS.filter((item) => drafts[item.key] && !same(drafts[item.key], server[item.key]));
  const dirty = dirtySections.some((item) => item.key === section);

  // Peringatkan sebelum menutup tab bila masih ada perubahan.
  useEffect(() => {
    if (dirtySections.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtySections.length]);

  const afterWrite = (next: SiteContent, message: string) => {
    queryClient.setQueryData(trpc.adminSite.content.queryKey(), next);
    void queryClient.invalidateQueries(trpc.site.content.queryFilter());
    setDrafts((current) => {
      const copy = { ...current };
      delete copy[section];
      return copy;
    });
    setError(null);
    setSaved(message);
  };

  const save = useMutation(
    trpc.adminSite.update.mutationOptions({
      onSuccess: (next) => afterWrite(next, "Tersimpan. Perubahan langsung tampil di website."),
      onError: (mutationError) => setError(mutationError.message),
    }),
  );
  const reset = useMutation(
    trpc.adminSite.reset.mutationOptions({
      onSuccess: (next) => afterWrite(next, "Bagian ini dikembalikan ke isi bawaan."),
      onError: (mutationError) => setError(mutationError.message),
    }),
  );

  // HP: tab bagian yang aktif bisa berada di luar layar; geser ke tengah.
  useEffect(() => {
    document
      .querySelector(`[data-section-tab="${section}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [section]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(null), 4000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const value = (drafts[section] ?? server[section]) as SiteContent[typeof section];
  const update = <S extends Section>(key: S, next: SiteContent[S]) => {
    setSaved(null);
    setDrafts((current) => ({ ...current, [key]: next }));
  };
  const active = SECTIONS.find((item) => item.key === section)!;

  return (
    <div className="flex flex-col gap-6 pb-28 lg:gap-8">
      <PageHeader
        eyebrow="Website"
        title="Konten website"
        description="Ubah teks, foto, jadwal, dan kontak yang tampil di website. Setelah disimpan, perubahan langsung terlihat oleh pengunjung."
        actions={
          <a href={active.preview} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
            <ExternalLink aria-hidden="true" className="size-4" />
            Lihat halaman
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-8">
        <nav aria-label="Bagian konten" className="cn-no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 xl:flex-col xl:overflow-visible">
          {SECTIONS.map((item) => {
            const isActive = item.key === section;
            const isDirty = dirtySections.some((dirtyItem) => dirtyItem.key === item.key);
            return (
              <button
                key={item.key}
                type="button"
                data-section-tab={item.key}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  setError(null);
                  void navigate({ search: { bagian: item.key }, replace: true });
                }}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors xl:py-3",
                  isActive
                    ? "border-primary bg-background shadow-sm"
                    : "border-transparent bg-background/60 hover:bg-background",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-foreground">
                    {item.label}
                    {isDirty ? (
                      <span className="size-2 rounded-full bg-[#d99a2b]">
                        <span className="sr-only">(belum disimpan)</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="hidden truncate text-xs text-muted-foreground xl:block">{item.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            save.mutate({ section, value });
          }}
          className="flex min-w-0 flex-col gap-4 lg:gap-6"
        >
          {content.isError ? <Notice tone="error">Gagal memuat konten. Muat ulang halaman.</Notice> : null}
          {error ? <Notice tone="error">{error}</Notice> : null}
          {saved ? <Notice tone="success">{saved}</Notice> : null}

          {section === "brand" ? <BrandForm value={value as SiteContent["brand"]} onChange={(next) => update("brand", next)} /> : null}
          {section === "home" ? <HomeForm value={value as SiteContent["home"]} onChange={(next) => update("home", next)} /> : null}
          {section === "schedule" ? (
            <ScheduleForm value={value as SiteContent["schedule"]} onChange={(next) => update("schedule", next)} />
          ) : null}
          {section === "about" ? <AboutForm value={value as SiteContent["about"]} onChange={(next) => update("about", next)} /> : null}
          {section === "contact" ? (
            <ContactForm value={value as SiteContent["contact"]} onChange={(next) => update("contact", next)} />
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={reset.isPending || same(server[section], DEFAULT_SITE_CONTENT[section])}
              onClick={() => {
                if (window.confirm(`Kembalikan bagian "${active.label}" ke isi bawaan? Ubahan di bagian ini akan hilang.`)) {
                  reset.mutate({ section });
                }
              }}
              className={buttonClass("ghost", "sm")}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Kembalikan ke bawaan
            </button>
          </div>
        </form>
      </div>

      <SaveBar
        visible={dirty}
        busy={save.isPending}
        formId={FORM_ID}
        message={`Perubahan di "${active.label}" belum disimpan`}
        onCancel={() =>
          setDrafts((current) => {
            const copy = { ...current };
            delete copy[section];
            return copy;
          })
        }
      />
    </div>
  );
}

/* ───────────────────────── Bagian: Brand & kontak ───────────────────────── */

function BrandForm({ value, onChange }: { value: SiteContent["brand"]; onChange: (next: SiteContent["brand"]) => void }) {
  const set = <K extends keyof SiteContent["brand"]>(key: K, next: SiteContent["brand"][K]) => onChange({ ...value, [key]: next });
  return (
    <>
      <Card title="Pita pengumuman" description="Tampil di paling atas semua halaman. Cocok untuk PO, libur, atau promo.">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-muted px-3.5 py-3">
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Tampilkan pengumuman</span>
            <span className="text-xs text-muted-foreground">Matikan bila sudah tidak berlaku.</span>
          </span>
          <Toggle checked={value.announcementEnabled} label="Tampilkan pengumuman" onChange={(next) => set("announcementEnabled", next)} />
        </div>
        <TextField
          label="Teks pengumuman"
          value={value.announcementText}
          maxLength={160}
          placeholder="PO Mochi untuk Lebaran dibuka sampai 25 Maret!"
          onChange={(next) => set("announcementText", next)}
        />
        <TextField
          label="Tautan (opsional)"
          type="url"
          value={value.announcementUrl}
          placeholder="https://wa.me/… atau https://www.tiktok.com/…"
          onChange={(next) => set("announcementUrl", next)}
        />
        {value.announcementEnabled && value.announcementText ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <span className="block bg-muted px-3 py-1.5 text-[0.6875rem] font-semibold text-muted-foreground uppercase">Pratinjau</span>
            <p className="bg-foreground px-4 py-2.5 text-center text-[0.8125rem] font-medium text-background">{value.announcementText}</p>
          </div>
        ) : null}
      </Card>

      <Card title="WhatsApp" description="Semua tombol pesan di website memakai nomor ini.">
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <TextField
            label="Nomor (format internasional)"
            hint="Diawali 62, tanpa + dan spasi. Contoh: 6285190021421"
            inputMode="numeric"
            value={value.whatsappNumber}
            onChange={(next) => set("whatsappNumber", next.replace(/[^\d]/g, ""))}
          />
          <TextField
            label="Nomor yang ditampilkan"
            hint="Cara nomor ditulis di halaman, mis. 0851 9002 1421"
            value={value.whatsappDisplay}
            onChange={(next) => set("whatsappDisplay", next)}
          />
        </div>
        <a
          href={`https://wa.me/${value.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 w-fit items-center gap-1.5 text-sm font-semibold text-primary"
        >
          Uji nomor di WhatsApp <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </Card>

      <Card title="Sosial media">
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <TextField label="Instagram — nama akun" value={value.instagramHandle} onChange={(next) => set("instagramHandle", next)} />
          <TextField label="Instagram — tautan" type="url" value={value.instagramUrl} onChange={(next) => set("instagramUrl", next)} />
          <TextField label="TikTok — nama akun" value={value.tiktokHandle} onChange={(next) => set("tiktokHandle", next)} />
          <TextField label="TikTok — tautan" type="url" value={value.tiktokUrl} onChange={(next) => set("tiktokUrl", next)} />
        </div>
      </Card>

      <Card title="Footer">
        <TextField
          label="Kalimat singkat di footer"
          multiline
          rows={2}
          maxLength={240}
          value={value.footerBlurb}
          onChange={(next) => set("footerBlurb", next)}
        />
      </Card>
    </>
  );
}

/* ───────────────────────── Bagian: Beranda ───────────────────────── */

function HomeForm({ value, onChange }: { value: SiteContent["home"]; onChange: (next: SiteContent["home"]) => void }) {
  const set = <K extends keyof SiteContent["home"]>(key: K, next: SiteContent["home"][K]) => onChange({ ...value, [key]: next });
  const heroImages = [0, 1, 2].map((index) => value.heroImages[index] ?? "");
  const setHeroImage = (index: number, url: string) => {
    const next = [...heroImages];
    next[index] = url;
    set("heroImages", next.filter(Boolean));
  };
  return (
    <>
      <Card title="Bagian pembuka" description="Hal pertama yang dilihat pengunjung.">
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <TextField label="Judul baris 1" maxLength={60} value={value.heroTitleLine1} onChange={(next) => set("heroTitleLine1", next)} />
          <TextField label="Judul baris 2" maxLength={60} value={value.heroTitleLine2} onChange={(next) => set("heroTitleLine2", next)} />
        </div>
        <TextField label="Kalimat pendukung" multiline rows={3} maxLength={280} value={value.heroLead} onChange={(next) => set("heroLead", next)} />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Foto pembuka</span>
          <span className="text-xs text-muted-foreground">
            Maksimal 3 foto. Bila kosong, foto produk unggulan yang dipakai.
          </span>
          <div className="grid grid-cols-1 gap-3 @lg:grid-cols-3">
            {heroImages.map((url, index) => (
              <ImageField
                key={index}
                label={index === 0 ? "Foto besar" : `Foto kecil ${index}`}
                value={url}
                aspect="aspect-[3/4]"
                onChange={(next) => setHeroImage(index, next)}
              />
            ))}
          </div>
        </div>
      </Card>

      <Card title="Menu andalan" description="Daftar produk unggulan (atur produknya di Produk → Produk unggulan).">
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <TextField label="Label kecil" maxLength={40} value={value.featuredEyebrow} onChange={(next) => set("featuredEyebrow", next)} />
          <TextField label="Judul" maxLength={80} value={value.featuredTitle} onChange={(next) => set("featuredTitle", next)} />
        </div>
      </Card>

      <Card title="Bagian lain">
        <SwitchRow
          label="Tampilkan ubin kategori"
          hint="Pintasan ke setiap kategori di Menu."
          checked={value.showCategories}
          onChange={(next) => set("showCategories", next)}
        />
        <SwitchRow
          label="Tampilkan cerita singkat"
          hint="Kotak cerita dengan tautan ke halaman Tentang."
          checked={value.showStory}
          onChange={(next) => set("showStory", next)}
        />
        {value.showStory ? (
          <div className="grid grid-cols-1 gap-4 @xl:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="flex flex-col gap-4">
              <TextField label="Label kecil" maxLength={40} value={value.storyEyebrow} onChange={(next) => set("storyEyebrow", next)} />
              <TextField label="Judul cerita" maxLength={120} value={value.storyTitle} onChange={(next) => set("storyTitle", next)} />
              <TextField label="Isi cerita" multiline rows={3} maxLength={400} value={value.storyText} onChange={(next) => set("storyText", next)} />
            </div>
            <ImageField label="Foto cerita" value={value.storyImage} onChange={(next) => set("storyImage", next)} />
          </div>
        ) : null}
      </Card>
    </>
  );
}

/* ───────────────────────── Bagian: Jadwal & lokasi ───────────────────────── */

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;
const DAY_KIND_OPTIONS: ReadonlyArray<{ value: DayKind; label: string }> = [
  { value: "live", label: "Live" },
  { value: "cfd", label: "CFD" },
  { value: "off", label: "Libur" },
];

function ScheduleForm({
  value,
  onChange,
}: {
  value: SiteContent["schedule"];
  onChange: (next: SiteContent["schedule"]) => void;
}) {
  const set = <K extends keyof SiteContent["schedule"]>(key: K, next: SiteContent["schedule"][K]) => onChange({ ...value, [key]: next });
  return (
    <>
      <Card title="Jadwal mingguan" description="Mengatur pita minggu di halaman Jadwal dan ringkasan jadwal di footer.">
        <ul className="grid grid-cols-1 gap-2 @2xl:grid-cols-2">
          {DAYS.map((day, index) => (
            <li key={day} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2">
              <span className="w-16 text-sm font-semibold text-foreground">{day}</span>
              <span className="grid grid-cols-3 gap-1 rounded-full bg-background p-1" role="radiogroup" aria-label={`Jadwal ${day}`}>
                {DAY_KIND_OPTIONS.map((option) => {
                  const checked = value.week[index] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      onClick={() => {
                        const week = [...value.week];
                        week[index] = option.value;
                        set("week", week);
                      }}
                      className={cn(
                        "h-8 rounded-full px-3 text-xs font-semibold transition-colors",
                        checked
                          ? option.value === "live"
                            ? "bg-primary text-primary-foreground"
                            : option.value === "cfd"
                              ? "bg-accent text-foreground"
                              : "bg-foreground/80 text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="TikTok Live">
        <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-3">
          <TextField label="Nama kanal" value={value.liveLabel} onChange={(next) => set("liveLabel", next)} />
          <TextField label="Hari" value={value.liveDays} onChange={(next) => set("liveDays", next)} />
          <TextField label="Jam" hint='Contoh: "10:30 – 14:30 WITA"' value={value.liveHours} onChange={(next) => set("liveHours", next)} />
        </div>
        <TextField label="Keterangan" multiline rows={2} maxLength={240} value={value.liveNote} onChange={(next) => set("liveNote", next)} />
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <TextField label="Teks tombol" value={value.liveCtaLabel} onChange={(next) => set("liveCtaLabel", next)} />
          <TextField label="Tautan tombol" type="url" value={value.liveCtaUrl} onChange={(next) => set("liveCtaUrl", next)} />
        </div>
      </Card>

      <Card title="CFD Minggu">
        <TextField label="Jam" hint='Contoh: "06.00 – 10.00 WITA"' value={value.cfdHours} onChange={(next) => set("cfdHours", next)} />
        <TextField label="Deskripsi" multiline rows={2} maxLength={400} value={value.cfdDescription} onChange={(next) => set("cfdDescription", next)} />
        <ListEditor
          label="Titik jualan"
          items={value.cfdLocations}
          max={6}
          addLabel="Tambah titik"
          create={() => ({ name: "", landmark: "", mapsUrl: "" })}
          onChange={(next) => set("cfdLocations", next)}
          render={(item, change) => (
            <div className="grid grid-cols-1 gap-2 @2xl:grid-cols-3">
              <input aria-label="Nama titik" placeholder="CFD Boulevard" value={item.name} onChange={(event) => change({ ...item, name: event.target.value })} className={inputClass} />
              <input aria-label="Patokan" placeholder="Berhadapan Social Barn" value={item.landmark} onChange={(event) => change({ ...item, landmark: event.target.value })} className={inputClass} />
              <input aria-label="Tautan Google Maps" placeholder="https://maps.google.com/…" value={item.mapsUrl} onChange={(event) => change({ ...item, mapsUrl: event.target.value })} className={inputClass} />
            </div>
          )}
        />
        <TextField label="Catatan" multiline rows={2} maxLength={400} value={value.cfdNote} onChange={(next) => set("cfdNote", next)} />
      </Card>

      <Card title="Alamat operasional">
        <TextField label="Nama tempat" value={value.addressName} onChange={(next) => set("addressName", next)} />
        <TextField label="Alamat lengkap" multiline rows={2} maxLength={400} value={value.addressText} onChange={(next) => set("addressText", next)} />
        <TextField label="Catatan" maxLength={240} value={value.addressNote} onChange={(next) => set("addressNote", next)} />
        <TextField label="Tautan Google Maps" type="url" value={value.addressMapsUrl} onChange={(next) => set("addressMapsUrl", next)} />
      </Card>
    </>
  );
}

/* ───────────────────────── Bagian: Tentang ───────────────────────── */

function AboutForm({ value, onChange }: { value: SiteContent["about"]; onChange: (next: SiteContent["about"]) => void }) {
  const set = <K extends keyof SiteContent["about"]>(key: K, next: SiteContent["about"][K]) => onChange({ ...value, [key]: next });
  return (
    <>
      <Card title="Judul & foto">
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <TextField label="Judul baris 1" maxLength={80} value={value.titleLine1} onChange={(next) => set("titleLine1", next)} />
          <TextField label="Judul baris 2" maxLength={80} value={value.titleLine2} onChange={(next) => set("titleLine2", next)} />
        </div>
        <ImageField label="Foto lebar" hint="Bila kosong, tampil kotak warna." aspect="aspect-[3/1]" value={value.image} onChange={(next) => set("image", next)} />
      </Card>

      <Card title="Cerita">
        <TextField label="Paragraf utama" multiline rows={3} maxLength={400} value={value.storyLead} onChange={(next) => set("storyLead", next)} />
        <TextField label="Paragraf lanjutan" multiline rows={4} maxLength={800} value={value.storyBody} onChange={(next) => set("storyBody", next)} />
      </Card>

      <Card title="Angka" description="3–4 angka singkat, mis. tahun berdiri atau jumlah rasa.">
        <ListEditor
          label="Angka"
          items={value.stats}
          max={4}
          addLabel="Tambah angka"
          create={() => ({ value: "", label: "" })}
          onChange={(next) => set("stats", next)}
          render={(item, change) => (
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
              <input aria-label="Angka" placeholder="9" value={item.value} onChange={(event) => change({ ...item, value: event.target.value })} className={inputClass} />
              <input aria-label="Keterangan angka" placeholder="varian rasa mochi" value={item.label} onChange={(event) => change({ ...item, label: event.target.value })} className={inputClass} />
            </div>
          )}
        />
      </Card>

      <Card title="Cara kerja kami">
        <ListEditor
          label="Langkah"
          items={value.steps}
          max={6}
          addLabel="Tambah langkah"
          create={() => ({ title: "", body: "" })}
          onChange={(next) => set("steps", next)}
          render={(item, change) => (
            <div className="grid gap-2">
              <input aria-label="Judul langkah" placeholder="Judul" value={item.title} onChange={(event) => change({ ...item, title: event.target.value })} className={inputClass} />
              <input aria-label="Isi langkah" placeholder="Penjelasan singkat" value={item.body} onChange={(event) => change({ ...item, body: event.target.value })} className={inputClass} />
            </div>
          )}
        />
      </Card>

      <Card title="Ajakan di bawah halaman">
        <TextField label="Judul" maxLength={80} value={value.ctaTitle} onChange={(next) => set("ctaTitle", next)} />
        <TextField label="Kalimat" maxLength={240} value={value.ctaText} onChange={(next) => set("ctaText", next)} />
      </Card>
    </>
  );
}

/* ───────────────────────── Bagian: Kontak ───────────────────────── */

function ContactForm({ value, onChange }: { value: SiteContent["contact"]; onChange: (next: SiteContent["contact"]) => void }) {
  const set = <K extends keyof SiteContent["contact"]>(key: K, next: SiteContent["contact"][K]) => onChange({ ...value, [key]: next });
  return (
    <>
      <Card title="Pembuka">
        <TextField label="Kalimat di bawah judul" maxLength={200} value={value.intro} onChange={(next) => set("intro", next)} />
        <TextField label="Catatan di kartu WhatsApp" maxLength={240} value={value.whatsappNote} onChange={(next) => set("whatsappNote", next)} />
      </Card>
      <Card title="Cara pesan">
        <ListEditor
          label="Langkah"
          items={value.orderSteps}
          max={6}
          addLabel="Tambah langkah"
          create={() => ""}
          onChange={(next) => set("orderSteps", next)}
          render={(item, change) => (
            <input aria-label="Langkah" value={item} onChange={(event) => change(event.target.value)} className={inputClass} />
          )}
        />
      </Card>
      <Card title="Ambil & kirim">
        <TextField label="Instruksi pengambilan" multiline rows={3} maxLength={400} value={value.pickupInstruction} onChange={(next) => set("pickupInstruction", next)} />
        <ListEditor
          label="Layanan antar"
          items={value.deliveryMethods}
          max={10}
          addLabel="Tambah layanan"
          create={() => ""}
          onChange={(next) => set("deliveryMethods", next)}
          render={(item, change) => (
            <input aria-label="Layanan antar" placeholder="GrabExpress" value={item} onChange={(event) => change(event.target.value)} className={inputClass} />
          )}
        />
        <TextField label="Catatan pengiriman" maxLength={200} value={value.deliveryNote} onChange={(next) => set("deliveryNote", next)} />
      </Card>
    </>
  );
}

/* ───────────────────────── Komponen bantu ───────────────────────── */

function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-muted px-3.5 py-3">
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
      <Toggle checked={checked} label={label} onChange={onChange} />
    </div>
  );
}

/** Daftar yang bisa ditambah, dihapus, dan diurutkan. */
function ListEditor<Item>({
  label,
  items,
  max,
  addLabel,
  create,
  onChange,
  render,
}: {
  label: string;
  items: Item[];
  max: number;
  addLabel: string;
  create: () => Item;
  onChange: (next: Item[]) => void;
  render: (item: Item, change: (next: Item) => void) => ReactNode;
}) {
  const move = (index: number, offset: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item!);
    onChange(next);
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-1.5 text-sm font-semibold text-foreground">{label}</legend>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada isi.</p> : null}
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 rounded-xl border border-border/70 p-2">
            <span className="mt-3 w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
            <div className="min-w-0 flex-1">
              {render(item, (next) => onChange(items.map((current, position) => (position === index ? next : current))))}
            </div>
            <span className="flex shrink-0 flex-col sm:flex-row">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30">
                <ArrowUp aria-hidden="true" className="size-4" />
                <span className="sr-only">Naikkan</span>
              </button>
              <button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30">
                <ArrowDown aria-hidden="true" className="size-4" />
                <span className="sr-only">Turunkan</span>
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, position) => position !== index))} className="flex size-9 items-center justify-center rounded-full text-destructive hover:bg-[#fbe9e7]">
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Hapus</span>
              </button>
            </span>
          </li>
        ))}
      </ol>
      {items.length < max ? (
        <button type="button" onClick={() => onChange([...items, create()])} className={cn(buttonClass("secondary", "sm"), "w-fit")}>
          <Plus aria-hidden="true" className="size-4" />
          {addLabel}
        </button>
      ) : null}
    </fieldset>
  );
}
