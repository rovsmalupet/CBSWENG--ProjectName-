import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/CountrySDGStats.css';

const SDG_LIST = [
  { key: 'noPoverty', label: 'No Poverty' },
  { key: 'zeroHunger', label: 'Zero Hunger' },
  { key: 'goodHealth', label: 'Good Health' },
  { key: 'qualityEducation', label: 'Quality Education' },
  { key: 'genderEquality', label: 'Gender Equality' },
  { key: 'cleanWater', label: 'Clean Water' },
  { key: 'affordableEnergy', label: 'Affordable Energy' },
  { key: 'decentWork', label: 'Decent Work' },
  { key: 'industry', label: 'Industry & Innovation' },
  { key: 'reducedInequalities', label: 'Reduced Inequalities' },
  { key: 'sustainableCities', label: 'Sustainable Cities' },
  { key: 'responsibleConsumption', label: 'Responsible Consumption' },
  { key: 'climateAction', label: 'Climate Action' },
  { key: 'lifeBelowWater', label: 'Life Below Water' },
  { key: 'lifeOnLand', label: 'Life on Land' },
  { key: 'peaceAndJustice', label: 'Peace & Justice' },
  { key: 'partnerships', label: 'Partnerships' },
];

const CountrySDGStats = () => {
  const { country } = useParams();
  const navigate = useNavigate();

  const sdgData = {
    brunei: {
      name: 'Brunei',
      score: '67.97',
      rank: '92'
    },
    cambodia: {
      name: 'Cambodia',
      score: '66.38',
      rank: '101'
    },
    indonesia: {
      name: 'Indonesia',
      score: '70.22',
      rank: '77'
    },
    laos: {
      name: 'Laos',
      score: '62.55',
      rank: '121'
    },
    malaysia: {
      name: 'Malaysia',
      score: '69.52',
      rank: '84'
    },
    myanmar: {
      name: 'Myanmar',
      score: '63.56',
      rank: '116'
    },
    philippines: {
      name: 'Philippines',
      score: '68.34',
      rank: '87'
    },
    singapore: {
      name: 'Singapore',
      score: '71.54',
      rank: '69'
    },
    thailand: {
      name: 'Thailand',
      score: '75.34',
      rank: '43'
    },
    vietnam: {
      name: 'Vietnam',
      score: '73.35',
      rank: '61'
    }
  };

  const countryData = sdgData[country?.toLowerCase()];

  if (!countryData) {
    return (
      <div className="stats-container">
        <p>Country not found</p>
      </div>
    );
  }

  const handleSDGClick = (sdgKey) => {
    navigate('/donor/home', {
      state: {
        selectedCountry: countryData.name,
        selectedSDG: sdgKey,
      },
    });
  };

  return (
    <div className="stats-container">
      <button className="back-button" onClick={() => navigate('/donor/asean')}>
        ← Back
      </button>
      
      <div className="stats-content">
        <div className="flag-container">
          <img 
            src={`/pictures/Flags/${country}.svg`} 
            alt={countryData.name}
            className="country-flag-large"
            onError={(e) => {
              e.target.src = `/pictures/Flags/${countryData.name.toLowerCase()}.svg`;
            }}
          />
        </div>

        <h1>{countryData.name}</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">SDG Index Score</div>
            <div className="stat-value">{countryData.score}/100</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">SDG Index Rank</div>
            <div className="stat-value">{countryData.rank}/167</div>
          </div>
        </div>

        <div className="sdg-section">
          <h3 className="sdg-title">Click an SDG to view related campaigns</h3>
          <div className="sdg-grid">
            {SDG_LIST.map((sdg) => (
              <button
                key={sdg.key}
                className="sdg-button"
                onClick={() => handleSDGClick(sdg.key)}
                title={sdg.label}
              >
                <img
                  src={`/pictures/SDGLogos/${sdg.key}.svg`}
                  alt={sdg.label}
                  className="sdg-logo"
                  onError={(e) => {
                    e.target.src = `/pictures/SDGLogos/${sdg.key}.png`;
                  }}
                />
                <span className="sdg-label">{sdg.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountrySDGStats;
