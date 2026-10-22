import React from 'react';
import { Child, ChildEvent } from '../types';
import { Users, Plus, Sparkles } from 'lucide-react';

interface TaViewProps {
  child: Child;
  timeline: ChildEvent[];
  onOpenObservationModal: () => void;
}

export const TaView: React.FC<TaViewProps> = ({ child, timeline, onOpenObservationModal }) => {
  return (
    <div className="space-y-6">
      {/* TA Header */}
      <div className="card p-5 border-l-4 border-l-green">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-light flex items-center justify-center font-bold text-green">
              MG
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Melissa Grant · Teaching Assistant Support</h2>
              <p className="text-xs text-gray-500">Assigned 1-to-1 support focus: {child.full_name || 'Phoenix Carter'}</p>
            </div>
          </div>
          <button
            onClick={onOpenObservationModal}
            className="flex items-center gap-1.5 bg-green hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log TA Note</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strategy Checklist for Classroom */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Sparkles className="w-4 h-4 text-green" />
            <h3 className="text-sm font-bold text-navy">Approved Provision Strategies</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-navy">Visual Task Strip on Desk</div>
                <div className="text-[11px] text-gray-500">Break 45-min lesson into three 15-min visual chunks.</div>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Active</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-navy">Noise Defenders Ready for Assembly</div>
                <div className="text-[11px] text-gray-500">Pre-warn 5 minutes before transition bell rings.</div>
              </div>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">Priority</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-navy">Proactive Movement Break</div>
                <div className="text-[11px] text-gray-500">5-minute quiet errand if fidgeting or pencil tapping escalates.</div>
              </div>
              <span className="text-gray-500 font-medium bg-gray-200/60 px-2 py-0.5 rounded text-[10px]">On Standby</span>
            </div>
          </div>
        </div>

        {/* Recent observations */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Users className="w-4 h-4 text-green" />
            <h3 className="text-sm font-bold text-navy">Recent Classroom Notes</h3>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {timeline.slice(0, 4).map((evt) => (
              <div key={evt.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-navy">
                  <span>{evt.title}</span>
                  <span className="text-gray-400 text-[10px]">
                    {new Date(evt.event_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">{evt.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
