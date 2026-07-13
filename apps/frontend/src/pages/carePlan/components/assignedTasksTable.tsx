export type TaskItem = {
  task: string;
  freq: string;
  owner: string;
};

type AssignedTasksTableProps = {
  tasks: TaskItem[];
  onChange?: (tasks: TaskItem[]) => void;
};

export function AssignedTasksTable({ tasks, onChange }: AssignedTasksTableProps) {
  const handleTaskChange = (index: number, field: keyof TaskItem, value: string) => {
    if (!onChange) return;
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    onChange(newTasks);
  };

  const handleAdd = () => {
    if (onChange) onChange([...tasks, { task: "", freq: "Daily", owner: "CNA" }]);
  };

  const handleRemove = (index: number) => {
    if (onChange) onChange(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white overflow-hidden min-w-0">
      <div className="border-b border-slate-200 p-4 min-w-0 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-900 truncate">
          Assigned Tasks
        </h3>
        {onChange && (
          <button onClick={handleAdd} className="text-sm font-bold text-blue-600 hover:underline">
            + Add Task
          </button>
        )}
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap !min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 w-1/2">Task Description</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Frequency</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Owner</th>
              {onChange && <th className="px-4 py-3 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 && (
              <tr>
                <td colSpan={onChange ? 4 : 3} className="px-4 py-8 text-center text-slate-500 italic">
                  No tasks assigned yet.
                </td>
              </tr>
            )}
            {tasks.map((t, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  {onChange ? (
                    <input 
                      type="text" 
                      value={t.task} 
                      onChange={(e) => handleTaskChange(i, "task", e.target.value)}
                      className="w-full border-b border-slate-300 bg-transparent outline-none focus:border-blue-500" 
                      placeholder="E.g. Ambulation assist"
                    />
                  ) : t.task}
                </td>
                <td className="px-4 py-3">
                  {onChange ? (
                    <select 
                      value={t.freq}
                      onChange={(e) => handleTaskChange(i, "freq", e.target.value)}
                      className="w-full border-b border-slate-300 bg-transparent outline-none focus:border-blue-500"
                    >
                      <option value="q2h">q2h</option>
                      <option value="Each shift">Each shift</option>
                      <option value="Daily">Daily</option>
                      <option value="2x daily (AM/PM)">2x daily (AM/PM)</option>
                      <option value="Weekly">Weekly</option>
                      <option value="PRN">PRN</option>
                    </select>
                  ) : t.freq}
                </td>
                <td className="px-4 py-3">
                  {onChange ? (
                    <select 
                      value={t.owner}
                      onChange={(e) => handleTaskChange(i, "owner", e.target.value)}
                      className="w-full border-b border-slate-300 bg-transparent outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="CNA">CNA</option>
                      <option value="RN">RN</option>
                      <option value="LPN">LPN</option>
                      <option value="PT">PT</option>
                      <option value="Dietitian">Dietitian</option>
                    </select>
                  ) : <span className="font-bold">{t.owner}</span>}
                </td>
                {onChange && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleRemove(i)} className="text-red-400 hover:text-red-600 text-lg font-bold">×</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
