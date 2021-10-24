import Head from "next/head";
import TopOptions from "../components/TopOptions/TopOptions";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Crypto Option Finder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="font-extrabold text-6xl tracking-tight text-gray-900">
          Crypto Option Finder
        </h1>
        <span className="text-2xl pt-5 text-lg text-gray-500">
          Find the best option on Deribit for your predicted price at a
          specified date.
        </span>{" "}
        <TopOptions />
      </main>
      <footer className="flex items-center justify-center w-full mt-10 h-24 border-t">
        Powered by
        <a
          className="flex items-center justify-center"
          href="https://digitalassetsolutions.fr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          Digital Asset Solutions
        </a>
      </footer>
    </div>
  );
}
