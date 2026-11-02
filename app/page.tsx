import { About } from "@/components/about";
import { Footer } from "@/components/footer";
import { PhotoArchive } from "@/components/photo-archive";
import { RelatedSite } from "@/components/related-site";
import { SucukProfile } from "@/components/sucuk-profile";
import { VisitPlanner } from "@/components/visit-planner";
import { SucukJournal } from "@/components/sucuk-journal";
import { BirthdayProvider } from "@/components/birthday-provider";

export default function Home() {
  return (
    <BirthdayProvider><div id="top">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <main id="main-content">
        <PhotoArchive />
        <About />
        <SucukProfile />
        <SucukJournal />
        <VisitPlanner />
        <RelatedSite />
      </main>
      <Footer />
    </div></BirthdayProvider>
  );
}
