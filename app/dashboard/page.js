"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import ArticleCard from "../../components/ArticleCard";
import Link from "next/link";

const styles = {
  // Navbar
  navbarBorder: "border-b border-gray-100",
  brandDot: "w-2 h-2 bg-white rounded-full",
  brandText: "text-lg font-semibold tracking-widest text-white uppercase",
  adminBadge: "text-xs bg-black text-white px-2 py-0.5 rounded-full tracking-wide",
  userEmail: "text-sm text-gray-400",
  profileBtn: "text-sm text-white border border-gray-200 rounded-md px-4 py-1 hover:bg-gray-50 transition whitespace-nowrap min-w-fit",
  logoutBtn: "text-sm text-white border border-gray-100 rounded-md px-3 py-1 hover:bg-gray-50 transition",

  // Action bar
  sectionTitle: "text-lg font-medium text-black",
  publishBtn: "flex items-center gap-1.5 bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-900 transition",

  // Publish form
  formWrapper: "bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6 flex flex-col gap-3",
  formInput: "px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-black outline-none focus:border-gray-400 transition",
  formTextarea: "px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-black outline-none focus:border-gray-400 transition resize-y font-sans",
  fileDropzone: "border border-dashed border-gray-200 rounded-md p-4 text-center bg-white",
  fileLabel: "text-sm text-gray-400 cursor-pointer",
  fileRemoveBtn: "ml-3 text-xs text-red-400 hover:text-red-600",
  submitBtn: "bg-black text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-900 transition disabled:opacity-50",

  // Feed
  emptyState: "text-sm text-gray-300 text-center py-10",
};
// ================================

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [articles, setArticles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setUserRole(profile?.role || "user");
      const { data, error } = await supabase.from("articles").select(`*, profiles(username, full_name)`).order("created_at", { ascending: false });
      if (!error) setArticles(data);
    };
    getData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleArticleDeleted = (deletedId) => {
    setArticles((prev) => prev.filter((a) => a.id !== deletedId));
  };

  const handlePublish = async () => {
    if (!newTitle.trim() || !newContent.trim()) { alert("Please fill in both title and content."); return; }
    setPublishing(true);
    let file_url = null, file_name = null, file_type = null;
    if (selectedFile) {
      setUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('article-files').upload(fileName, selectedFile);
      setUploading(false);
      if (uploadError) { alert('File upload failed: ' + uploadError.message); setPublishing(false); return; }
      const { data: urlData } = supabase.storage.from('article-files').getPublicUrl(fileName);
      file_url = urlData.publicUrl;
      file_name = selectedFile.name;
      file_type = selectedFile.type;
    }
    const { data, error } = await supabase.from("articles").insert([{ title: newTitle, content: newContent, author_id: user.id, counter: 0, file_url, file_name, file_type }]).select(`*, profiles(username, full_name)`).single();
    setPublishing(false);
    if (!error) { setArticles((prev) => [data, ...prev]); setNewTitle(""); setNewContent(""); setSelectedFile(null); setShowForm(false); }
    else alert("Failed to publish: " + error.message);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 font-sans">

      {/* NAVBAR */}
      <div className={`flex justify-between items-center pb-5 ${styles.navbarBorder} mb-8`}>
        <div className="flex items-center gap-2">
          <div className={styles.brandDot}></div>
          <span className={styles.brandText}>Article Dome</span>
          {userRole === "admin" && (
            <span className={styles.adminBadge}>Admin</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={styles.userEmail}>{user.email}</span>
          <Link href="/profile" className={styles.profileBtn}>My Profile</Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex justify-between items-center mb-5">
        <h2 className={styles.sectionTitle}>Latest articles</h2>
        <button onClick={() => setShowForm(!showForm)} className={styles.publishBtn}>
          {showForm ? "✕ Cancel" : <><span className="text-base">+</span> Publish article</>}
        </button>
      </div>

      {/* PUBLISH FORM */}
      {showForm && (
        <div className={styles.formWrapper}>
          <input
            type="text"
            placeholder="Article title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className={styles.formInput}
          />
          <textarea
            placeholder="Write your article here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className={styles.formTextarea}
          />
          <div className={styles.fileDropzone}>
            <input type="file" id="file-upload" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <label htmlFor="file-upload" className={styles.fileLabel}>
              {selectedFile ? selectedFile.name : "Attach a file — image or document"}
            </label>
            {selectedFile && (
              <button onClick={() => setSelectedFile(null)} className={styles.fileRemoveBtn}>Remove</button>
            )}
          </div>
          <div className="flex justify-end">
            <button onClick={handlePublish} disabled={publishing || uploading} className={styles.submitBtn}>
              {uploading ? "Uploading..." : publishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      )}

      {/* FEED */}
      <div className="flex flex-col gap-3">
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              currentUserId={user.id}
              currentUserRole={userRole}
              onDeleted={handleArticleDeleted}
            />
          ))
        ) : (
          <p className={styles.emptyState}>No articles yet.</p>
        )}
      </div>
    </div>
  );
}