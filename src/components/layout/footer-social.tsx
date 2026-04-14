const social = {
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://www.instagram.com/",
  facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://www.facebook.com/",
  x: process.env.NEXT_PUBLIC_SOCIAL_X || "https://twitter.com/",
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "https://www.youtube.com/",
};

function iconClass() {
  return "h-6 w-6 transition group-hover:scale-110 group-hover:text-brand-300";
}

export function FooterSocial() {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-400/90">Sosyal medya</span>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-400 transition hover:border-brand-500/40 hover:bg-zinc-900"
          aria-label="Instagram"
        >
          <svg
            className={iconClass()}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-400 transition hover:border-brand-500/40 hover:bg-zinc-900"
          aria-label="Facebook"
        >
          <svg className={iconClass()} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <a
          href={social.x}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-400 transition hover:border-brand-500/40 hover:bg-zinc-900"
          aria-label="X"
        >
          <svg className={iconClass()} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href={social.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-400 transition hover:border-brand-500/40 hover:bg-zinc-900"
          aria-label="YouTube"
        >
          <svg className={iconClass()} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
