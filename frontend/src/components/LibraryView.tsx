import { useEffect, useState } from "react";
import * as api from "../api";
import { TASK_COMPLETE, TASK_FAILED, type TaskInfo } from "../types";

export default function LibraryView() {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.getTasks(1, 50);
      setTasks(res.tasks || []);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const handleDelete = async (taskId: string) => {
    if (!confirm("Xóa video này? Hành động không thể hoàn tác.")) return;
    try {
      await api.deleteTask(taskId);
      setTasks((ts) => ts.filter((t) => t.task_id !== taskId));
    } catch (e: any) {
      alert(`Xóa thất bại: ${e.message}`);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-zinc-500">Đang tải...</div>
    );

  if (error)
    return (
      <div className="glass p-6 text-sm text-red-400">
        ⚠️ Không tải được danh sách: {error}
      </div>
    );

  if (tasks.length === 0)
    return (
      <div className="glass p-16 text-center text-zinc-500">
        <div className="text-5xl mb-3 opacity-50">📭</div>
        <p>Chưa có video nào. Qua tab "Tạo video" để bắt đầu!</p>
        <p className="text-xs mt-2 text-zinc-600">
          Lưu ý: danh sách task lưu trong bộ nhớ, restart backend sẽ mất lịch
          sử (file video vẫn còn trong thư mục storage/tasks).
        </p>
      </div>
    );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tasks.map((t) => (
        <TaskCard key={t.task_id} task={t} onDelete={handleDelete} />
      ))}
    </div>
  );
}

function TaskCard({
  task,
  onDelete,
}: {
  task: TaskInfo;
  onDelete: (id: string) => void;
}) {
  const video = task.videos?.[0];
  const isDone = task.state === TASK_COMPLETE;
  const isFailed = task.state === TASK_FAILED;

  return (
    <div className="glass overflow-hidden flex flex-col">
      <div className="aspect-[9/16] max-h-72 bg-black/60 flex items-center justify-center relative">
        {isDone && video ? (
          <video
            src={api.toStreamUrl(video)}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
          />
        ) : isFailed ? (
          <span className="text-3xl">❌</span>
        ) : (
          <div className="text-center">
            <div className="w-8 h-8 mx-auto border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-zinc-400 mt-2 font-mono">
              {task.progress ?? 0}%
            </div>
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isDone
              ? "bg-emerald-500/20 text-emerald-300"
              : isFailed
                ? "bg-red-500/20 text-red-300"
                : "bg-cyan-500/20 text-cyan-300"
          }`}
        >
          {isDone ? "Hoàn thành" : isFailed ? "Thất bại" : "Đang xử lý"}
        </span>
      </div>

      <div className="p-3 flex items-center justify-between gap-2">
        <span
          className="text-xs text-zinc-500 font-mono truncate"
          title={task.task_id}
        >
          {task.task_id.slice(0, 8)}
        </span>
        <div className="flex gap-1.5 shrink-0">
          {isDone && video && (
            <a
              href={api.toDownloadUrl(video)}
              download
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
              title="Tải về"
            >
              ⬇️
            </a>
          )}
          <button
            onClick={() => onDelete(task.task_id)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 transition"
            title="Xóa"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
