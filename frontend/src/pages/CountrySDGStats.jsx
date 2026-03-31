import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/CountrySDGStats.css';

const SDG_LIST = [
  { key: 'noPoverty', label: 'No Poverty', fileName: 'poverty.png' },
  { key: 'zeroHunger', label: 'Zero Hunger', fileName: 'hunger.png' },
  { key: 'goodHealth', label: 'Good Health', fileName: 'healthcare.png' },
  { key: 'qualityEducation', label: 'Quality Education', fileName: 'quality education.png' },
  { key: 'genderEquality', label: 'Gender Equality', fileName: 'gender equality.png' },
  { key: 'cleanWater', label: 'Clean Water', fileName: 'clean water.png' },
  { key: 'affordableEnergy', label: 'Affordable Energy', fileName: 'affordable energy.png' },
  { key: 'decentWork', label: 'Decent Work', fileName: 'livelihood and skills training.png' },
  { key: 'industry', label: 'Industry & Innovation', fileName: 'industry and innovation.png' },
  { key: 'reducedInequalities', label: 'Reduced Inequalities', fileName: 'reduced inequalities.png' },
  { key: 'sustainableCities', label: 'Sustainable Cities', fileName: 'cities and relief.png' },
  { key: 'responsibleConsumption', label: 'Responsible Consumption', fileName: 'responsible consumption.png' },
  { key: 'climateAction', label: 'Climate Action', fileName: 'environment.png' },
  { key: 'lifeBelowWater', label: 'Life Below Water', fileName: 'life below water.png' },
  { key: 'lifeOnLand', label: 'Life on Land', fileName: 'life on land.png' },
  { key: 'peaceAndJustice', label: 'Peace & Justice', fileName: 'peace and justice.png' },
  { key: 'partnerships', label: 'Partnerships', fileName: 'partnerships.png' },
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
    navigate('/donor', {
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
                  src={`/pictures/SDGLogos/${sdg.fileName}`}
                  alt={sdg.label}
                  className="sdg-logo"
                  onError={(e) => {
                    e.target.src = `/pictures/SDGLogos/${sdg.fileName}`;
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
