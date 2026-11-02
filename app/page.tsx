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
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <BirthdayProvider>
      <main id="main-content">
        <PhotoArchive />
        <About />
        <SucukProfile />
        <SucukJournal />
        <VisitPlanner />
        <RelatedSite />
      </main>
      <Footer />
      </BirthdayProvider>
    </>
  );
}
