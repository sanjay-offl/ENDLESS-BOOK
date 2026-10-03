import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        Endless Book<span>.</span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/chapters">The chapters</Link>
        <Link href="/submit">Submit</Link>
        <Link href="/profile">Profile</Link>
      </nav>
      <Link className="header-button" href="/submit">
        Write a memory <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
