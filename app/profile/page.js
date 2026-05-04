"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setUsername(profileData.username || "");
      } else {
        setProfile({ email: user.email, full_name: "", username: "" });
      }

      const { data: articleData } = await supabase
        .from("articles").select("*").eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (articleData) setArticles(articleData);
    };
    getData();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, username, email: profile.email })
      .eq("id", user.id);
    setSaving(false);
    if (!error) {
      setProfile({ ...profile, full_name: fullName, username });
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to update: " + error.message);
    }
  };

  if (!user || !profile) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 font-sans">

      {/* NAVBAR */}
      <div className="flex justify-between items-center pb-5 border-b border-gray-100 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <span className="text-xs tracking-widest text-gray-400 uppercase">Article Space</span>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-black border border-gray-200 rounded-md px-3 py-1 hover:bg-gray-50 transition"
        >
          ← Dashboard
        </Link>
      </div>

      {/* PAGE TITLE */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-black">My Profile</h2>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-black outline-none focus:border-gray-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-black outline-none focus:border-gray-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Email (Locked)</label>
              <input
                value={profile.email}
                readOnly
                onClick={() => alert('To change your email, please contact the admin.\n\n📧 Email: manaayjerica@gmail.com\n📞 Contact: 09686336110')}
                className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-400 outline-none cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-400 border border-gray-100 rounded-md px-3 py-1.5 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white text-sm font-medium px-5 py-1.5 rounded-md hover:bg-gray-900 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Username</span>
              <span className="text-sm text-black font-medium">{profile.username || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Full Name</span>
              <span className="text-sm text-black font-medium">{profile.full_name || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Email</span>
              <span className="text-sm text-black font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-black border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-100 transition"
              >
                Edit profile
              </button>
            </div>
          </div>
        )}
        {message && (
          <p className="text-xs text-gray-500 text-center mt-4">{message}</p>
        )}
      </div>

      {/* MY ARTICLES */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium text-black">My articles ({articles.length})</h2>
      </div>

      <div className="flex flex-col gap-3">
        {articles.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-10">No articles yet.</p>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-black">{article.title}</span>
              <p className="text-xs text-gray-400 leading-relaxed">
                {article.content.substring(0, 100)}...
              </p>
              <span className="text-xs text-gray-300 mt-1">
                {new Date(article.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}