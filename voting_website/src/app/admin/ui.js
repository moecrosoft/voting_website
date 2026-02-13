'use client';

import { useEffect, useState } from 'react';

export default function AdminClient() {
    const [group, setGroup] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [projects, setProjects] = useState([]);

    async function load() {
        const res = await fetch ('/api/projects');
        const json = await res.json();
        if (!res.ok) return alert(json.error);
        setProjects(json.data);
    }

    useEffect(() => { load() ;}, []);

    async function submit(e) {
        e.preventDefault();

        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ group, title, description, image_url: imageUrl })
        });

        const json = await res.json();
        if (!res.ok) return alert(json.error);

        setGroup(''); setTitle(''); setDescription(''); setImageUrl('');
        await load();
        alert('Project Added!');
    }

    return (
        <main className='p-6'>
            <h1 className='text-red-600 mb-4'>Admin</h1>

            <form onSubmit={submit} className='grid gap-3 max-w-lg'>
                <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder='Group' required />
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Title' required />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Description' required />
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder='Image URL'/>
                <button className='bg-red-600 text-white py-2 rounded cursor-pointer' type='submit'>Add</button>
            </form>

            <hr className = 'my-6' />
            <div className='grid gap-3'>
                {projects.map(p => (
                    <div key={p.id} className='border rounded p-3'>
                        <b>{p.group}</b> - {p.title} | Votes: <b>{p.vote_count}</b>
                    </div>
                ))}
            </div>
        </main>
    )
}