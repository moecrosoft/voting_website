"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminClient() {

    const [group, setGroup] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    async function load() {
        const res = await fetch("/api/projects", { cache: 'no-store'});
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
            setPreviewUrl('');
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file])

    async function uploadImage(selectedFile) {
        const formData = new FormData();
        formData.append('file',selectedFile);

        const res = await fetch('/api/upload',{
            method: 'POST',
            body: formData
        })

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Upload failed');

        return json.url;
    }

    async function submit(e) {
        e.preventDefault();

        if (!group.trim() || !title.trim()){
            alert('All fields required');
            return;
        }

        if (!file) {
            alert('Please choose an image file');
            return;
        }

        setLoading(true);

        try {
            const image_url = await uploadImage(file);

            const res = await fetch('/api/projects',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    group: group.trim(),
                    title: title.trim(),
                    description: description.trim(),
                    image_url
                })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Create project failed');

            setGroup('');
            setTitle('');
            setDescription('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            await load();
        } catch (e) {
            alert(e.message || 'something went wrong')
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-red-500">Admin Panel</h1>
            </div>

            {/* Create Project */}
            <form
                onSubmit={submit}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-gray-300">Group</label>
                    <input
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-700/50"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="e.g. 1"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-300">Title</label>
                    <input
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-700/50"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Project title"
                    />
                </div>
                </div>

                <div>
                <label className="text-sm text-gray-300">Description</label>
                <textarea
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-700/50"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description..."
                />
                </div>

                {/* Upload + Preview (SIDE BY SIDE) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Upload */}
                <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4">
                    <label className="text-sm text-gray-300 block mb-3">Project Image</label>

                    {/* Hidden file input */}
                    <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />

                    <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="
                        px-5 py-2 rounded-xl font-medium
                        bg-black text-white
                        border border-zinc-700
                        hover:bg-zinc-900 hover:border-zinc-500
                        active:scale-[0.98]
                        transition cursor-pointer
                        "
                    >
                        Choose Image
                    </button>

                    {file ? (
                        <button
                        type="button"
                        onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="
                            px-4 py-2 rounded-xl text-sm
                            border border-zinc-700 text-gray-300
                            hover:bg-zinc-900 hover:text-white
                            transition cursor-pointer
                        "
                        >
                        Remove
                        </button>
                    ) : null}
                    </div>

                    {file ? (
                    <p className="text-xs text-gray-400 mt-3 truncate">Selected: {file.name}</p>
                    ) : (
                    <p className="text-xs text-gray-500 mt-3">No file selected</p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">Tip: JPG/PNG works best.</p>
                </div>

                {/* Preview */}
                <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-300">Preview</div>
                    <div className="text-xs text-gray-500">Auto</div>
                    </div>

                    {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={previewUrl}
                        alt="preview"
                        className="w-full h-44 object-contain rounded-xl border border-zinc-800 bg-black"
                    />
                    ) : (
                    <div className="text-gray-500 text-sm h-44 flex items-center justify-center rounded-xl border border-dashed border-zinc-800">
                        No image selected
                    </div>
                    )}
                </div>
                </div>

                <button
                disabled={loading}
                className={`w-full md:w-auto px-5 py-2 rounded-xl font-semibold transition cursor-pointer ${
                    loading
                    ? "bg-zinc-700 cursor-not-allowed"
                    : "bg-red-700 hover:bg-red-600 active:scale-[0.99]"
                }`}
                >
                {loading ? "Saving..." : "Add Project"}
                </button>
            </form>

            {/* Projects List */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Projects</h2>

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
                            hover:shadow-lg hover:shadow-red-900/20
                            transition-all duration-200
                        "
                        >
                        {/* Square image */}
                        <div className="aspect-square bg-black border-b border-zinc-800 flex items-center justify-center">
                            {p.image_url ? (
                            <img
                                src={p.image_url}
                                alt={p.title}
                                className="w-full h-full object-contain"
                            />
                            ) : (
                            <span className="text-gray-600 text-sm">No image</span>
                            )}
                        </div>

                        {/* Text section */}
                        <div className="p-4 space-y-2">
                            <div className="text-xs font-medium text-red-500 uppercase tracking-wide">
                            Group {p.group}
                            </div>

                            <div className="text-lg font-semibold text-white leading-tight">
                            {p.title}
                            </div>

                            <div className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                            {p.description}
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
