import React from 'react';
import SearchableSelect from './SearchableSelect';
import './PhoneWithCountry.css';

const COUNTRY_DIAL_CODES = [
  { name: 'Brazil', dial: '+55' },
  { name: 'United States', dial: '+1' },
  { name: 'United Kingdom', dial: '+44' },
  { name: 'Canada', dial: '+1' },
  { name: 'Australia', dial: '+61' },
  { name: 'Germany', dial: '+49' },
  { name: 'France', dial: '+33' },
  { name: 'India', dial: '+91' },
  { name: 'Japan', dial: '+81' },
  { name: 'China', dial: '+86' },
  { name: 'Mexico', dial: '+52' },
  { name: 'Spain', dial: '+34' },
  { name: 'Italy', dial: '+39' },
  { name: 'Netherlands', dial: '+31' },
  { name: 'South Korea', dial: '+82' },
  { name: 'Argentina', dial: '+54' },
  { name: 'Colombia', dial: '+57' },
  { name: 'Portugal', dial: '+351' },
  { name: 'Poland', dial: '+48' },
  { name: 'South Africa', dial: '+27' },
  { name: 'Nigeria', dial: '+234' },
  { name: 'Egypt', dial: '+20' },
  { name: 'Philippines', dial: '+63' },
  { name: 'Vietnam', dial: '+84' },
  { name: 'Pakistan', dial: '+92' },
  { name: 'Bangladesh', dial: '+880' },
  { name: 'Indonesia', dial: '+62' },
  { name: 'Thailand', dial: '+66' },
  { name: 'Malaysia', dial: '+60' },
  { name: 'Singapore', dial: '+65' },
  { name: 'Israel', dial: '+972' },
  { name: 'Turkey', dial: '+90' },
  { name: 'Ukraine', dial: '+380' },
  { name: 'Russia', dial: '+7' },
  { name: 'Sweden', dial: '+46' },
  { name: 'Norway', dial: '+47' },
  { name: 'Denmark', dial: '+45' },
  { name: 'Finland', dial: '+358' },
  { name: 'Ireland', dial: '+353' },
  { name: 'New Zealand', dial: '+64' },
  { name: 'Chile', dial: '+56' },
  { name: 'Peru', dial: '+51' },
];

const getDialForCountry = (country) =>
  COUNTRY_DIAL_CODES.find((c) => c.name === country)?.dial || '';

const stripDialCode = (phone) => {
  const trimmed = phone.replace(/^\s+/, '');
  for (const c of COUNTRY_DIAL_CODES) {
    if (trimmed.startsWith(c.dial)) {
      return trimmed.slice(c.dial.length).replace(/^\s+/, '');
    }
  }
  return trimmed;
};

const PhoneWithCountry = ({ phoneNumber, country, onPhoneChange, onCountryChange, id, placeholder }) => {
  const countryOptions = COUNTRY_DIAL_CODES.map((c) => ({
    id: c.name,
    name: `${c.name} (${c.dial})`,
  }));

  const selectedCountry = country || '';
  const dial = getDialForCountry(selectedCountry);

  const handleCountryChange = (val) => {
    const newCountry = val || '';
    onCountryChange(newCountry);
    const newDial = getDialForCountry(newCountry);
    if (newDial) {
      const national = stripDialCode(phoneNumber || '');
      onPhoneChange(national ? `${newDial} ${national}` : `${newDial} `);
    }
  };

  const handlePhoneChange = (e) => {
    onPhoneChange(e.target.value);
  };

  return (
    <div className="phone-with-country">
      <SearchableSelect
        id={`${id}-country`}
        value={selectedCountry}
        onChange={handleCountryChange}
        options={countryOptions}
        placeholder="Select country"
        allowEmpty
        emptyLabel="Select country"
        className="phone-country-select"
      />
      <input
        id={id}
        type="tel"
        className="phone-number-input"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder || (dial ? `${dial} 123 456 7890` : 'Phone number')}
        autoComplete="tel"
      />
    </div>
  );
};

export default PhoneWithCountry;
export { COUNTRY_DIAL_CODES };
