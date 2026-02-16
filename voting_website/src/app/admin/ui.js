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

  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  async function load() {
    const res = await fetch("/api/projects", { cache: "no-store" });
    const json = await res.json();

    if (!res.ok) {
      alert(json.error);
      return;
    }

    setProjects(json.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function uploadImage(selectedFile) {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");

    return json.url;
  }

  async function submit(e) {
    e.preventDefault();

    if (!group.trim() || !title.trim()) {
      alert("All fields required");
      return;
    }

    if (!file) {
      alert("Please choose an image file");
      return;
    }

    setLoading(true);

    try {
      const image_url = await uploadImage(file);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: group.trim(),
          title: title.trim(),
          description: description.trim(),
          image_url,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create project failed");

      setGroup("");
      setTitle("");
      setDescription("");
      setFile(null);

      if (fileInputRef.current) fileInputRef.current.value = "";

      await load();
    } catch (e) {
      alert(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id) {

    setDeletingId(id);

    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Delete failed");

      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <h1 className="text-3xl font-bold text-red-500">Admin Panel</h1>

        {/* Create Project Form */}
        <form
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

          {/* Upload */}
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

              {file && (
                <p className="text-sm mt-2 text-gray-400">
                  {file.name}
                </p>
              )}
            </div>

            {/* Preview */}
            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  className="w-full h-44 object-contain"
                />
              ) : (
                <div className="h-44 flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>

          </div>

          <button
            disabled={loading}
            className="px-5 py-2 bg-red-700 hover:bg-red-600 rounded-xl font-semibold cursor-pointer disabled:bg-zinc-700"
          >
            {loading ? "Saving..." : "Add Project"}
          </button>

        </form>

        {/* Projects List */}
        <section className="space-y-4">

          <h2 className="text-xl font-semibold">Projects</h2>

          {projects.length === 0 ? (
            <div className="text-gray-500">No projects yet.</div>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {projects.map((p) => (

                <div
                  key={p.id}
                  className="
                    bg-zinc-900 border border-zinc-800
                    rounded-2xl overflow-hidden
                    hover:border-red-700/60
                    transition
                    flex flex-col
                  "
                >

                  {/* Image */}
                  <div className="aspect-square bg-black border-b border-zinc-800 flex items-center justify-center">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-600">
                        No image
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">

                    <div className="text-xs text-red-500">
                      Group {p.group}
                    </div>

                    <div className="text-lg font-semibold">
                      {p.title}
                    </div>

                    <div className="text-sm text-gray-400">
                      {p.description}
                    </div>

                    {/* Push button down */}
                    <div className="flex-1"></div>

                    {/* Delete button bottom right */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => deleteProject(p.id)}
                        disabled={deletingId === p.id}
                        className="
                          px-4 py-2
                          bg-red-600 hover:bg-red-700
                          rounded-lg
                          text-sm font-semibold
                          cursor-pointer
                          disabled:bg-zinc-700
                        "
                      >
                        {deletingId === p.id
                          ? "Deleting..."
                          : "Delete"}
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
