"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminClient() {
  const [group, setGroup] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [originalData, setOriginalData] = useState({});

  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Load projects
  async function load() {
    const res = await fetch("/api/projects", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) return alert(json.error);
    setProjects(json.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  // Image preview
  useEffect(() => {
    if (!file) {
      setPreviewUrl(editingId ? originalData.image_url || "" : "");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, editingId, originalData.image_url]);

  async function uploadImage(selectedFile) {
    if (!selectedFile) return originalData.image_url || null;
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    return json.url;
  }

  async function submit(e) {
    e.preventDefault();
    if (!group.trim() || !title.trim()) return alert("Group and title required");

    setLoading(true);

    try {
      const image_url = await uploadImage(file);

      const payload = {};
      if (group !== originalData.group) payload.group = group.trim();
      if (title !== originalData.title) payload.title = title.trim();
      if (description !== originalData.description) payload.description = description.trim();
      if (image_url !== originalData.image_url) payload.image_url = image_url;

      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/projects?id=${editingId}` : "/api/projects";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      setGroup("");
      setTitle("");
      setDescription("");
      setFile(null);
      setEditingId(null);
      setOriginalData({});
      if (fileInputRef.current) fileInputRef.current.value = "";

      await load();
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      alert(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id) {
    if (!confirm("Delete this project?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setOriginalData(p);
    setGroup(p.group);
    setTitle(p.title);
    setDescription(p.description);
    setFile(null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-red-500">Admin Panel</h1>

        <form
          ref={formRef}
          onSubmit={submit}
          className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Group</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300">Title</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 bg-black border border-zinc-700 rounded-xl hover:bg-zinc-900 cursor-pointer"
              >
                Choose Image
              </button>
              {file && <p className="text-sm mt-2 text-gray-400">{file.name}</p>}
            </div>

            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 w-full overflow-hidden relative" style={{ aspectRatio: "16/9" }}>
              {previewUrl ? (
                <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>
          </div>

          <button
            disabled={loading}
            className="px-5 py-2 bg-red-700 hover:bg-red-600 rounded-xl font-semibold cursor-pointer disabled:bg-zinc-700"
          >
            {loading ? "Saving..." : editingId ? "Update Project" : "Add Project"}
          </button>
        </form>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          {projects.length === 0 ? (
            <div className="text-gray-500">No projects yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-red-700/60 transition"
                >
                  <div className="w-full relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    {p.image_url ? (
                      <img src={p.image_url} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 relative">
                    <div className="text-xs text-red-500">Group {p.group}</div>
                    <div className="text-lg font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-400">{p.description}</div>

                    <div className="flex-1"></div>

                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => startEdit(p)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProject(p.id)}
                        disabled={deletingId === p.id}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold cursor-pointer disabled:bg-zinc-700"
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
