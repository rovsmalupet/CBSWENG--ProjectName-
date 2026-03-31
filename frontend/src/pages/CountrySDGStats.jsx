import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/CountrySDGStats.css';

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

        <button className="view-campaigns-btn" onClick={() => navigate('/donor/home')}>
          View Campaigns
        </button>
      </div>
    </div>
  );
};

export default CountrySDGStats;
