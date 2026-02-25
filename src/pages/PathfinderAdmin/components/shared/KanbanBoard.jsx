import React from 'react';
import { Badge } from '../../../../components/ui/badge';
import { getStageLabel } from './utils';

const KanbanBoard = ({
  columns,
  getItemsForColumn,
  renderCard,
  collapsedColumns = {},
  toggleCollapse,
  emptyMessage = 'No items'
}) => {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-[#4242ea]">
      {columns.map(({ stage, label }) => {
        const columnItems = getItemsForColumn(stage);
        const isCollapsed = collapsedColumns[stage];
        
        return (
          <div
            key={stage}
            className={`flex-shrink-0 bg-white rounded-lg border border-gray-200 transition-all duration-200 hover:border-[#4242ea]/30 hover:shadow-[0_0_0_2px_rgba(66,66,234,0.1)] ${
              isCollapsed ? 'w-[60px] min-w-[60px] max-w-[60px]' : 'w-[320px] min-w-[320px]'
            }`}
          >
            <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${
              isCollapsed ? 'flex-col gap-2 py-3' : ''
            }`}>
              <div className={isCollapsed ? 'flex flex-col items-center gap-2' : ''}>
                {isCollapsed ? (
                  <Badge
                    variant="secondary"
                    className="[writing-mode:vertical-rl] text-orientation-mixed text-xs py-1.5 px-1"
                  >
                    {label || getStageLabel(stage)}
                  </Badge>
                ) : (
                  <h3 className="text-base font-semibold text-gray-900 m-0">
                    {label || getStageLabel(stage)}
                  </h3>
                )}
              </div>
              <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
                {!isCollapsed && (
                  <span className="bg-gray-100 px-2.5 py-1 rounded-xl text-xs font-semibold text-gray-700">
                    {columnItems.length}
                  </span>
                )}
                <button
                  onClick={() => toggleCollapse(stage)}
                  className="w-6 h-6 border-none bg-transparent rounded text-gray-500 hover:bg-gray-100 hover:text-[#4242ea] transition-colors cursor-pointer flex items-center justify-center"
                  title={isCollapsed ? 'Expand column' : 'Collapse column'}
                >
                  {isCollapsed ? '→' : '←'}
                </button>
              </div>
            </div>
            {!isCollapsed && (
              <div className="p-4 flex flex-col gap-4 flex-1 min-h-[200px]">
                {columnItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm italic">
                    {typeof emptyMessage === 'function' ? emptyMessage(stage) : emptyMessage}
                  </div>
                ) : (
                  columnItems.map((item, index) => (
                    <div key={item.id || index}>
                      {renderCard(item)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;

