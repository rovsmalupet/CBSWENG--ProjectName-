import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/PublicCorporateProfile.css";

const numberFrom = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 0,
  }).format(numberFrom(value));

export default function PublicCorporateProfile() {
  const [params] = useSearchParams();

  const profile = useMemo(() => {
    const name = params.get("name") || "Corporate Donor";
    const lifetime = numberFrom(params.get("lifetime"));
    const partnerships = numberFrom(params.get("partnerships"));
    const projects = numberFrom(params.get("projects"));
    const updated = params.get("updated") || "Recently";

    return {
      name,
      lifetime,
      partnerships,
      projects,
      updated,
    };
  }, [params]);

  return (
    <div className="public-corporate-page">
      <main className="public-corporate-main">
        <section className="public-corporate-hero">
          <p className="public-kicker">Community Impact Profile</p>
          <h1>{profile.name}</h1>
          <p>
            We proudly support nonprofit campaigns and continuously invest in meaningful
            community impact.
          </p>
        </section>

        <section className="public-corporate-metrics">
          <article>
            <strong>{formatNumber(profile.lifetime)}</strong>
            <span>Total Lifetime Contributions</span>
          </article>
          <article>
            <strong>{formatNumber(profile.partnerships)}</strong>
            <span>NGO Partnerships</span>
          </article>
          <article>
            <strong>{formatNumber(profile.projects)}</strong>
            <span>Supported Projects</span>
          </article>
        </section>

        <p className="public-corporate-footnote">Last updated: {profile.updated}</p>
      </main>
    </div>
  );
}
