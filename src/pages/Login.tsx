import React from 'react';
import { motion } from 'motion/react';
import { signIn } from '../lib/firebase';
import { Heart, ShieldCheck, LogIn } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية. يرجى المحاولة مرة أخرى والتأكد من إكمال الخطوات في النافذة المنبثقة.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore this one as it usually means another popup was opened
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول. يرجى التأكد من السماح بالنوافذ المنبثقة (Pop-ups) أو حاول فتح التطبيق في نافذة متصفح جديدة.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden" dir="rtl">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-full h-[50vh] bg-primary rounded-b-[100px] shadow-2xl shadow-primary/20 pointer-events-none"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg bg-white rounded-[48px] shadow-2xl shadow-slate-200 p-10 sm:p-16 relative z-10 border border-slate-100"
      >
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-primary-light rounded-[32px] flex items-center justify-center text-primary shadow-xl shadow-primary/10 border-4 border-white transform hover:rotate-12 transition-transform duration-500">
               <Heart className="w-12 h-12 fill-current" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-[42px] font-black text-slate-900 leading-none tracking-tight">منصة سند</h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">بوابتك للعطاء والمساندة المجتمعية. ساهم في تغيير حياة الآخرين بضغطة زر.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-6">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-4 py-5 px-6 bg-slate-900 text-white rounded-[24px] font-black text-lg transition-all hover:bg-slate-800 hover:-translate-y-1 shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <div className="bg-white p-1.5 rounded-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-right">الدخول بواسطة جوجل</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-6">
            <div className="space-y-2">
               <div className="text-primary font-black text-xl leading-none">١٠٠٠+</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">مستفيد</div>
            </div>
            <div className="space-y-2">
               <div className="text-primary font-black text-xl leading-none">٥٠٠+</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">داعم</div>
            </div>
            <div className="space-y-2">
               <div className="text-primary font-black text-xl leading-none">٩٨٪</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ثقة</div>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-300 font-bold leading-relaxed px-10">بالدخول للمنصة أنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بسند.</p>
        </div>
      </motion.div>
    </div>
  );
}
