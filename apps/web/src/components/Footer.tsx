import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <span>The book never ends.</span>
      <span className="footer-detail">A community book · By Sanjay · Coimbatore</span>
      <Link href="/about">About the project</Link>
    </footer>
  );
}
