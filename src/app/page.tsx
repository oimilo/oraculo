import OracleExperience from '@/components/experience/OracleExperience';
import { VersionProvider } from '@/contexts/VersionContext';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <VersionProvider>
        <OracleExperience />
      </VersionProvider>
    </main>
  );
}
