import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { TaperStep, BenzoType } from '../types';
import { BENZO_DETAILS } from '../constants';

interface Props {
  steps: TaperStep[];
  medication?: BenzoType;
}

export const TaperChart: React.FC<Props> = (props) => {
  const { steps, medication = BenzoType.DIAZEPAM } = props;
  
  const isCrossover = medication !== BenzoType.DIAZEPAM;
  const medDetails = BENZO_DETAILS[medication];

  const data = useMemo(() => {
    let accumulatedDays = 0;
    const points = steps.map(step => {
      const originalEq = isCrossover 
        ? step.originalMedDose * (medDetails?.diazepamEquivalence || 0)
        : 0;

      const point = {
        day: accumulatedDays,
        diazepam: step.diazepamDose,
        originalEq: originalEq,
        originalRaw: step.originalMedDose,
        label: `Week ${step.week}`
      };
      accumulatedDays += step.durationDays;
      return point;
    });

    points.push({
        day: accumulatedDays,
        diazepam: 0,
        originalEq: 0,
        originalRaw: 0,
        label: 'Finish'
    });

    return points;
  }, [steps, medication, isCrossover, medDetails]);

  return (
    <div className="h-[350px] w-full mt-2 pb-2 select-none px-4 relative">
       <style>{`
          .recharts-brush-slide {
            rx: 6px;
            ry: 6px;
          }
          .recharts-brush-traveller rect {
            rx: 4px;
            ry: 4px;
          }
          /* Style the day labels inside the brush */
          .recharts-brush-texts text {
            fill: #94a3b8 !important; /* Slate-400 */
            font-size: 10px;
            font-weight: 700;
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
       `}</style>
       {/* Axis Title Overlay - Positioned explicitly between Axis and Brush */}
       <div className="absolute bottom-[55px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none z-10">
          Timeline (Days)
       </div>
       
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 85 }} // Removed negative left margin to fix clipping
        >
          <defs>
            <linearGradient id="colorDiazepam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#1e293b" 
            vertical={false} 
          />
          <XAxis 
            dataKey="day" 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}
            type="number"
            domain={['dataMin', 'dataMax']}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}
            width={35}
            tickFormatter={(value) => value === 0 ? '0' : value}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0b101b', 
              borderRadius: '12px', 
              border: '1px solid #1e293b',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              fontSize: '12px',
              fontFamily: 'Plus Jakarta Sans',
              padding: '12px',
              color: '#f8fafc'
            }}
            cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
            itemStyle={{ paddingBottom: '4px', fontWeight: 500, color: '#e2e8f0' }}
            formatter={(value: number, name: string, props: any) => {
                if (name === 'Diazepam') return [`${value} mg`, name];
                if (name === medDetails.name) return [`${props.payload.originalRaw} mg`, name];
                return [value, name];
            }}
            labelFormatter={(label) => <span className="text-slate-400 font-bold mb-2 block text-xs uppercase tracking-wide">Day {label}</span>}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, top: -5 }}
          />
          
          <Brush 
            dataKey="day"
            height={24}
            y={310} // Positioned near bottom of 350px container
            stroke="#334155" // Slate-700 for a subtle border
            fill="#05080f"   // Midnight-950 for background to blend in
            tickFormatter={(value) => `${value}d`}
            travellerWidth={10}
            alwaysShowText={true}
            startIndex={0}
          />

          {isCrossover && (
             <Area 
                type="stepAfter" 
                dataKey="originalEq" 
                name={medDetails.name}
                stroke="#818cf8" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorOriginal)" 
                animationDuration={1500}
                stackId="1" 
              />
          )}

          <Area 
            type="stepAfter" 
            dataKey="diazepam" 
            name="Diazepam"
            stroke="#2dd4bf" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorDiazepam)" 
            animationDuration={1500}
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};