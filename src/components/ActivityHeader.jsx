import ArrowButton from './ArrowButton/ArrowButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const ActivityHeader = ({ currentDay, tasks, currentTaskIndex, onTaskChange }) => {
  if (!currentDay || !tasks) return null;

  const currentTask = tasks[currentTaskIndex];
  const hasPrevious = currentTaskIndex > 0;
  const hasNext = currentTaskIndex < tasks.length - 1;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: '2-digit' });
    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `${month}.${day} ${weekday}`;
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      onTaskChange(currentTaskIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onTaskChange(currentTaskIndex + 1);
    }
  };

  // Format activity number with leading zero
  const formatActivityNumber = (index) => {
    return String(index + 1).padStart(2, '0');
  };

  return (
    <div className="h-[45px] bg-bg-light border-b border-divider shadow-lg flex items-center justify-between px-6 relative z-20">
        {/* Date with gradient text */}
        <h1 
          className="text-xl font-proxima font-normal"
          style={{
            background: 'linear-gradient(90deg, #1E1E1E 0%, #4242EA 55.29%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {formatDate(currentDay.day_date)}
        </h1>

      {/* Navigation Bar - Centered */}
      <div className="flex items-center gap-3 h-[32px] rounded-lg px-4">
        {/* Previous Arrow */}
        <ArrowButton
            onClick={handlePrevious}
          borderColor={hasPrevious ? "#4242EA" : "#CCCCCC"}
          backgroundColor="transparent"
          arrowColor={hasPrevious ? "#4242EA" : "#CCCCCC"}
          hoverBackgroundColor={hasPrevious ? "#4242EA" : "transparent"}
          hoverArrowColor="#FFFFFF"
          size="md"
          rotation={180}
            disabled={!hasPrevious}
          className="!w-[24px] !h-[24px] !rounded-[6px]"
          useChevron={true}
          strokeWidth={1}
        />

        {/* Activity Dropdown */}
        <Select 
          value={String(currentTaskIndex)} 
          onValueChange={(val) => onTaskChange(parseInt(val))}
          >
          <SelectTrigger className="w-auto min-w-[300px] h-[28px] bg-white border-0 rounded-[5px] px-3 text-base font-proxima font-normal text-carbon-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tasks.map((task, index) => (
              <SelectItem key={task.id} value={String(index)}>
                <div className="flex items-center gap-2">
                  <span className="font-normal">{formatActivityNumber(index)}</span>
                  <span>{task.task_title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Activity Counter Fraction */}
        <span className="text-base font-proxima font-normal text-carbon-black">
          / {formatActivityNumber(tasks.length - 1)}
            </span>
            
        {/* Next Arrow */}
        <ArrowButton
            onClick={handleNext}
          borderColor={hasNext ? "#4242EA" : "#CCCCCC"}
          backgroundColor="transparent"
          arrowColor={hasNext ? "#4242EA" : "#CCCCCC"}
          hoverBackgroundColor={hasNext ? "#4242EA" : "transparent"}
          hoverArrowColor="#FFFFFF"
          size="md"
            disabled={!hasNext}
          className="!w-[24px] !h-[24px] !rounded-[6px]"
          useChevron={true}
          strokeWidth={1}
        />
        </div>

        {/* Right side - placeholder for balance */}
        <div className="w-24" />
    </div>
  );
};

export default ActivityHeader;
