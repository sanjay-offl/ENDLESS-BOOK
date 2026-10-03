import Link from "next/link";

const chapters = [
  {
    number: "001",
    title: "The Wheel Cart of Bangles",
    place: "Coimbatore, Tamil Nadu",
    author: "Sanjay",
  },
  {
    number: "002",
    title: "The Smell of Wet Earth",
    place: "Kochi, Kerala",
    author: "Ananya",
  },
  {
    number: "003",
    title: "The Blue Kite",
    place: "Jaipur, Rajasthan",
    author: "Ravi",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="topbar" aria-label="Main navigation">
        <Link className="wordmark" href="/">
          Endless Book<span>.</span>
        </Link>
        <div className="nav-links">
          <a href="#book">The Book</a>
          <a href="#map">The Map</a>
          <a href="#write">Write</a>
          <a href="#about">About</a>
        </div>
        <a className="nav-cta" href="#write">
          Write a chapter <span aria-hidden="true">↗</span>
        </a>
      </nav>

      <section className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow">A community book of childhood memories</p>
          <h1>
            Every childhood
            <em>is a chapter.</em>
          </h1>
          <p className="hero-intro">
            Three pages each, written by a real person.
            <br />
            The book never ends.
          </p>
          <div className="hero-actions">
            <a className="button" href="#write">
              Write a chapter <span aria-hidden="true">→</span>
            </a>
            <a className="text-link" href="#book">
              Start reading <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="hero-art" aria-label="An abstract golden-hour memory illustration">
          <div className="sun" />
          <div className="skyline skyline-back" />
          <div className="skyline skyline-front" />
          <div className="cart">
            <div className="cart-roof" />
            <div className="cart-window">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="cart-body" />
            <div className="wheel wheel-one" />
            <div className="wheel wheel-two" />
          </div>
          <p className="art-caption">A memory from Coimbatore</p>
        </div>
      </section>

      <section className="manifesto section-shell" id="book">
        <p className="eyebrow">How it works</p>
        <div className="manifesto-lines">
          <p>You remember it.</p>
          <p>You write it in three pages.</p>
          <p>The world reads it.</p>
        </div>
        <p className="section-note">
          Small moments stay with us. This is a place to keep them, together.
        </p>
      </section>

      <section className="number-section section-shell">
        <div className="giant-number">3</div>
        <div>
          <p className="eyebrow">The format</p>
          <h2>Pages, always.</h2>
          <p className="section-note">
            Three pages is enough space for a beginning, a little wandering,
            and the detail you still remember years later.
          </p>
        </div>
      </section>

      <section className="latest section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The latest chapters</p>
            <h2>Voices from everywhere.</h2>
          </div>
          <a className="text-link desktop-link" href="#book">
            See every chapter <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="chapter-list">
          {chapters.map((chapter) => (
            <a className="chapter-row" href="#chapter-one" key={chapter.number}>
              <span className="chapter-number">{chapter.number}</span>
              <span className="chapter-title">{chapter.title}</span>
              <span className="chapter-meta">
                {chapter.place} · {chapter.author}
              </span>
              <span className="chapter-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
        <a className="text-link mobile-link" href="#book">
          See every chapter <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="featured section-shell" id="chapter-one">
        <div className="featured-label">
          <span className="chapter-number">Chapter one</span>
          <span className="eyebrow">By Sanjay · Coimbatore</span>
        </div>
        <div className="featured-copy">
          <h2>The Wheel Cart of Bangles</h2>
          <p>
            He was not collecting stickers. He was collecting the sound of
            that cart and his mom laughing while she paid.
          </p>
          <a className="text-link" href="#read">
            Read it <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="disclosure section-shell" id="about">
        <p className="eyebrow">Full disclosure</p>
        <div className="disclosure-copy">
          <p>
            Every chapter is read before it joins the book. We remove private
            details and anything that could make someone unsafe.
          </p>
          <p>
            Places are rounded to the city. Authors keep their stories. We ask
            for consent before publishing.
          </p>
        </div>
      </section>

      <section className="footer-cta section-shell" id="write">
        <p className="eyebrow">Your turn</p>
        <h2>
          What do you
          <em>still remember?</em>
        </h2>
        <a className="button button-light" href="#write">
          Write a chapter <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className="site-footer section-shell">
        <span>The book never ends.</span>
        <span className="footer-detail">A community book · By Sanjay · Coimbatore</span>
        <a href="mailto:sanjayoffl24@gmail.com">sanjayoffl24@gmail.com</a>
      </footer>
    </main>
  );
}
