import { useNavigate } from "react-router-dom";
import "../css/ASEANSelection.css";

const ASEAN_COUNTRIES = [
  { name: "Brunei", flagFile: "brunei.svg" },
  { name: "Cambodia", flagFile: "cambodia.svg" },
  { name: "Indonesia", flagFile: "indonesia.svg" },
  { name: "Laos", flagFile: "laos.svg" },
  { name: "Malaysia", flagFile: "malaysia.svg" },
  { name: "Myanmar", flagFile: "myanmar.svg" },
  { name: "Philippines", flagFile: "philippines.svg" },
  { name: "Singapore", flagFile: "singapore.svg" },
  { name: "Thailand", flagFile: "thailand.svg" },
  { name: "Vietnam", flagFile: "vietnam.svg" },
];

export default function ASEANSelection() {
  const navigate = useNavigate();

  const handleCountryClick = (country) => {
    navigate(`/donor/country/${country.name.toLowerCase()}`);
  };

  const handleBack = () => {
    navigate("/donor");
  };

  return (
    <div className="asean-selection-page">
      <div className="asean-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="asean-title">ASEAN Countries</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="asean-content">
        <p className="asean-subtitle">Select a country to view campaigns</p>
        <div className="countries-grid">
          {ASEAN_COUNTRIES.map((country) => (
            <button
              key={country.name}
              className="country-card"
              onClick={() => handleCountryClick(country)}
            >
              <div className="country-flag">
                <img
                  src={`/pictures/Flags/${country.flagFile}`}
                  alt={`${country.name} flag`}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <span className="country-name">{country.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
