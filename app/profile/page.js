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
      } else {
        setProfile({ email: user.email, full_name: "" });
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
      .update({ full_name: fullName, email: profile.email })
      .eq("id", user.id);
    setSaving(false);
    if (!error) {
      setProfile({ ...profile, full_name: fullName });
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to update: " + error.message);
    }
  };

  if (!user || !profile) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>
  );

  return (
    <div className="w-[60%] mx-auto px-8 py-10 font-sans">

      {/* NAVBAR */}
      <div className="flex justify-between items-center pb-5 border-b border-white/20 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-lg font-semibold tracking-widest text-white uppercase">Article Dome</span>
        </div>
        <Link href="/dashboard" className="text-sm text-white border border-white/40 rounded-md px-3 py-1 hover:bg-white hover:text-black transition">
          ← Dashboard
        </Link>
      </div>

      {/* PAGE TITLE */}
      <h2 className="text-xl font-semibold text-white mb-6">My Profile</h2>

      {/* PROFILE CARD */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 uppercase tracking-widest">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-black outline-none focus:border-gray-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 uppercase tracking-widest">Email (Locked)</label>
              <input
                value={profile.email}
                readOnly
                onClick={() => alert('To change your email, please contact the admin.\n\n📧 Email: manaayjerica@gmail.com\n📞 Contact: 09686336110')}
                className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-400 outline-none cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition"
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
              <span className="text-xs text-gray-500 uppercase tracking-widest">Full Name</span>
              <span className="text-sm text-black font-medium">{profile.full_name || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs text-gray-500 uppercase tracking-widest">Email</span>
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
          <p className="text-xs text-green-500 text-center mt-4">{message}</p>
        )}
      </div>

      {/* MY ARTICLES */}
      <h2 className="text-lg font-semibold text-white mb-4">My articles ({articles.length})</h2>

      <div className="flex flex-col gap-3">
        {articles.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-10">No articles yet.</p>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
              <span className="text-sm font-semibold text-black">{article.title}</span>
              <p className="text-sm text-gray-600 leading-relaxed">
                {article.content.substring(0, 100)}...
              </p>
              <span className="text-xs text-gray-400 mt-1">
                {new Date(article.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}