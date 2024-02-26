import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from './Header';
import Footer from './Footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
  <div className="app-container">
    <Header />
      <main className="main-content">
        <Component {...pageProps} />
      </main>
    <Footer />
  </div>);
}
