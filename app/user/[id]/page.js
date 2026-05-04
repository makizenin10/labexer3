"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserProfile() {
  const params = useParams();
  const id = params?.id;
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const getData = async () => {
      const { data: profileData, error } = await supabase
        .from("profiles").select("*").eq("id", id).single();
      if (error) console.error("Profile error:", error.message);
      if (profileData) setProfile(profileData);

      const { data: articleData } = await supabase
        .from("articles").select("*").eq("author_id", id)
        .order("created_at", { ascending: false });
      if (articleData) setArticles(articleData);
      setLoading(false);
    };
    getData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      Loading...
    </div>
  );
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      User not found.
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

      {/* PROFILE CARD */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
        <div className="pb-4 mb-4 border-b border-gray-100">
          <h1 className="text-lg font-medium text-black">
            {profile.full_name || profile.username || "Unknown User"}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">@{profile.username || "user"}</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Email</span>
          <span className="text-sm text-black font-medium">{profile.email}</span>
        </div>
      </div>

      {/* ARTICLES */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium text-black">
          Articles by {profile.full_name || profile.username} ({articles.length})
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {articles.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-10">No articles published yet.</p>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-black">{article.title}</span>
              <p className="text-xs text-gray-400 leading-relaxed">
                {article.content.substring(0, 150)}...
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