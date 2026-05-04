import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-xl p-10 w-full max-w-sm">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-xs tracking-widest text-gray-400 uppercase">Article Space</span>
          </div>
          <h1 className="text-3xl font-medium text-black leading-tight mb-2">
            Your space.<br />Your articles.
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            A simple integrated web app using Supabase and Vercel.
          </p>
        </div>

        <hr className="border-gray-100 mb-6" />

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-black text-white rounded-md py-2.5 px-4 text-sm font-medium flex items-center justify-between hover:bg-gray-900 transition"
          >
            <span>User login / signup</span>
            <span>→</span>
          </Link>
          <Link
            href="/admin-login"
            className="w-full bg-white text-gray-400 border border-gray-100 rounded-md py-2.5 px-4 text-sm flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span>Admin login</span>
            <span>→</span>
          </Link>
        </div>

        <p className="text-xs text-gray-300 text-center mt-6 tracking-wide">
          Powered by Supabase · Vercel
        </p>

      </div>
    </div>
  );
}