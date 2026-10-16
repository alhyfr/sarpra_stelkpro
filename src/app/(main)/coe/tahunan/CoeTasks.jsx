"use client";
import { useEffect, useState } from "react";
import api from "@/app/utils/Api";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import ADatePicker from "@/components/ADatePicker";
import Button from "@/components/Button";
import { ListTodo, Trash2, Plus } from "lucide-react";
import { useData } from "@/app/context/DataContext";
import dayjs from "dayjs";

const statusOptions = [
  { value: "todo", label: "Todo" },
  { value: "doing", label: "Doing" },
  { value: "done", label: "Done" },
  { value: "skip", label: "Skip" },
];

const statusColor = {
  todo: "bg-gray-100 text-gray-700",
  doing: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  skip: "bg-amber-100 text-amber-700",
};

export default function CoeTasks({ coe, onChanged }) {
  const { teams, getWaka } = useData();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    team_id: "",
    due_at: "",
    status: "todo",
    is_required: true,
  });

  useEffect(() => {
    getWaka();
  }, [getWaka]);

  const loadTasks = async () => {
    if (!coe?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/sp/coe/tahunan/${coe.id}/tasks`);
      if (res.data.status === "success") {
        setTasks(res.data.data || []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [coe?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Judul task wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/sp/coe/tahunan/${coe.id}/tasks`, {
        title: form.title,
        team_id: form.team_id || null,
        due_at: form.due_at || null,
        status: form.status,
        is_required: form.is_required,
      });
      setForm({
        title: "",
        team_id: "",
        due_at: "",
        status: "todo",
        is_required: true,
      });
      await loadTasks();
      if (onChanged) onChanged();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menambah task");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      await api.put(`/sp/coe/tahunan/tasks/${task.id}/status`, { status });
      await loadTasks();
      if (onChanged) onChanged();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengubah status task");
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`Hapus task "${task.title}"?`)) return;
    try {
      await api.delete(`/sp/coe/tahunan/tasks/${task.id}`);
      await loadTasks();
      if (onChanged) onChanged();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus task");
    }
  };

  const doneCount = tasks.filter((t) => t.status === "done" || t.status === "skip").length;
  const progress = tasks.length
    ? Math.round((doneCount / tasks.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="mb-1 text-sm font-medium text-gray-800">
          {coe?.kegiatan}
        </div>
        <div className="mb-2 text-xs text-gray-500">
          Progress: {progress}% ({doneCount}/{tasks.length} task)
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded-lg border p-3">
        <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Plus size={16} /> Tambah Task
        </div>
        <AInput
          id="title"
          icon={ListTodo}
          name="title"
          label="Judul Task"
          placeholder="Contoh: Persiapan ruang, dokumentasi, ..."
          value={form.title}
          onChange={handleChange}
          required
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ASelect
            id="team_id"
            name="team_id"
            label="Team (opsional)"
            placeholder="Pilih Team"
            value={form.team_id}
            onChange={handleChange}
            options={(teams || []).map((item) => ({
              value: String(item.id),
              label: item.nama || item.jabatan || `Team ${item.id}`,
            }))}
          />
          <ADatePicker
            id="due_at"
            name="due_at"
            label="Due Date"
            placeholder="Opsional"
            value={form.due_at}
            onChange={handleChange}
          />
          <ASelect
            id="status"
            name="status"
            label="Status"
            value={form.status}
            onChange={handleChange}
            options={statusOptions}
          />
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="is_required"
              checked={!!form.is_required}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            Wajib diselesaikan
          </label>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Tambah Task"}
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-gray-500">Memuat task...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-500">
            Belum ada task. Tambahkan checklist pelaksanaan di atas.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-800">{task.title}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                  {task.team_name && <span>Team: {task.team_name}</span>}
                  {task.due_at && (
                    <span>Due: {dayjs(task.due_at).format("DD-MM-YYYY")}</span>
                  )}
                  {task.is_required ? (
                    <span className="text-rose-600">Wajib</span>
                  ) : (
                    <span>Opsional</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className={`rounded-md border px-2 py-1 text-xs ${statusColor[task.status] || ""}`}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDelete(task)}
                  className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
