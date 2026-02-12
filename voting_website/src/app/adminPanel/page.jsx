'use client'
import { useEffect } from "react";
import { useState } from "react";
import Credential from "./credential";
import NavBar from "@/components/navBar";

export default function AdminPanel() {
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        Credential()
    }, [])

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        e.preventDefault();
        console.log('Submitted:', { name, group, description, image });
        // Add your submission logic here
    };

    return (
        <div className="mx-auto bg-white">
            <NavBar/>

            <h1 className="text-red-600 mb-8">Admin Panel</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label htmlFor="image" className="block text-gray-700 mb-2">
                    Add Image
                </label>
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {imagePreview && (
                    <div className="mt-4">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs rounded-lg border border-gray-300"
                    />
                    </div>
                )}
                </div>

                <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter name"
                    required
                />
                </div>

                <div>
                <label htmlFor="group" className="block text-gray-700 mb-2">
                    Group
                </label>
                <input
                    id="group"
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter group"
                    required
                />
                </div>

                <div>
                <label htmlFor="description" className="block text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-32"
                    placeholder="Enter description"
                    required
                />
                </div>

                <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                Submit
                </button>
            </form>
        </div>
    );
}
