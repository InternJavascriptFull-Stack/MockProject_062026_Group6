export function AssignedTasksTable() {
  const tasks = [
    { task: "Ambulation assist", freq: "2x daily (AM/PM)", owner: "CNA" },
    { task: "Reposition + skin check", freq: "q2h", owner: "CNA" },
    { task: "Fluid intake monitoring", freq: "Each shift", owner: "CNA" },
  ];

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white overflow-hidden min-w-0">
      <div className="border-b border-slate-200 p-4 min-w-0">
        <h3 className="font-bold text-slate-900 truncate">
          Assigned Tasks (generated on activation)
        </h3>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap !min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Task</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Frequency</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((t, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-slate-700">{t.task}</td>
                <td className="px-4 py-3 text-slate-600">{t.freq}</td>
                <td className="px-4 py-3 text-slate-600">{t.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
