"use client";

import { useState, useEffect, useRef } from "react";
import { onProjectsUpdate } from "@/lib/supabase-events";

export default function AdminClient() {
  const [projects, setProjects] = useState([]);
  const [group, setGroup] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [originalData, setOriginalData] = useState({});
  const [popup, setPopup] = useState({ type: "", id: null });
  const [submitUpdating, setSubmitUpdating] = useState(false);

  const [voteUpdatingId, setVoteUpdatingId] = useState(null);   // for vote buttons
  const [deleteUpdatingId, setDeleteUpdatingId] = useState(null); // for delete button

  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const cardRefs = useRef({});

  const NAVBAR_HEIGHT = 72;
  const TITLE_HEIGHT = 48;

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load projects");
      setProjects(json.data || []);
    } catch (err) {
      console.error("Load projects error:", err);
    }
  }

  useEffect(() => {
    loadProjects();
    const unsub = onProjectsUpdate(() => loadProjects());
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(editingId ? originalData.image_url || "" : "");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, editingId, originalData.image_url]);

  const scrollToOffsetTop = (el, extra = 0) => {
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT - extra;
    window.scrollTo({ top, behavior: "smooth" });
  };

  function startEdit(p) {
    setEditingId(p.id);
    setOriginalData(p);
    setGroup(p.group || "");
    setTitle(p.title || "");
    setDescription(p.description || "");
    setFile(null);
    setTimeout(() => scrollToOffsetTop(formRef.current, TITLE_HEIGHT + 16), 50);
  }

  function cancelEdit() {
    const prevEditingId = editingId;
    setEditingId(null);
    setOriginalData({});
    setGroup("");
    setTitle("");
    setDescription("");
    setFile(null);
    setPreviewUrl("");
    if (prevEditingId && cardRefs.current[prevEditingId]) {
      scrollToOffsetTop(cardRefs.current[prevEditingId]);
    }
  }

  async function deleteProject(id) {
    setPopup({ type: "delete", id });
  }

  async function confirmDelete(id) {
    setDeleteUpdatingId(id);
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setPopup({ type: "", id: null });
      await loadProjects();
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeleteUpdatingId(null);
    }
  }

  async function changeVote(id, delta) {
    setVoteUpdatingId(id);
    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote_delta: delta }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Vote update failed");
      await loadProjects();
    } catch (err) {
      alert(err.message || "Vote update failed");
    } finally {
      setVoteUpdatingId(null);
    }
  }

  async function uploadImage(selectedFile) {
    if (!selectedFile) return originalData.image_url || null;
    const formData = new FormData();
    formData.append("file", selectedFile);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    return json.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!group.trim() || !title.trim()) return alert("Group and title required");

    setSubmitUpdating(true);
    try {
      const image_url = file ? await uploadImage(file) : originalData.image_url || null;
      const payload = {};
      if (group !== originalData.group) payload.group = group.trim();
      if (title !== originalData.title) payload.title = title.trim();
      if (description !== originalData.description) payload.description = description.trim();
      if (image_url !== originalData.image_url) payload.image_url = image_url;

      const url = editingId ? `/api/projects?id=${editingId}` : "/api/projects";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      cancelEdit();
      await loadProjects();
    } catch (err) {
      alert(err.message || "Submit failed");
    } finally {
      setSubmitUpdating(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 ref={formRef} className="text-3xl font-bold text-red-500">Admin Panel</h1>

        <form onSubmit={handleSubmit} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Group</label>
              <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="e.g. 1" className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 cursor-pointer">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2 bg-black border border-zinc-700 rounded-xl hover:bg-zinc-900 cursor-pointer">Choose Image</button>
              {file && <p className="text-sm mt-2 text-gray-400">{file.name}</p>}
            </div>
            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 w-full overflow-hidden relative" style={{ aspectRatio: "16/9" }}>
              {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-gray-500">No image</div>}
            </div>
          </div>

          <div className="flex space-x-4">
            {editingId && <button type="button" onClick={cancelEdit} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold cursor-pointer">Cancel</button>}
            <button type="submit" disabled={submitUpdating} className="px-5 py-2 bg-red-700 hover:bg-red-600 rounded-xl font-semibold cursor-pointer">{submitUpdating ? (editingId ? "Updating..." : "Saving...") : (editingId ? "Update" : "Add Project")}</button>
          </div>
        </form>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          {projects.length === 0 ? <div className="text-gray-500">No projects yet.</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div key={p.id} ref={(el) => (cardRefs.current[p.id] = el)} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                  <div className="w-full relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    {p.image_url ? <img src={p.image_url} className="absolute inset-0 w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-gray-500">No image</div>}
                  </div>
                  <div className="p-4 flex flex-col flex-1 relative space-y-2">
                    <div className="text-xs text-red-500">Group {p.group}</div>
                    <div className="text-lg font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-400">{p.description}</div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-white">{p.vote_count ?? 0} votes</span>
                      <div className="flex space-x-2">
                        <button onClick={() => changeVote(p.id, 1)} disabled={voteUpdatingId === p.id} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold cursor-pointer">+1</button>
                        <button onClick={() => changeVote(p.id, -1)} disabled={voteUpdatingId === p.id} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold cursor-pointer">-1</button>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <button onClick={() => startEdit(p)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold cursor-pointer">Edit</button>
                      <button onClick={() => deleteProject(p.id)} disabled={deleteUpdatingId === p.id} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold cursor-pointer">{deleteUpdatingId === p.id ? "Processing..." : "Delete"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Delete Confirmation Popup */}
        {popup.type === "delete" && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-[90%] max-w-md text-center space-y-4">
              <h2 className="text-2xl font-extrabold text-red-500">Confirm Delete</h2>
              <p className="text-gray-400">Are you sure you want to delete this project?</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setPopup({ type: "", id: null })} className="flex-1 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 cursor-pointer">Cancel</button>
                <button onClick={() => confirmDelete(popup.id)} className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}