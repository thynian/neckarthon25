import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ContentArea } from "@/components/ContentArea";

type TabType = "offen" | "mein-bereich" | "team-bereich";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("offen");

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <ContentArea activeTab={activeTab} />
    </div>
  );
};

export default Index;
