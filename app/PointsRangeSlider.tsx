import React from 'react';

import Slider from 'rc-slider';
// @ts-ignore - CSS import
import 'rc-slider/assets/index.css';

interface PointsRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const PointsRangeSlider: React.FC<PointsRangeSliderProps> = ({ min, max, value, onChange }) => {
  return (
    <div className="bg-[#101c2a] border-2 border-[#FF7901] rounded-xl p-4 shadow-inner flex flex-col gap-3">
      <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
        <img src="/pts.png" alt="Points" className="w-5 h-5 inline-block align-middle" />
        Points Range
      </h4>
      <div className="flex justify-between text-sm text-white font-mono mb-1">
        <span>Min: {value[0].toLocaleString()}</span>
        <span>Max: {value[1].toLocaleString()}</span>
      </div>
      <Slider
        range
        min={min}
        max={max}
        value={value}
        onChange={(val) => onChange(val as [number, number])}
        trackStyle={[{ background: 'linear-gradient(90deg, #FF7901 0%, #FFA323 100%)', height: 8 }]}
        handleStyle={[
          { borderColor: '#FF7901', backgroundColor: '#FFA323', height: 24, width: 24, marginTop: -8, boxShadow: '0 0 0 4px #FF790133' },
          { borderColor: '#FF7901', backgroundColor: '#FFA323', height: 24, width: 24, marginTop: -8, boxShadow: '0 0 0 4px #FFA32333' }
        ]}
        railStyle={{ background: 'linear-gradient(90deg, #FFA323 0%, #FF7901 100%)', height: 8 }}
        allowCross={false}
      />
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          value={value[0]}
          min={min}
          max={value[1]}
          onChange={e => {
            const val = Number(e.target.value);
            if (val >= min && val <= value[1]) onChange([val, value[1]]);
          }}
          className="w-1/2 px-3 py-2 text-sm bg-gray-900 border-2 border-[#FF7901] rounded-lg text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#FFA323] font-mono"
          placeholder="Min"
        />
        <input
          type="number"
          value={value[1]}
          min={value[0]}
          max={max}
          onChange={e => {
            const val = Number(e.target.value);
            if (val <= max && val >= value[0]) onChange([value[0], val]);
          }}
          className="w-1/2 px-3 py-2 text-sm bg-gray-900 border-2 border-[#FFA323] rounded-lg text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#FF7901] font-mono"
          placeholder="Max"
        />
      </div>
    </div>
  );
};

export default PointsRangeSlider;
